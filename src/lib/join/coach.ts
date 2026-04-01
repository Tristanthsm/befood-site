import type { SupabaseClient } from "@supabase/supabase-js";

export interface JoinCoach {
  userId: string;
  businessName: string;
  inviteCode: string;
}

export async function findCoachByInviteCode(
  supabase: SupabaseClient,
  coachCode: string,
): Promise<JoinCoach | null> {
  const { data, error } = await supabase
    .from("coach_profiles")
    .select("user_id,business_name,invite_code,is_verified,status,is_test")
    .eq("invite_code", coachCode)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  if (!data.is_verified || data.status !== "active" || Boolean(data.is_test)) {
    return null;
  }

  return {
    userId: String(data.user_id),
    businessName: String(data.business_name ?? "Coach BeFood"),
    inviteCode: String(data.invite_code ?? coachCode),
  };
}
