import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "CalcHub — Free Online Calculators",
    template: "%s | CalcHub",
  },
  description:
    "Free online calculators for loans, investments, health, math and everyday planning. Fast, private, no sign-up.",
  applicationName: "CalcHub",
  authors: [{ name: "CalcHub", url: siteUrl }],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION || "",
  },
  openGraph: {
    type: "website",
    siteName: "CalcHub",
    title: "CalcHub — Free Online Calculators",
    description:
      "Simple calculators for money, health, math and everyday life.",
    url: siteUrl,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "CalcHub — Free Online Calculators",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@calchub",
    title: "CalcHub — Free Online Calculators",
    description:
      "Simple calculators for money, health, math and everyday life.",
    images: ["/og-image.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#176b4d",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <a
          href="#main-content"
          style={{
            position: "absolute",
            top: "-40px",
            left: 0,
            background: "#176b4d",
            color: "white",
            padding: "8px 16px",
            zIndex: 100,
            borderRadius: "0 0 6px 0",
            fontWeight: 700,
            fontSize: 14,
            textDecoration: "none",
            transition: "top 0.2s",
          }}
          onFocus={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.top = "0";
          }}
          onBlur={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.top = "-40px";
          }}
        >
          Skip to main content
        </a>
        <header
          style={{
            borderBottom: "1px solid var(--line)",
            background: "#ffffffee",
          }}
        >
          <div
            className="site-shell"
            style={{
              height: 72,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 20,
            }}
          >
            <Link
              href="/"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                fontWeight: 900,
                fontSize: 22,
                letterSpacing: "-.06em",
              }}
            >
              <span
                style={{
                  background: "#176b4d",
                  color: "white",
                  borderRadius: 10,
                  width: 34,
                  height: 34,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                C
              </span>
              calc<span style={{ color: "#176b4d" }}>hub</span>
            </Link>
            <nav
              aria-label="Main navigation"
              style={{
                display: "flex",
                gap: 18,
                color: "var(--muted)",
                fontSize: 14,
                fontWeight: 650,
              }}
            >
              <Link href="/#financial">Finance</Link>
              <Link href="/#health">Health</Link>
              <Link href="/#math">Math</Link>
              <Link href="/#everyday">Everyday</Link>
            </nav>
          </div>
        </header>
        <main id="main-content">{children}</main>
        <footer
          style={{
            marginTop: 80,
            borderTop: "1px solid var(--line)",
            background: "white",
          }}
        >
          <div
            className="site-shell"
            style={{ paddingBlock: 28, fontSize: 13, color: "var(--muted)" }}
          >
            <p style={{ margin: "0 0 12px 0" }}>
              &copy; {new Date().getFullYear()} CalcHub. Calculations are
              estimates for informational purposes; verify important financial
              and health decisions with qualified professionals.
            </p>
            <nav
              aria-label="Footer navigation"
              style={{ display: "flex", gap: 16, flexWrap: "wrap" }}
            >
              <Link
                href="/privacy"
                style={{ color: "var(--muted)", textDecoration: "underline" }}
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                style={{ color: "var(--muted)", textDecoration: "underline" }}
              >
                Terms
              </Link>
              <Link
                href="/about"
                style={{ color: "var(--muted)", textDecoration: "underline" }}
              >
                About
              </Link>
            </nav>
          </div>
        </footer>
      </body>
    </html>
  );
}
