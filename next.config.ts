import type { NextConfig } from "next";

function normalizeUrlOrigin(rawValue: string): string | null {
  const trimmed = rawValue.trim();
  if (!trimmed) {
    return null;
  }

  const withProtocol = /^https?:\/\//.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    return new URL(withProtocol).origin;
  } catch {
    return null;
  }
}

function buildPosthogConnectOrigins(): string[] {
  const hostOrigin = normalizeUrlOrigin(process.env.NEXT_PUBLIC_POSTHOG_HOST?.trim() ?? "");
  if (!hostOrigin) {
    return [];
  }

  const origins = new Set<string>([hostOrigin]);

  if (hostOrigin.includes("://us.i.posthog.com")) {
    origins.add(hostOrigin.replace("://us.i.posthog.com", "://us.posthog.com"));
  } else if (hostOrigin.includes("://eu.i.posthog.com")) {
    origins.add(hostOrigin.replace("://eu.i.posthog.com", "://eu.posthog.com"));
  } else if (hostOrigin.includes("://us.posthog.com")) {
    origins.add(hostOrigin.replace("://us.posthog.com", "://us.i.posthog.com"));
  } else if (hostOrigin.includes("://eu.posthog.com")) {
    origins.add(hostOrigin.replace("://eu.posthog.com", "://eu.i.posthog.com"));
  } else if (hostOrigin.includes("://i.posthog.com")) {
    origins.add(hostOrigin.replace("://i.posthog.com", "://us.i.posthog.com"));
    origins.add(hostOrigin.replace("://i.posthog.com", "://us.posthog.com"));
  }

  for (const origin of Array.from(origins)) {
    if (origin.includes("://us.i.posthog.com") || origin.includes("://us.posthog.com") || origin.includes("://i.posthog.com")) {
      origins.add("https://us-assets.i.posthog.com");
    }
    if (origin.includes("://eu.i.posthog.com") || origin.includes("://eu.posthog.com")) {
      origins.add("https://eu-assets.i.posthog.com");
    }
  }

  return Array.from(origins);
}

function buildContentSecurityPolicy() {
  const supabaseOrigin = normalizeUrlOrigin(process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "");
  const posthogOrigins = buildPosthogConnectOrigins();
  const connectSources = new Set([
    "'self'",
    "https://www.googletagmanager.com",
    "https://*.google-analytics.com",
    "https://vitals.vercel-insights.com",
    "https://*.supabase.co",
    "wss://*.supabase.co",
  ]);
  const scriptSources = new Set([
    "'self'",
    "'unsafe-inline'",
    "https://www.googletagmanager.com",
  ]);

  if (supabaseOrigin) {
    connectSources.add(supabaseOrigin);
  }
  for (const origin of posthogOrigins) {
    connectSources.add(origin);
    scriptSources.add(origin);
  }

  const directives = [
    "default-src 'self'",
    "base-uri 'self'",
    "frame-ancestors 'none'",
    "object-src 'none'",
    "form-action 'self'",
    `script-src ${Array.from(scriptSources).join(" ")}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    `connect-src ${Array.from(connectSources).join(" ")}`,
    "frame-src 'none'",
    "manifest-src 'self'",
    "worker-src 'self' blob:",
    "upgrade-insecure-requests",
  ];

  return directives.join("; ");
}

const contentSecurityPolicy = buildContentSecurityPolicy();

const nextConfig: NextConfig = {
  trailingSlash: false,
  turbopack: {
    root: process.cwd(),
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Content-Security-Policy", value: contentSecurityPolicy },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=()",
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/confidentialite",
        destination: "/privacy",
        permanent: true,
      },
      {
        source: "/conditions",
        destination: "/terms",
        permanent: true,
      },
      {
        source: "/support",
        destination: "/aide",
        permanent: true,
      },
      {
        source: "/blog",
        destination: "/guides",
        permanent: true,
      },
      {
        source: "/guide",
        destination: "/guides",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
