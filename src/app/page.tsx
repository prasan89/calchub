import type {Metadata} from "next";
import {calculators, categories} from "@/lib/calculators/catalog";
import CalculatorDirectory from "@/components/CalculatorDirectory";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://calchub.io";

export const metadata: Metadata = {
  title: "Free Online Calculators — Finance, Health and Math | CalcHub",
  description:
    "92 free calculators for mortgage, EMI, income tax, BMI, GPA and more. Instant answers, no sign-up. Works for India and USA.",
  keywords: [
    "free online calculators",
    "mortgage calculator",
    "EMI calculator",
    "income tax calculator",
    "BMI calculator",
    "GPA calculator",
    "compound interest calculator",
  ],
  alternates: {canonical: "/"},
  openGraph: {
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "CalcHub Free Online Calculators",
      },
    ],
  },
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "CalcHub",
  url: siteUrl,
  potentialAction: {
    "@type": "SearchAction",
    target: `${siteUrl}/calculators/{search_term_string}-calculator`,
    "query-input": "required name=search_term_string",
  },
};

const featuredSlugs = [
  "mortgage-calculator",
  "emi-calculator",
  "income-tax-calculator",
  "bmi-calculator",
];

const popularSlugs = [
  "mortgage-calculator",
  "emi-calculator",
  "income-tax-calculator",
  "bmi-calculator",
  "compound-interest-calculator",
  "retirement-calculator",
];

const ids: Record<string, string> = {
  Financial: "financial",
  "Health & Fitness": "health",
  Math: "math",
  Everyday: "everyday",
};

export default function HomePage() {
  return (
    <div className="site-shell">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{__html: JSON.stringify(websiteJsonLd)}}
      />

      {/* Directory header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "end",
          gap: 15,
          marginBottom: 20,
          flexWrap: "wrap",
        }}
      >
        <div>
          <div className="eyebrow">Browse the library</div>
          <h2 style={{fontSize: 32, fontWeight: 900, margin: "8px 0 0"}}>
            All calculators
          </h2>
        </div>
        <p style={{fontSize: 13, color: "var(--muted)"}}>
          {calculators.length} calculators · {categories.length} categories
        </p>
      </div>

      <CalculatorDirectory />

      {/* Trust stats */}
      <section
        style={{
          paddingBlock: 48,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,200px),1fr))",
          gap: 20,
          marginTop: 8,
        }}
      >
        {[
          {stat: "92 Calculators", detail: "Finance, health, math & more"},
          {stat: "0 Sign-ups Required", detail: "Open and free to use"},
          {stat: "India and USA Support", detail: "Localised results for both"},
        ].map(({stat, detail}) => (
          <div
            key={stat}
            className="surface"
            style={{
              padding: "28px 24px",
              borderRadius: 16,
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: "clamp(1.4rem,3vw,2rem)",
                fontWeight: 900,
                color: "var(--accent)",
                lineHeight: 1.1,
              }}
            >
              {stat}
            </div>
            <div
              style={{fontSize: 14, color: "var(--muted)", marginTop: 8}}
            >
              {detail}
            </div>
          </div>
        ))}
      </section>

      {/* About blurb */}
      <section style={{paddingBlock: 55, maxWidth: 800}}>
        <h2 style={{fontSize: 26, fontWeight: 850}}>
          Calculators that are clear and practical
        </h2>
        <p style={{lineHeight: 1.8, color: "var(--muted)"}}>
          CalcHub helps you explore scenarios quickly. Results are estimates
          based on assumptions entered. Confirm important financial, tax and
          health decisions with official sources or qualified professionals.
        </p>
      </section>
    </div>
  );
}
