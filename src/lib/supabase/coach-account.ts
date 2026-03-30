import "server-only";

import { hasSupabaseEnv } from "@/lib/supabase/env";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export interface CoachAccountSummary {
  userId: string;
  businessName: string;
  title: string | null;
  bio: string | null;
  imageUrl: string | null;
  inviteCode: string | null;
  socials: Record<string, unknown>;
  specialties: unknown[];
  status: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
  stats: Record<string, unknown>;
}

function toObject(value: unknown): Record<string, unknown> {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }

  return {};
}

export async function getCoachAccountSummary(userId: string): Promise<CoachAccountSummary | null> {
  if (!hasSupabaseEnv()) {
    return null;
  }

  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from("coach_profiles")
    .select(
      "user_id,business_name,title,bio,image_url,invite_code,socials,specialties,status,is_verified,created_at,updated_at,stats",
    )
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return {
    userId: String(data.user_id),
    businessName: String(data.business_name ?? "Coach BeFood"),
    title: data.title ?? null,
    bio: data.bio ?? null,
    imageUrl: data.image_url ?? null,
    inviteCode: data.invite_code ?? null,
    socials: toObject(data.socials),
    specialties: Array.isArray(data.specialties) ? data.specialties : [],
    status: String(data.status ?? "pending"),
    isVerified: Boolean(data.is_verified),
    createdAt: String(data.created_at ?? ""),
    updatedAt: String(data.updated_at ?? ""),
    stats: toObject(data.stats),
  };
}
