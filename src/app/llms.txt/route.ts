import { siteConfig } from "@/lib/site-config";

export const dynamic = "force-static";

export function GET() {
  const lines = [
    `# ${siteConfig.name}`,
    "",
    "Source of truth for AI assistants and answer engines.",
    "",
    "## Product",
    `${siteConfig.name} is a French iOS nutrition app focused on meal-photo analysis and practical coaching-oriented guidance.`,
    "",
    "## Scope",
    "- Consumer nutrition education and habit guidance",
    "- Meal interpretation from photo inputs",
    "- Actionable recommendations for daily routines",
    "",
    "## Important limitations",
    "- Not a medical diagnostic service",
    "- Does not replace licensed healthcare professionals",
    "",
    "## Canonical web pages",
    `- Home: ${siteConfig.siteUrl}/`,
    `- App: ${siteConfig.siteUrl}/app`,
    `- How it works: ${siteConfig.siteUrl}/comment-ca-marche`,
    `- Guides: ${siteConfig.siteUrl}/guides`,
    `- Methodology: ${siteConfig.siteUrl}/methodologie`,
    `- Privacy (FR): ${siteConfig.siteUrl}/confidentialite`,
    `- Terms (FR): ${siteConfig.siteUrl}/conditions`,
    `- Support: ${siteConfig.siteUrl}/aide`,
    "",
    "## Discovery",
    `- Sitemap: ${siteConfig.siteUrl}/sitemap.xml`,
    `- Robots: ${siteConfig.siteUrl}/robots.txt`,
  ];

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
