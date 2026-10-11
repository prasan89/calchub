import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { calculators, getCalculator } from "@/lib/calculators/catalog";
import CalculatorCard from "@/components/CalculatorCard";
import CalculatorShell from "@/components/CalculatorShell";
import AdSidebar from "@/components/AdSidebar";
import { calcSEO } from "@/lib/calculators/seo";
import type { CalcSEO } from "@/lib/calculators/seo";

const base = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");

export function generateStaticParams() {
  return calculators.filter(Boolean).map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const c = getCalculator(slug);
  if (!c) return {};

  const seo: CalcSEO | undefined = calcSEO[slug];
  const title = seo?.title ?? `${c.name} — Free Online Calculator`;
  const description = seo?.metaDesc ?? c.description;
  const canonicalUrl = `${base}/calculators/${slug}`;

  return {
    title,
    description,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      type: "website",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

export default async function CalculatorPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const c = getCalculator(slug);
  if (!c) notFound();

  const seo: CalcSEO | undefined = calcSEO[slug];

  const related = calculators
    .filter((x) => x.category === c.category && x.slug !== c.slug)
    .slice(0, 4);

  const pageUrl = `${base}/calculators/${c.slug}`;

  const webAppSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: c.name,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Any",
    description: c.description,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    url: pageUrl,
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: base,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: c.category,
        item: `${base}/?category=${encodeURIComponent(c.category)}`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: c.name,
        item: pageUrl,
      },
    ],
  };

  const schemas: object[] = [webAppSchema, breadcrumbSchema];

  if (seo?.faqs && seo.faqs.length > 0) {
    const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: seo.faqs.map((faq) => ({
        "@type": "Question",
        name: faq.q,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.a,
        },
      })),
    };
    schemas.push(faqSchema);
  }

  return (
    <div className="site-shell" style={{ paddingTop: 28 }}>
      <div style={{ display: "flex", gap: 32, alignItems: "flex-start" }}>
        {/* Main content */}
        <article style={{ flex: 1, minWidth: 0 }}>
          {/* Breadcrumb */}
          <nav
            aria-label="Breadcrumb"
            style={{ fontSize: 13, color: "var(--muted)", marginBottom: 24 }}
          >
            <Link href="/">Home</Link> / {c.category} /{" "}
            <span style={{ color: "var(--ink)" }}>{c.name}</span>
          </nav>

      {/* Hero */}
      <div style={{ maxWidth: 820, marginBottom: 27 }}>
        <div className="eyebrow">{c.category} calculator</div>
        <h1
          style={{
            fontSize: "clamp(2.2rem,5vw,3.6rem)",
            lineHeight: 1.05,
            fontWeight: 900,
            letterSpacing: "-.065em",
            margin: "12px 0",
          }}
        >
          {seo?.h1Override ?? c.name}
        </h1>
        <p style={{ fontSize: 17, color: "var(--muted)", lineHeight: 1.75 }}>
          {c.description}
        </p>
      </div>

      {/* Calculator */}
      <CalculatorShell calculator={c} />

      {/* SEO Content */}
      <section style={{ maxWidth: 820, paddingTop: 38 }}>
        {/* About */}
        <h2 style={{ fontSize: 23, fontWeight: 850 }}>About this calculator</h2>
        <p style={{ lineHeight: 1.8, color: "var(--muted)" }}>
          {seo?.aboutText ?? `${c.description} Enter values to see results update instantly. Change inputs to compare scenarios; no account is required.`}
        </p>

        {/* Formula */}
        {seo?.formula && (
          <>
            <h2 style={{ fontSize: 23, fontWeight: 850, marginTop: 28 }}>Formula</h2>
            <pre
              style={{
                background: "var(--wash)",
                border: "1px solid var(--line)",
                borderRadius: 8,
                padding: "14px 18px",
                fontSize: 15,
                lineHeight: 1.7,
                overflowX: "auto",
                color: "var(--ink)",
                fontFamily: "ui-monospace, 'Cascadia Code', 'Source Code Pro', monospace",
              }}
            >
              {seo.formula}
            </pre>
          </>
        )}

        {/* Example */}
        {seo?.example && (
          <>
            <h2 style={{ fontSize: 23, fontWeight: 850, marginTop: 28 }}>Example</h2>
            <p style={{ lineHeight: 1.8, color: "var(--muted)" }}>{seo.example}</p>
          </>
        )}

        {/* How to use */}
        <h2 style={{ fontSize: 23, fontWeight: 850, marginTop: 28 }}>How to use it</h2>
        {seo?.howToUse && seo.howToUse.length > 0 ? (
          <ol style={{ lineHeight: 1.9, color: "var(--muted)", paddingLeft: 22 }}>
            {seo.howToUse.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
        ) : (
          <ol style={{ lineHeight: 1.9, color: "var(--muted)", paddingLeft: 22 }}>
            <li>Enter your values in the fields.</li>
            <li>Review results and listed assumptions.</li>
            <li>Change inputs to compare scenarios.</li>
          </ol>
        )}

        <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.7, marginTop: 12 }}>
          General estimates only; not a substitute for official financial/tax calculations or
          professional health advice.
        </p>

        {/* FAQ Accordion */}
        {seo?.faqs && seo.faqs.length > 0 && (
          <>
            <h2 style={{ fontSize: 23, fontWeight: 850, marginTop: 36 }}>
              Frequently Asked Questions
            </h2>
            <div style={{ marginTop: 12 }}>
              {seo.faqs.map((faq, i) => (
                <details
                  key={i}
                  style={{
                    borderTop: "1px solid var(--line)",
                    padding: "14px 0",
                  }}
                >
                  <summary
                    style={{
                      cursor: "pointer",
                      fontWeight: 700,
                      fontSize: 16,
                      color: "var(--ink)",
                      listStyle: "none",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 12,
                    }}
                  >
                    {faq.q}
                    <span
                      style={{
                        flexShrink: 0,
                        width: 20,
                        height: 20,
                        borderRadius: "50%",
                        background: "var(--wash)",
                        border: "1px solid var(--line)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 14,
                        color: "var(--accent)",
                        fontWeight: 900,
                      }}
                    >
                      +
                    </span>
                  </summary>
                  <p
                    style={{
                      marginTop: 10,
                      lineHeight: 1.8,
                      color: "var(--muted)",
                      paddingRight: 32,
                    }}
                  >
                    {faq.a}
                  </p>
                </details>
              ))}
              <div style={{ borderTop: "1px solid var(--line)" }} />
            </div>
          </>
        )}
      </section>

      {/* Related Calculators */}
      {related.length > 0 && (
        <section style={{ paddingTop: 42 }}>
          <h2 style={{ fontSize: 23, fontWeight: 850, marginBottom: 16 }}>
            Related {c.category.toLowerCase()} calculators
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill,minmax(min(100%,235px),1fr))",
              gap: 14,
            }}
          >
            {related.map((item) => (
              <CalculatorCard key={item.slug} calculator={item} />
            ))}
          </div>
        </section>
      )}

      {/* JSON-LD — all schemas in one array */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }}
      />
        </article>

        {/* Ad sidebar */}
        <div className="ad-sidebar">
          <AdSidebar />
        </div>
      </div>
    </div>
  );
}
