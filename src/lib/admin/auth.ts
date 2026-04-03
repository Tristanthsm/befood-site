import "server-only";

import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseServiceRoleClient } from "@/lib/supabase/service-role";

export interface AdminAccessContext {
  userId: string | null;
  email: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

interface ProfileAdminRow {
  is_admin?: boolean | null;
  email?: string | null;
}

async function readAdminProfileWithFallback(userId: string): Promise<ProfileAdminRow | null> {
  try {
    const serviceRole = getSupabaseServiceRoleClient();
    const { data, error } = await serviceRole
      .from("profiles")
      .select("is_admin,email")
      .eq("id", userId)
      .maybeSingle();

    if (!error && data) {
      return data as ProfileAdminRow;
    }
  } catch {
    // Fallback below if service role is unavailable in the environment.
  }

  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("is_admin,email")
    .eq("id", userId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data as ProfileAdminRow;
}

export async function getAdminAccessContext(): Promise<AdminAccessContext> {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.id) {
    return {
      userId: null,
      email: null,
      isAuthenticated: false,
      isAdmin: false,
    };
  }

  const profile = await readAdminProfileWithFallback(user.id);
  const email = typeof profile?.email === "string" && profile.email.trim()
    ? profile.email.trim()
    : (user.email?.trim() ?? null);

  return {
    userId: user.id,
    email,
    isAuthenticated: true,
    isAdmin: profile?.is_admin === true,
  };
}

export async function getIsAdminForUserId(userId: string): Promise<boolean> {
  const profile = await readAdminProfileWithFallback(userId);
  return profile?.is_admin === true;
}
