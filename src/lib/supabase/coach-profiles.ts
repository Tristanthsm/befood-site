import "server-only";

import { hasSupabaseEnv } from "@/lib/supabase/env";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export interface PublicCoachProfile {
  userId: string;
  businessName: string;
  title: string | null;
  bio: string | null;
  imageUrl: string | null;
  referralLink: string | null;
  specialtyLabels: string[];
}

function toSpecialtyLabels(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (typeof item === "string") {
        return item.trim();
      }

      if (item && typeof item === "object" && "label" in item) {
        const candidate = (item as { label?: unknown }).label;
        if (typeof candidate === "string") {
          return candidate.trim();
        }
      }

      return "";
    })
    .filter(Boolean)
    .slice(0, 3);
}

export async function getPublicCoachProfiles(limit = 6): Promise<PublicCoachProfile[]> {
  if (!hasSupabaseEnv()) {
    return [];
  }

  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from("coach_profiles")
    .select("user_id,business_name,title,bio,image_url,referral_link,specialties")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[Supabase] Unable to load public coach profiles:", error.message);
    return [];
  }

  return (data ?? []).map((coach) => ({
    userId: String(coach.user_id),
    businessName: String(coach.business_name),
    title: coach.title,
    bio: coach.bio,
    imageUrl: coach.image_url,
    referralLink: coach.referral_link,
    specialtyLabels: toSpecialtyLabels(coach.specialties),
  }));
}
