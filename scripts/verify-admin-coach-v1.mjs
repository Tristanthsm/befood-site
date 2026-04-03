import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";

const baseUrl = process.env.BEFOOD_BASE_URL?.trim() || "http://localhost:3100";
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY?.trim();

if (!supabaseUrl || !anonKey || !serviceRoleKey) {
  throw new Error("Missing Supabase env variables for verification script.");
}

const service = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const runId = `${Date.now()}`;
const password = "BefoodV1Admin2026";

const adminIdentity = {
  email: `admin.coach.v1.${runId}@befood-test.fr`,
  displayName: `Admin V1 ${runId}`,
  isAdmin: true,
};
const nonAdminIdentity = {
  email: `member.coach.v1.${runId}@befood-test.fr`,
  displayName: `Member V1 ${runId}`,
  isAdmin: false,
};
const coachIdentity = {
  email: `coach.coach.v1.${runId}@befood-test.fr`,
  displayName: `Coach V1 ${runId}`,
  isAdmin: false,
};

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
    full_name: "Coach E2E",
    certification: "Profil: coach",
    profile_type: "coach",
    activity: "Accompagnement nutrition",
    expertise: "Dieteticien",
    audience: "Instagram 10k",
    motivation: "Aider les utilisateurs BeFood",
    status,
    admin_note: null,
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
    .select("id,status,admin_note,admin_message,updated_by,updated_at")
    .eq("id", requestId)
    .single();

  if (error || !data) {
    throw new Error(`getCoachRequestRow failed: ${error?.message || "not found"}`);
  }

  return data;
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const results = {
  migration_applied: "OUI",
  ui_admin_visibility: "KO",
  access_non_connected: "KO",
  access_non_admin: "KO",
  access_admin: "KO",
  readonly_application_view: "KO",
  scenario_approved: "KO",
  scenario_changes_requested: "KO",
  scenario_rejected: "KO",
  scenario_resubmission_pending: "KO",
  scenario_resubmission_blocked_while_pending: "KO",
  notes: [],
};

try {
  const [admin, nonAdmin, coach] = await Promise.all([
    createUser(adminIdentity),
    createUser(nonAdminIdentity),
    createUser(coachIdentity),
  ]);

  const requestId = await setCoachRequest(coach.id, "pending");

  const [adminCookie, nonAdminCookie, coachCookie] = await Promise.all([
    signInAndGetCookie(admin.email),
    signInAndGetCookie(nonAdmin.email),
    signInAndGetCookie(coach.email),
  ]);

  const adminProfile = await http("/profil", { cookie: adminCookie });
  assert(adminProfile.status === 200, `Expected 200 for admin /profil, got ${adminProfile.status}`);
  assert(adminProfile.text.includes("Espace admin"), "Expected admin UI link on /profil for admin");
  const memberProfile = await http("/profil", { cookie: nonAdminCookie });
  assert(memberProfile.status === 200, `Expected 200 for member /profil, got ${memberProfile.status}`);
  assert(!memberProfile.text.includes("Espace admin"), "Expected no admin UI link on /profil for non-admin");
  results.ui_admin_visibility = "OK";

  const unauthList = await http("/admin/coachs");
  assert(unauthList.status >= 300 && unauthList.status < 400, `Expected redirect for unauth /admin/coachs, got ${unauthList.status}`);
  assert(unauthList.location?.includes("/connexion"), `Expected /connexion redirect, got ${unauthList.location}`);
  const unauthDetail = await http(`/admin/coachs/${requestId}`);
  assert(unauthDetail.status >= 300 && unauthDetail.status < 400, `Expected redirect for unauth detail, got ${unauthDetail.status}`);
  assert(unauthDetail.location?.includes("/connexion"), `Expected /connexion redirect detail, got ${unauthDetail.location}`);
  results.access_non_connected = "OK";

  const nonAdminList = await http("/admin/coachs", { cookie: nonAdminCookie });
  assert(nonAdminList.status >= 300 && nonAdminList.status < 400, `Expected redirect for non-admin /admin/coachs, got ${nonAdminList.status}`);
  assert(nonAdminList.location?.includes("/profil"), `Expected /profil redirect, got ${nonAdminList.location}`);
  const nonAdminDetail = await http(`/admin/coachs/${requestId}`, { cookie: nonAdminCookie });
  assert(nonAdminDetail.status >= 300 && nonAdminDetail.status < 400, `Expected redirect for non-admin detail, got ${nonAdminDetail.status}`);
  assert(nonAdminDetail.location?.includes("/profil"), `Expected /profil redirect detail, got ${nonAdminDetail.location}`);
  results.access_non_admin = "OK";

  const adminList = await http("/admin/coachs", { cookie: adminCookie });
  assert(adminList.status === 200, `Expected 200 for admin /admin/coachs, got ${adminList.status}`);
  assert(adminList.text.includes("Validation coachs"), "Expected admin page content marker missing");
  const adminDetail = await http(`/admin/coachs/${requestId}`, { cookie: adminCookie });
  assert(adminDetail.status === 200, `Expected 200 for admin detail, got ${adminDetail.status}`);
  assert(adminDetail.text.includes("Decision admin") || adminDetail.text.includes("Décision admin"), "Expected admin detail content marker missing");
  results.access_admin = "OK";

  const coachReadonlyBefore = await http("/espace-coach/candidature", { cookie: coachCookie });
  assert(coachReadonlyBefore.status === 200, `Expected 200 for /espace-coach/candidature, got ${coachReadonlyBefore.status}`);
  assert(coachReadonlyBefore.text.includes("lecture seule"), "Expected read-only marker on candidature review page");
  assert(coachReadonlyBefore.text.includes("Accompagnement nutrition"), "Expected persisted application content on read-only page");
  results.readonly_application_view = "OK";

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
    `Expected to_prepare or approved in DB, got ${rowAfterApprove.status}`,
  );
  assert(rowAfterApprove.updated_by === admin.id, "Expected updated_by to be admin id after approve");
  assert(rowAfterApprove.updated_at, "Expected updated_at after approve");
  const listAfterApprove = await http("/admin/coachs", { cookie: adminCookie });
  assert(!listAfterApprove.text.includes(requestId), "Approved request should be removed from pending admin list");
  const coachPageAfterApprove = await http("/espace-coach?tab=dossier", { cookie: coachCookie });
  assert(coachPageAfterApprove.status === 200, `Expected 200 coach dossier after approve, got ${coachPageAfterApprove.status}`);
  assert(coachPageAfterApprove.text.includes("Contrat à finaliser"), "Expected contract pending content after approval");
  results.scenario_approved = "OK";

  const internalNote = "Relance interne equipe admin";
  const coachMessage = "Merci de soumettre une nouvelle candidature avec les preuves de certification.";
  const changesBody = new URLSearchParams({
    status: "changes_requested",
    admin_note: internalNote,
    coach_message: coachMessage,
    redirectTo: `/admin/coachs/${requestId}`,
  });
  const changesResp = await http(`/api/admin/coach-requests/${requestId}/status`, {
    method: "POST",
    cookie: adminCookie,
    body: changesBody.toString(),
    contentType: "application/x-www-form-urlencoded",
  });
  assert(changesResp.status === 303, `Expected 303 on changes_requested, got ${changesResp.status}`);
  const rowAfterChanges = await getCoachRequestRow(requestId);
  assert(rowAfterChanges.status === "changes_requested", `Expected changes_requested in DB, got ${rowAfterChanges.status}`);
  assert(rowAfterChanges.admin_note === internalNote, `Expected admin note persisted, got ${rowAfterChanges.admin_note}`);
  assert(rowAfterChanges.admin_message === coachMessage, `Expected coach message persisted, got ${rowAfterChanges.admin_message}`);
  assert(rowAfterChanges.updated_by === admin.id, "Expected updated_by to be admin id after changes_requested");
  const listAfterChanges = await http("/admin/coachs", { cookie: adminCookie });
  assert(!listAfterChanges.text.includes(requestId), "Changes requested request should be removed from pending admin list");
  const coachPageAfterChanges = await http("/espace-coach?tab=dossier", { cookie: coachCookie });
  assert(coachPageAfterChanges.status === 200, `Expected 200 coach dossier after changes_requested, got ${coachPageAfterChanges.status}`);
  assert(coachPageAfterChanges.text.includes("Complément demandé"), "Expected changes_requested label on coach page");
  assert(coachPageAfterChanges.text.includes("Message BeFood"), "Expected coach message block on coach page");
  assert(coachPageAfterChanges.text.includes("preuves de certification"), "Expected coach message content on coach page");
  results.scenario_changes_requested = "OK";

  const rejectBody = new URLSearchParams({ status: "rejected", admin_note: "Profil non retenu en V1", redirectTo: `/admin/coachs/${requestId}` });
  const rejectResp = await http(`/api/admin/coach-requests/${requestId}/status`, {
    method: "POST",
    cookie: adminCookie,
    body: rejectBody.toString(),
    contentType: "application/x-www-form-urlencoded",
  });
  assert(rejectResp.status === 303, `Expected 303 on rejected, got ${rejectResp.status}`);
  const rowAfterRejected = await getCoachRequestRow(requestId);
  assert(rowAfterRejected.status === "rejected", `Expected rejected in DB, got ${rowAfterRejected.status}`);
  const listAfterRejected = await http("/admin/coachs", { cookie: adminCookie });
  assert(!listAfterRejected.text.includes(requestId), "Rejected request should be removed from pending admin list");
  const coachPageAfterRejected = await http("/espace-coach?tab=dossier", { cookie: coachCookie });
  assert(coachPageAfterRejected.status === 200, `Expected 200 coach dossier after rejected, got ${coachPageAfterRejected.status}`);
  assert(coachPageAfterRejected.text.includes("Non retenu"), "Expected rejected state label on coach page");
  results.scenario_rejected = "OK";

  const submitPayload = {
    firstName: "Coach",
    lastName: "V1",
    email: coach.email,
    phone: "0600000000",
    profileType: "coach",
    activity: "Accompagnement nutrition personnalisee",
    expertise: "Dieteticien diplome",
    audience: "Instagram 10k",
    motivation: "Accompagner des utilisateurs BeFood",
  };

  const resetToChanges = new URLSearchParams({ status: "changes_requested", admin_note: "Merci de completer", redirectTo: `/admin/coachs/${requestId}` });
  const resetResp = await http(`/api/admin/coach-requests/${requestId}/status`, {
    method: "POST",
    cookie: adminCookie,
    body: resetToChanges.toString(),
    contentType: "application/x-www-form-urlencoded",
  });
  assert(resetResp.status === 303, `Expected 303 on pre-reset to changes_requested, got ${resetResp.status}`);

  const resubmissionResp = await http("/api/coach-application", {
    method: "POST",
    cookie: coachCookie,
    body: JSON.stringify(submitPayload),
    contentType: "application/json",
  });
  assert(resubmissionResp.status === 200, `Expected 200 on coach resubmission, got ${resubmissionResp.status}. Body: ${resubmissionResp.text.slice(0, 300)}`);
  const rowAfterResubmit = await getCoachRequestRow(requestId);
  assert(rowAfterResubmit.status === "pending", `Expected pending after resubmission, got ${rowAfterResubmit.status}`);
  const coachPageAfterResubmit = await http("/espace-coach?tab=dossier", { cookie: coachCookie });
  assert(coachPageAfterResubmit.status === 200, `Expected 200 coach dossier after resubmission, got ${coachPageAfterResubmit.status}`);
  assert(coachPageAfterResubmit.text.includes("En cours de validation"), "Expected reviewing status after resubmission");
  results.scenario_resubmission_pending = "OK";

  const blockedResubmissionResp = await http("/api/coach-application", {
    method: "POST",
    cookie: coachCookie,
    body: JSON.stringify(submitPayload),
    contentType: "application/json",
  });
  assert(blockedResubmissionResp.status === 409, `Expected 409 on pending resubmission lock, got ${blockedResubmissionResp.status}`);
  const candidaturePageWhilePending = await http("/candidature-coachs", { cookie: coachCookie });
  assert(
    candidaturePageWhilePending.status >= 300 && candidaturePageWhilePending.status < 400,
    `Expected redirect from /candidature-coachs while pending, got ${candidaturePageWhilePending.status}`,
  );
  assert(
    candidaturePageWhilePending.location?.includes("/espace-coach/candidature"),
    `Expected /espace-coach/candidature redirect while pending, got ${candidaturePageWhilePending.location}`,
  );
  results.scenario_resubmission_blocked_while_pending = "OK";
} catch (error) {
  results.notes.push(error instanceof Error ? error.message : String(error));
}

console.log(JSON.stringify(results, null, 2));
