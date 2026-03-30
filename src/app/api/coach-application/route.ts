import { NextResponse } from "next/server";

export const runtime = "edge";

type CoachApplicationPayload = {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  profileType?: string;
  activity?: string;
  expertise?: string;
  audience?: string;
  motivation?: string;
};

function clean(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null) as CoachApplicationPayload | null;

  if (!payload) {
    return NextResponse.json({ message: "Payload invalide." }, { status: 400 });
  }

  const firstName = clean(payload.firstName);
  const lastName = clean(payload.lastName);
  const email = clean(payload.email);
  const phone = clean(payload.phone);
  const profileType = clean(payload.profileType);
  const activity = clean(payload.activity);
  const expertise = clean(payload.expertise);
  const audience = clean(payload.audience);
  const motivation = clean(payload.motivation);

  if (!firstName || !lastName || !email || !profileType || !activity || !motivation) {
    return NextResponse.json({ message: "Merci de compléter les champs obligatoires." }, { status: 400 });
  }

  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) {
    return NextResponse.json(
      { message: "Envoi indisponible: RESEND_API_KEY non configurée côté serveur." },
      { status: 500 },
    );
  }

  const toEmail = process.env.COACH_APPLICATION_TO_EMAIL ?? "contact@befood.fr";
  const fromEmail = process.env.COACH_APPLICATION_FROM_EMAIL ?? "BeFood <onboarding@resend.dev>";

  const subject = `Nouvelle candidature BeFood - ${firstName} ${lastName}`;
  const lines = [
    "Nouvelle candidature BeFood",
    "",
    `Prénom: ${firstName}`,
    `Nom: ${lastName}`,
    `Email: ${email}`,
    `Téléphone: ${phone || "-"}`,
    `Profil principal: ${profileType}`,
    `Activité: ${activity}`,
    `Diplôme / expertise: ${expertise || "-"}`,
    `Audience: ${audience || "-"}`,
    "",
    "Motivation",
    motivation,
    "",
    `Date: ${new Date().toISOString()}`,
  ];

  const resendResponse = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: fromEmail,
      to: [toEmail],
      reply_to: email,
      subject,
      text: lines.join("\n"),
    }),
  });

  if (!resendResponse.ok) {
    const resendBody = await resendResponse.text();
    return NextResponse.json(
      { message: `Échec d'envoi email (${resendResponse.status}). ${resendBody}` },
      { status: 502 },
    );
  }

  return NextResponse.json({ message: "Candidature envoyée." }, { status: 200 });
}
