import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";

const baseUrl = process.env.BEFOOD_BASE_URL?.trim() || "http://localhost:3100";
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY?.trim();

if (!supabaseUrl || !anonKey || !serviceRoleKey) {
  throw new Error("Missing Supabase env variables for contract verification script.");
}

const service = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const runId = `${Date.now()}`;
const password = "BefoodContractV12026";

const adminIdentity = {
  email: `admin.contract.v1.${runId}@befood-test.fr`,
  displayName: `Admin Contract ${runId}`,
  isAdmin: true,
};
const coachIdentity = {
  email: `coach.contract.v1.${runId}@befood-test.fr`,
  displayName: `Coach Contract ${runId}`,
  isAdmin: false,
};

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function createUser(identity) {
  const { data, error } = await service.auth.admin.createUser({
    email: identity.email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: identity.displayName,
    },
  });

  if (error) {
    throw new Error(`createUser(${identity.email}) failed: ${error.message}`);
  }

  const user = data.user;
  if (!user?.id) {
    throw new Error(`createUser(${identity.email}) returned no user id`);
  }

  const { error: upsertError } = await service
    .from("profiles")
    .upsert({
      id: user.id,
      email: identity.email,
      display_name: identity.displayName,
      is_admin: identity.isAdmin,
    }, { onConflict: "id" });

  if (upsertError) {
    throw new Error(`profiles upsert failed for ${identity.email}: ${upsertError.message}`);
  }

  return { id: user.id, ...identity };
}

function cookieStore() {
  const map = new Map();

  return {
    getAll() {
      return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
    },
    setAll(entries) {
      for (const { name, value } of entries) {
        map.set(name, value);
      }
    },
    toHeader() {
      return Array.from(map.entries())
        .map(([name, value]) => `${name}=${value}`)
        .join("; ");
    },
  };
}

async function signInAndGetCookie(email) {
  const store = cookieStore();
  const client = createServerClient(supabaseUrl, anonKey, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (entries) => store.setAll(entries),
    },
  });

  const { error } = await client.auth.signInWithPassword({ email, password });
  if (error) {
    throw new Error(`signIn failed for ${email}: ${error.message}`);
  }

  const cookieHeader = store.toHeader();
  if (!cookieHeader) {
    throw new Error(`No auth cookie generated for ${email}`);
  }

  return cookieHeader;
}

async function http(path, { method = "GET", cookie = null, body = null, contentType = null, redirect = "manual" } = {}) {
  const headers = { origin: baseUrl };
  if (cookie) headers.cookie = cookie;
  if (contentType) headers["content-type"] = contentType;

  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers,
    body,
    redirect,
  });

  const text = await response.text();
  return {
    status: response.status,
    location: response.headers.get("location"),
    text,
  };
}

async function setCoachRequest(userId, status = "pending") {
  const payload = {
    user_id: userId,
    full_name: "Coach Contract E2E",
    certification: "Profil: coach",
    profile_type: "coach",
    activity: "Accompagnement nutrition",
    expertise: "Dieteticien",
    audience: "Instagram 12k",
    motivation: "Accompagner des utilisateurs BeFood",
    status,
    admin_note: null,
    admin_message: null,
  };

  const { data, error } = await service
    .from("coach_requests")
    .upsert(payload, { onConflict: "user_id" })
    .select("id")
    .single();

  if (error || !data?.id) {
    throw new Error(`setCoachRequest failed: ${error?.message || "missing id"}`);
  }

  return String(data.id);
}

async function getCoachRequestRow(requestId) {
  const { data, error } = await service
    .from("coach_requests")
    .select("id,status,contract_status,contract_version,contract_content_hash,contract_signed_at,contract_signed_email,contract_signature_type,contract_verified_at,contract_verified_by")
    .eq("id", requestId)
    .single();

  if (error || !data) {
    throw new Error(`getCoachRequestRow failed: ${error?.message || "not found"}`);
  }

  return data;
}

async function getContractEvents(requestId) {
  const { data, error } = await service
    .from("coach_request_contract_events")
    .select("event_type")
    .eq("coach_request_id", requestId)
    .order("occurred_at", { ascending: true });

  if (error) {
    throw new Error(`getContractEvents failed: ${error.message}`);
  }

  return (data ?? []).map((row) => String(row.event_type ?? ""));
}

const results = {
  admin_approval_to_prepare: "KO",
  contract_mark_sent: "KO",
  coach_sign_contract: "KO",
  admin_verify_contract: "KO",
  audit_trail: "KO",
  idempotent_double_sign: "KO",
  notes: [],
};

try {
  const [admin, coach] = await Promise.all([
    createUser(adminIdentity),
    createUser(coachIdentity),
  ]);

  const requestId = await setCoachRequest(coach.id, "pending");

  const [adminCookie, coachCookie] = await Promise.all([
    signInAndGetCookie(admin.email),
    signInAndGetCookie(coach.email),
  ]);

  const approveBody = new URLSearchParams({ status: "approved", redirectTo: `/admin/coachs/${requestId}` });
  const approveResp = await http(`/api/admin/coach-requests/${requestId}/status`, {
    method: "POST",
    cookie: adminCookie,
    body: approveBody.toString(),
    contentType: "application/x-www-form-urlencoded",
  });
  assert(approveResp.status === 303, `Expected 303 on approve, got ${approveResp.status}`);

  const rowAfterApprove = await getCoachRequestRow(requestId);
  assert(
    rowAfterApprove.status === "to_prepare" || rowAfterApprove.status === "approved",
    `Expected to_prepare or approved after approve, got ${rowAfterApprove.status}`,
  );

  if (rowAfterApprove.status !== "to_prepare") {
    throw new Error("Contract schema not applied on database (status to_prepare unavailable).");
  }

  assert(rowAfterApprove.contract_status === "to_prepare", `Expected contract_status to_prepare, got ${rowAfterApprove.contract_status}`);
  assert(typeof rowAfterApprove.contract_content_hash === "string" && rowAfterApprove.contract_content_hash.length === 64, "Missing contract hash after prepare");
  results.admin_approval_to_prepare = "OK";

  const markSentBody = new URLSearchParams({ action: "mark_sent", redirectTo: `/admin/coachs/${requestId}` });
  const markSentResp = await http(`/api/admin/coach-requests/${requestId}/contract`, {
    method: "POST",
    cookie: adminCookie,
    body: markSentBody.toString(),
    contentType: "application/x-www-form-urlencoded",
  });
  assert(markSentResp.status === 303, `Expected 303 on mark_sent, got ${markSentResp.status}`);

  const rowAfterSent = await getCoachRequestRow(requestId);
  assert(rowAfterSent.status === "sent", `Expected sent status, got ${rowAfterSent.status}`);
  assert(rowAfterSent.contract_status === "sent", `Expected contract_status sent, got ${rowAfterSent.contract_status}`);
  results.contract_mark_sent = "OK";

  const coachContractPage = await http("/espace-coach/contrat", { cookie: coachCookie });
  assert(coachContractPage.status === 200, `Expected 200 for coach contract page, got ${coachContractPage.status}`);
  assert(coachContractPage.text.includes("Signer le contrat"), "Contract page should show signing action when sent");

  const signBody = new URLSearchParams({
    redirectTo: "/espace-coach/contrat",
    signature_type: "typed",
    signature_typed: "Coach Contract Signature",
    contract_consent: "on",
  });
  const signResp = await http("/api/coach-contract/sign", {
    method: "POST",
    cookie: coachCookie,
    body: signBody.toString(),
    contentType: "application/x-www-form-urlencoded",
  });
  assert(signResp.status === 303, `Expected 303 on contract sign, got ${signResp.status}`);

  const rowAfterSign = await getCoachRequestRow(requestId);
  assert(rowAfterSign.status === "signed_pending_verification", `Expected signed_pending_verification, got ${rowAfterSign.status}`);
  assert(rowAfterSign.contract_status === "signed_pending_verification", `Expected contract_status signed_pending_verification, got ${rowAfterSign.contract_status}`);
  assert(rowAfterSign.contract_signed_at, "Missing contract_signed_at");
  assert(rowAfterSign.contract_signed_email === coach.email, `Expected signed email ${coach.email}, got ${rowAfterSign.contract_signed_email}`);
  assert(rowAfterSign.contract_signature_type === "typed", `Expected signature type typed, got ${rowAfterSign.contract_signature_type}`);
  results.coach_sign_contract = "OK";

  const secondSignResp = await http("/api/coach-contract/sign", {
    method: "POST",
    cookie: coachCookie,
    body: signBody.toString(),
    contentType: "application/x-www-form-urlencoded",
  });
  assert(secondSignResp.status === 303, `Expected 303 on second sign attempt, got ${secondSignResp.status}`);
  const rowAfterSecondSign = await getCoachRequestRow(requestId);
  assert(rowAfterSecondSign.status === "signed_pending_verification", `Expected status unchanged after second sign, got ${rowAfterSecondSign.status}`);
  results.idempotent_double_sign = "OK";

  const verifyBody = new URLSearchParams({ action: "verify", redirectTo: `/admin/coachs/${requestId}` });
  const verifyResp = await http(`/api/admin/coach-requests/${requestId}/contract`, {
    method: "POST",
    cookie: adminCookie,
    body: verifyBody.toString(),
    contentType: "application/x-www-form-urlencoded",
  });
  assert(verifyResp.status === 303, `Expected 303 on verify, got ${verifyResp.status}`);

  const rowAfterVerify = await getCoachRequestRow(requestId);
  assert(rowAfterVerify.status === "verified", `Expected verified status, got ${rowAfterVerify.status}`);
  assert(rowAfterVerify.contract_status === "verified", `Expected contract_status verified, got ${rowAfterVerify.contract_status}`);
  assert(rowAfterVerify.contract_verified_at, "Missing contract_verified_at");
  assert(rowAfterVerify.contract_verified_by === admin.id, `Expected contract_verified_by=${admin.id}, got ${rowAfterVerify.contract_verified_by}`);
  results.admin_verify_contract = "OK";

  const events = await getContractEvents(requestId);
  assert(events.includes("prepared"), `Missing prepared event. Got: ${events.join(",")}`);
  assert(events.includes("sent"), `Missing sent event. Got: ${events.join(",")}`);
  assert(events.includes("signed"), `Missing signed event. Got: ${events.join(",")}`);
  assert(events.includes("verified"), `Missing verified event. Got: ${events.join(",")}`);
  results.audit_trail = "OK";
} catch (error) {
  results.notes.push(error instanceof Error ? error.message : String(error));
}

console.log(JSON.stringify(results, null, 2));
