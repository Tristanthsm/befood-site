import type { NextConfig } from "next";

function buildContentSecurityPolicy() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
  let supabaseOrigin = "";

  if (supabaseUrl) {
    try {
      supabaseOrigin = new URL(supabaseUrl).origin;
    } catch {
      supabaseOrigin = "";
    }
  }

  const connectSources = [
    "'self'",
    "https://www.googletagmanager.com",
    "https://*.google-analytics.com",
    "https://vitals.vercel-insights.com",
    "https://*.supabase.co",
    "wss://*.supabase.co",
  ];

  if (supabaseOrigin) {
    connectSources.push(supabaseOrigin);
  }

  const directives = [
    "default-src 'self'",
    "base-uri 'self'",
    "frame-ancestors 'none'",
    "object-src 'none'",
    "form-action 'self'",
    "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    `connect-src ${connectSources.join(" ")}`,
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
