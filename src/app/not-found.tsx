import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Page Not Found — CalcHub',
  robots: { index: false, follow: false },
};

const popularCalcs = [
  { href: '/calculators/mortgage-calculator', label: 'Mortgage Calculator' },
  { href: '/calculators/emi-calculator', label: 'EMI Calculator' },
  { href: '/calculators/bmi-calculator', label: 'BMI Calculator' },
  { href: '/calculators/income-tax-calculator', label: 'Income Tax Calculator' },
];

export default function NotFound() {
  return (
    <div
      className="site-shell"
      style={{
        paddingBlock: 100,
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 24,
      }}
    >
      <p style={{ fontSize: 96, fontWeight: 900, lineHeight: 1, margin: 0, color: 'var(--accent)' }}>
        404
      </p>
      <h1 style={{ fontSize: 36, fontWeight: 800, margin: 0 }}>Page Not Found</h1>
      <p style={{ color: 'var(--muted)', maxWidth: 420, margin: 0 }}>
        The page you are looking for may have moved or the link may be incorrect.
      </p>

      <Link className="primary-button" href="/" style={{ marginTop: 8 }}>
        Browse all calculators
      </Link>

      <div style={{ marginTop: 32 }}>
        <p className="eyebrow" style={{ marginBottom: 16 }}>
          Popular Calculators
        </p>
        <ul
          style={{
            listStyle: 'none',
            padding: 0,
            margin: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}
        >
          {popularCalcs.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                style={{ color: 'var(--accent)', textDecoration: 'underline', fontSize: 17 }}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
