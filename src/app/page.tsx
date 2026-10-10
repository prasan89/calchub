import type {Metadata} from "next";
import Link from "next/link";
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
      {/* WebSite JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{__html: JSON.stringify(websiteJsonLd)}}
      />

      {/* Hero */}
      <section
        style={{
          paddingBlock: "76px 56px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,360px),1fr))",
          alignItems: "center",
          gap: 36,
        }}
      >
        <div>
          <div className="eyebrow">Useful answers. Less guesswork.</div>
          <h1
            style={{
              fontSize: "clamp(2.7rem,6vw,5rem)",
              lineHeight: 0.99,
              fontWeight: 900,
              letterSpacing: "-.075em",
              margin: "18px 0 20px",
            }}
          >
            Free Online Calculators
            <br />
            <span style={{color: "var(--accent)"}}>for every decision.</span>
          </h1>
          <p
            style={{
              fontSize: 18,
              lineHeight: 1.7,
              color: "var(--muted)",
              maxWidth: 560,
            }}
          >
            Use our <strong>mortgage calculator</strong>,{" "}
            <strong>EMI calculator</strong>,{" "}
            <strong>income tax calculator</strong>,{" "}
            <strong>BMI calculator</strong>, and{" "}
            <strong>compound interest calculator</strong> — plus 87 more tools
            for your money, health, studies and everyday plans. Enter your
            values and get a clear answer in seconds.
          </p>
          <div
            style={{
              display: "flex",
              gap: 12,
              flexWrap: "wrap",
              marginTop: 26,
            }}
          >
            <Link className="primary-button" href="#calculator-directory">
              Explore calculators ↓
            </Link>
            <span
              style={{alignSelf: "center", fontSize: 13, color: "var(--muted)"}}
            >
              92 tools · No account needed
            </span>
          </div>
        </div>

        {/* Featured calculators card */}
        <div
          className="surface"
          style={{
            padding: 26,
            background: "linear-gradient(145deg,#eff8f2,white 80%)",
          }}
        >
          <div className="eyebrow">Popular calculators</div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2,minmax(0,1fr))",
              gap: 12,
              marginTop: 16,
            }}
          >
            {featuredSlugs.map((slug) => {
              const item = calculators.find((c) => c.slug === slug)!;
              return (
                <Link
                  key={slug}
                  href={`/calculators/${slug}`}
                  style={{
                    border: "1px solid var(--line)",
                    background: "white",
                    padding: 16,
                    borderRadius: 13,
                  }}
                >
                  <span
                    style={{
                      fontSize: 12,
                      color: "var(--muted)",
                      display: "block",
                    }}
                  >
                    {item.category}
                  </span>
                  <span
                    style={{fontWeight: 800, display: "block", marginTop: 7}}
                  >
                    {item.name}
                  </span>
                  <span
                    style={{
                      fontSize: 12,
                      color: "var(--accent)",
                      display: "block",
                      marginTop: 13,
                    }}
                  >
                    Calculate ↗
                  </span>
                </Link>
              );
            })}
          </div>
          <p style={{fontSize: 12, color: "var(--muted)", margin: "18px 0 0"}}>
            Calculator values stay in your browser.
          </p>
        </div>
      </section>

      {/* Most Popular row */}
      <section style={{marginBottom: 36}}>
        <div className="eyebrow" style={{marginBottom: 14}}>
          Most popular
        </div>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 10,
          }}
        >
          {popularSlugs.map((slug) => {
            const item = calculators.find((c) => c.slug === slug)!;
            return (
              <Link
                key={slug}
                href={`/calculators/${slug}`}
                style={{
                  border: "1px solid var(--line)",
                  background: "var(--wash)",
                  padding: "8px 16px",
                  borderRadius: 999,
                  fontSize: 14,
                  fontWeight: 600,
                  color: "var(--ink)",
                  textDecoration: "none",
                  whiteSpace: "nowrap",
                }}
              >
                {item.name}
              </Link>
            );
          })}
        </div>
      </section>

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
