import type { Metadata } from "next";

import { JoinPageClient } from "@/components/join/join-page-client";
import { createPageMetadata } from "@/lib/seo";
import { findCoachByInviteCode } from "@/lib/join/coach";
import { parseJoinContextFromSearchParams, toUrlSearchParams } from "@/lib/join/params";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = createPageMetadata({
  title: "Rejoindre BeFood",
  description: "Point d'entrée web pour rejoindre l'application BeFood avec attribution coach et suivi de clic.",
  path: "/join",
  noIndex: true,
});

interface JoinPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function JoinPage({ searchParams }: JoinPageProps) {
  const resolvedSearchParams = await searchParams;
  const context = parseJoinContextFromSearchParams(toUrlSearchParams(resolvedSearchParams));

  let initialCoach: { businessName: string; coachCode: string } | null = null;

  if (context.coachCode && hasSupabaseEnv()) {
    try {
      const supabase = await getSupabaseServerClient();
      const coach = await findCoachByInviteCode(supabase, context.coachCode);
      if (coach) {
        initialCoach = {
          businessName: coach.businessName,
          coachCode: coach.inviteCode,
        };
      }
    } catch {
      initialCoach = null;
    }
  }

  return <JoinPageClient initialContext={context} initialCoach={initialCoach} />;
}
