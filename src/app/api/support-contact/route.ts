import { NextResponse } from "next/server";

import { checkRateLimit } from "@/lib/security/rate-limit";

export const runtime = "edge";

type SupportContactPayload = {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  accountId?: string;
  message?: string;
};

function clean(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true;

  try {
    const requestUrl = new URL(request.url);
    return new URL(origin).origin === requestUrl.origin;
  } catch {
    return false;
  }
}

function hasInvalidLength(values: string[]): boolean {
  return values.some((value) => value.length > 3000);
}

export async function POST(request: Request) {
  const rateLimit = checkRateLimit(request, {
    keyPrefix: "support-contact",
    windowMs: 10 * 60 * 1000,
    maxRequests: 6,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { message: "Trop de tentatives. Merci de réessayer dans quelques minutes." },
      {
        status: 429,
        headers: {
          "Retry-After": String(rateLimit.retryAfterSeconds),
          "X-RateLimit-Limit": String(rateLimit.limit),
          "X-RateLimit-Remaining": String(rateLimit.remaining),
          "X-RateLimit-Reset": String(rateLimit.resetAt),
        },
      },
    );
  }

  if (!isSameOrigin(request)) {
    return NextResponse.json({ message: "Requête non autorisée." }, { status: 403 });
  }

  const payload = (await request.json().catch(() => null)) as SupportContactPayload | null;
  if (!payload) {
    return NextResponse.json({ message: "Payload invalide." }, { status: 400 });
  }

  const firstName = clean(payload.firstName);
  const lastName = clean(payload.lastName);
  const email = clean(payload.email);
  const phone = clean(payload.phone);
  const accountId = clean(payload.accountId);
  const message = clean(payload.message);

  if (!firstName || !lastName || !email || !message) {
    return NextResponse.json({ message: "Merci de compléter les champs obligatoires." }, { status: 400 });
  }

  if (!isValidEmail(email)) {
    return NextResponse.json({ message: "Adresse email invalide." }, { status: 400 });
  }

  if (hasInvalidLength([firstName, lastName, email, phone, accountId, message])) {
    return NextResponse.json({ message: "Contenu trop long." }, { status: 400 });
  }

  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) {
    return NextResponse.json(
      { message: "Envoi indisponible: RESEND_API_KEY non configurée côté serveur." },
      { status: 500 },
    );
  }

  const toEmail = process.env.SUPPORT_TO_EMAIL ?? "contact@befood.fr";
  const fromEmail = process.env.SUPPORT_FROM_EMAIL ?? "BeFood <contact@befood.fr>";

  const subject = `Nouvelle demande d'aide BeFood - ${firstName} ${lastName}`;
  const lines = [
    "Nouvelle demande d'aide BeFood",
    "",
    `Prénom: ${firstName}`,
    `Nom: ${lastName}`,
    `Email: ${email}`,
    `Téléphone: ${phone || "-"}`,
    `ID compte: ${accountId || "-"}`,
    "",
    "Message",
    message,
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
    let resendMessage = "";
    try {
      resendMessage = String((JSON.parse(resendBody) as { message?: unknown }).message ?? "");
    } catch {
      resendMessage = "";
    }

    console.error("[support-contact] resend error", {
      status: resendResponse.status,
      body: resendBody.slice(0, 300),
    });

    if (resendResponse.status === 403 && resendMessage.includes("verify a domain")) {
      return NextResponse.json(
        {
          message:
            "Resend est en mode test. Vérifiez un domaine dans Resend et utilisez une adresse d'envoi (FROM) de ce domaine.",
        },
        { status: 502 },
      );
    }

    return NextResponse.json(
      { message: "Échec d'envoi email. Merci de réessayer dans quelques minutes." },
      { status: 502 },
    );
  }

  return NextResponse.json({ message: "Demande envoyée." }, { status: 200 });
}
