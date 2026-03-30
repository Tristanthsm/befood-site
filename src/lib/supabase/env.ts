const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? "";

export function hasSupabaseEnv(): boolean {
  return Boolean(supabaseUrl && supabaseAnonKey);
}

export function getSupabaseEnv(): { url: string; anonKey: string } {
  if (!hasSupabaseEnv()) {
    throw new Error(
      "Missing Supabase env variables: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY",
    );
  }

  return {
    url: supabaseUrl,
    anonKey: supabaseAnonKey,
  };
}
