import type {Metadata} from "next";
import {calculators, categories} from "@/lib/calculators/catalog";
import CalculatorDirectory from "@/components/CalculatorDirectory";
import AdSidebar from "@/components/AdSidebar";

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
    <div className="page-with-sidebar">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{__html: JSON.stringify(websiteJsonLd)}}
      />

      {/* Main content */}
      <div className="main-col">
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
            <h1 style={{fontSize: 32, fontWeight: 900, margin: "8px 0 0"}}>
              All calculators
            </h1>
          </div>
          <p style={{fontSize: 13, color: "var(--muted)"}}>
            {calculators.length} calculators · {categories.length} categories
          </p>
        </div>

        <CalculatorDirectory />

        <section style={{paddingBlock: 40, maxWidth: 800}}>
          <h2 style={{fontSize: 22, fontWeight: 850}}>
            Free online calculators for every decision
          </h2>
          <p style={{lineHeight: 1.8, color: "var(--muted)", fontSize: 15}}>
            Use our mortgage calculator, EMI calculator, income tax calculator, BMI calculator, and compound interest calculator — plus 90 more tools for your money, health, studies and everyday plans. All results stay in your browser. No sign-up required.
          </p>
        </section>
      </div>

      {/* Ad sidebar */}
      <div className="ad-col">
        <AdSidebar />
      </div>
    </div>
  );
}
