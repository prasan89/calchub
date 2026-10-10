import type { MetadataRoute } from "next";
import { calculators } from "@/lib/calculators/catalog";

const HIGH_PRIORITY_SLUGS = new Set([
  "mortgage-calculator",
  "emi-calculator",
  "income-tax-calculator",
  "bmi-calculator",
  "compound-interest-calculator",
  "loan-calculator",
  "sip-calculator",
  "retirement-calculator",
  "auto-loan-calculator",
  "investment-calculator",
  "savings-calculator",
  "bmr-calculator",
]);

const MEDIUM_PRIORITY_SLUGS = new Set([
  "calorie-deficit-calculator",
  "percentage-calculator",
  "gpa-calculator",
  "scientific-calculator",
  "age-calculator",
  "student-loan-calculator",
  "grade-calculator",
  "fuel-cost-calculator",
  "roi-calculator",
  "discount-calculator",
  "budget-calculator",
]);

const LAST_MODIFIED = new Date("2025-10-11");

export default function sitemap(): MetadataRoute.Sitemap {
  const base = (
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  ).replace(/\/$/, "");

  const homepageEntry: MetadataRoute.Sitemap[number] = {
    url: base,
    lastModified: LAST_MODIFIED,
    changeFrequency: "weekly",
    priority: 1.0,
  };

  const calculatorEntries: MetadataRoute.Sitemap = calculators.map((c) => {
    let priority: number;
    if (HIGH_PRIORITY_SLUGS.has(c.slug)) {
      priority = 0.9;
    } else if (MEDIUM_PRIORITY_SLUGS.has(c.slug)) {
      priority = 0.8;
    } else {
      priority = 0.7;
    }

    return {
      url: `${base}/calculators/${c.slug}`,
      lastModified: LAST_MODIFIED,
      changeFrequency: "monthly" as const,
      priority,
    };
  });

  return [homepageEntry, ...calculatorEntries];
}
