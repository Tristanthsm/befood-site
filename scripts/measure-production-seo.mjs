import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const BASE_URL = (process.env.SEO_AUDIT_BASE_URL || "https://befood.fr").replace(/\/+$/, "");

const INDEXABLE_ROUTES = [
  "/",
  "/app",
  "/comment-ca-marche",
  "/pour-les-coachs",
  "/guides",
  "/methodologie",
  "/a-propos",
  "/contact",
  "/aide",
  "/cookies",
  "/confidentialite",
  "/conditions",
  "/quiz",
];

const LEGACY_REDIRECTS = [
  { from: "/confidentialite", to: "/privacy" },
  { from: "/conditions", to: "/terms" },
  { from: "/support", to: "/aide" },
  { from: "/blog", to: "/guides" },
  { from: "/guide", to: "/guides" },
];
const REDIRECT_TARGET_BY_SOURCE = new Map(LEGACY_REDIRECTS.map((rule) => [rule.from, rule.to]));

function normalizeUrl(url) {
  const normalized = url.endsWith("/") && url.length > 1 ? url.slice(0, -1) : url;
  return normalized.replace("://www.", "://");
}

function absoluteUrl(route) {
  return `${BASE_URL}${route}`;
}

function safeParseUrl(value) {
  try {
    return new URL(value);
  } catch {
    return null;
  }
}

function extractFirst(html, regex) {
  const match = html.match(regex);
  return match?.[1]?.trim() ?? null;
}

async function fetchText(url, options = {}) {
  const startedAt = performance.now();
  const response = await fetch(url, {
    ...options,
    headers: {
      "user-agent": "BeFoodSeoAudit/1.0 (+https://befood.fr)",
      ...(options.headers ?? {}),
    },
  });
  const durationMs = Math.round((performance.now() - startedAt) * 10) / 10;
  const body = await response.text();
  return { response, body, durationMs };
}

async function auditIndexableRoute(route) {
  const url = absoluteUrl(route);
  const { response, body, durationMs } = await fetchText(url);

  const canonical = extractFirst(body, /<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']/i);
  const title = extractFirst(body, /<title>([^<]+)<\/title>/i);
  const description = extractFirst(body, /<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
  const robots = extractFirst(body, /<meta[^>]*name=["']robots["'][^>]*content=["']([^"']+)["']/i);
  const h1 = extractFirst(body, /<h1[^>]*>([\s\S]*?)<\/h1>/i)?.replace(/<[^>]+>/g, "").trim() ?? null;
  const jsonLdCount = (body.match(/type=["']application\/ld\+json["']/gi) ?? []).length;

  const expectedCanonical = normalizeUrl(url);
  const normalizedCanonical = canonical ? normalizeUrl(canonical) : null;
  const canonicalUrl = normalizedCanonical ? safeParseUrl(normalizedCanonical) : null;
  const expectedUrl = safeParseUrl(expectedCanonical);
  const expectedPathname = normalizeUrl(REDIRECT_TARGET_BY_SOURCE.get(route) ?? route);
  const allowedHosts = new Set([
    expectedUrl?.hostname ?? "",
    "befood.fr",
    "www.befood.fr",
  ]);
  const canonicalValid = Boolean(
    canonicalUrl
    && expectedUrl
    && allowedHosts.has(canonicalUrl.hostname)
    && normalizeUrl(canonicalUrl.pathname) === expectedPathname,
  );

  const issues = [];
  if (response.status !== 200) {
    issues.push(`status_${response.status}`);
  }
  if (!canonical) {
    issues.push("missing_canonical");
  } else if (!canonicalValid) {
    issues.push("canonical_mismatch");
  }
  if (!title) {
    issues.push("missing_title");
  }
  if (!description) {
    issues.push("missing_description");
  }
  if (!h1) {
    issues.push("missing_h1");
  }
  if (robots?.toLowerCase().includes("noindex")) {
    issues.push("unexpected_noindex");
  }
  if (jsonLdCount === 0) {
    issues.push("missing_json_ld");
  }

  return {
    route,
    url,
    status: response.status,
    durationMs,
    canonical,
    canonicalValid,
    titleLength: title?.length ?? 0,
    descriptionLength: description?.length ?? 0,
    hasRobotsMeta: Boolean(robots),
    robotsMeta: robots,
    hasH1: Boolean(h1),
    jsonLdCount,
    cacheControl: response.headers.get("cache-control"),
    issues,
  };
}

async function auditRedirect(redirectRule) {
  const fromUrl = absoluteUrl(redirectRule.from);
  const expectedTo = absoluteUrl(redirectRule.to);
  const { response } = await fetchText(fromUrl, { redirect: "manual" });
  const location = response.headers.get("location");
  const normalizedLocation = location
    ? normalizeUrl(new URL(location, BASE_URL).toString())
    : null;
  const expected = normalizeUrl(expectedTo);

  const issues = [];
  if (response.status !== 308 && response.status !== 301) {
    issues.push(`unexpected_redirect_status_${response.status}`);
  }
  if (normalizedLocation !== expected) {
    issues.push("redirect_target_mismatch");
  }

  return {
    from: redirectRule.from,
    to: redirectRule.to,
    status: response.status,
    location: normalizedLocation,
    issues,
  };
}

async function auditRobots() {
  const { response, body } = await fetchText(absoluteUrl("/robots.txt"));
  const lower = body.toLowerCase();

  const required = [
    "disallow: /api/",
    "disallow: /admin/",
    "disallow: /profil",
    "sitemap:",
  ];
  const missingRules = required.filter((rule) => !lower.includes(rule));

  return {
    status: response.status,
    contentLength: body.length,
    hasSitemapRef: lower.includes("sitemap:"),
    missingRules,
    issues: [
      ...(response.status === 200 ? [] : [`status_${response.status}`]),
      ...missingRules.map((rule) => `missing_${rule.replace(/[^a-z0-9]+/gi, "_")}`),
    ],
  };
}

async function auditSitemap() {
  const { response, body } = await fetchText(absoluteUrl("/sitemap.xml"));
  const locMatches = [...body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
  const forbidden = ["/admin", "/profil", "/espace-coach", "/join", "/connexion", "/inscription"];
  const forbiddenLocs = locMatches.filter((loc) => forbidden.some((segment) => loc.includes(segment)));

  return {
    status: response.status,
    urlCount: locMatches.length,
    hasGuides: locMatches.some((loc) => loc.includes("/guides")),
    hasHome: locMatches.some((loc) => normalizeUrl(loc) === normalizeUrl(absoluteUrl("/"))),
    forbiddenLocs,
    issues: [
      ...(response.status === 200 ? [] : [`status_${response.status}`]),
      ...(forbiddenLocs.length > 0 ? ["contains_non_indexable_urls"] : []),
    ],
  };
}

async function auditLlmsTxt() {
  const { response, body } = await fetchText(absoluteUrl("/llms.txt"));
  const issues = [];

  if (response.status !== 200) {
    issues.push(`status_${response.status}`);
  }
  if (!body.includes("Source of truth for AI assistants")) {
    issues.push("missing_source_of_truth_line");
  }
  if (!body.includes("/sitemap.xml")) {
    issues.push("missing_sitemap_reference");
  }

  return {
    status: response.status,
    contentLength: body.length,
    issues,
  };
}

function buildSummary(report) {
  const pageIssues = report.pages.flatMap((page) => page.issues.map((issue) => `${page.route}:${issue}`));
  const redirectIssues = report.redirects.flatMap((rule) => rule.issues.map((issue) => `${rule.from}:${issue}`));
  const globalIssues = [
    ...report.robots.issues.map((issue) => `robots:${issue}`),
    ...report.sitemap.issues.map((issue) => `sitemap:${issue}`),
    ...report.llmsTxt.issues.map((issue) => `llms:${issue}`),
  ];

  return {
    totalPageIssues: pageIssues.length,
    totalRedirectIssues: redirectIssues.length,
    totalGlobalIssues: globalIssues.length,
    issueList: [...pageIssues, ...redirectIssues, ...globalIssues],
  };
}

async function main() {
  const now = new Date();
  const pages = await Promise.all(INDEXABLE_ROUTES.map((route) => auditIndexableRoute(route)));
  const redirects = await Promise.all(LEGACY_REDIRECTS.map((rule) => auditRedirect(rule)));
  const [robots, sitemap, llmsTxt] = await Promise.all([auditRobots(), auditSitemap(), auditLlmsTxt()]);

  const report = {
    generatedAt: now.toISOString(),
    baseUrl: BASE_URL,
    pages,
    redirects,
    robots,
    sitemap,
    llmsTxt,
  };

  const summary = buildSummary(report);
  const output = { ...report, summary };

  const reportsDir = path.join(process.cwd(), "docs", "reports");
  await mkdir(reportsDir, { recursive: true });
  const fileName = `seo-prod-report-${now.toISOString().replace(/[:.]/g, "-")}.json`;
  const filePath = path.join(reportsDir, fileName);
  await writeFile(filePath, `${JSON.stringify(output, null, 2)}\n`, "utf8");

  console.log(`SEO production report generated: ${filePath}`);
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Page issues: ${summary.totalPageIssues}`);
  console.log(`Redirect issues: ${summary.totalRedirectIssues}`);
  console.log(`Global issues: ${summary.totalGlobalIssues}`);

  if (summary.issueList.length > 0) {
    console.log("Issues:");
    summary.issueList.forEach((issue) => console.log(`- ${issue}`));
    if (process.env.SEO_AUDIT_STRICT === "1") {
      process.exitCode = 2;
    }
  }
}

main().catch((error) => {
  console.error("Failed to run SEO production audit:", error);
  process.exit(1);
});
