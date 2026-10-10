import { ImageResponse } from 'next/og';
import { getCalculator } from '@/lib/calculators/catalog';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const categoryColors: Record<string, string> = {
  'Financial': '#7ec8a0',
  'Health & Fitness': '#88c8e0',
  'Math': '#c8b0e8',
  'Everyday': '#e8c880',
};

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const calc = getCalculator(slug);

  const name = calc?.name ?? 'Calculator';
  const category = calc?.category ?? 'Tools';
  const description = calc?.description ?? 'Free online calculator at CalcHub';
  const pillColor = categoryColors[category] ?? '#a8d5bc';

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          background: '#0f3d2e',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          padding: '80px 96px',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          position: 'relative',
        }}
      >
        {/* Category badge */}
        <div
          style={{
            background: `rgba(${pillColor}, 0.15)`,
            border: `1px solid ${pillColor}55`,
            borderRadius: '999px',
            padding: '8px 24px',
            fontSize: '22px',
            color: pillColor,
            fontWeight: 600,
            marginBottom: '28px',
          }}
        >
          {category}
        </div>

        {/* Calculator name */}
        <div
          style={{
            fontSize: name.length > 28 ? '58px' : '72px',
            fontWeight: 900,
            color: '#ffffff',
            lineHeight: 1.1,
            letterSpacing: '-1.5px',
            marginBottom: '28px',
            maxWidth: '960px',
          }}
        >
          {name}
        </div>

        {/* Description */}
        <div
          style={{
            fontSize: '28px',
            fontWeight: 400,
            color: '#a8d5bc',
            maxWidth: '860px',
            lineHeight: 1.45,
          }}
        >
          {description}
        </div>

        {/* Bottom-right domain */}
        <div
          style={{
            position: 'absolute',
            bottom: '48px',
            right: '96px',
            fontSize: '24px',
            color: 'rgba(168,213,188,0.6)',
            fontWeight: 600,
            letterSpacing: '0.5px',
          }}
        >
          calchub.io
        </div>

        {/* Bottom-left CalcHub brand */}
        <div
          style={{
            position: 'absolute',
            bottom: '48px',
            left: '96px',
            fontSize: '22px',
            color: 'rgba(255,255,255,0.35)',
            fontWeight: 700,
            letterSpacing: '1px',
          }}
        >
          CalcHub
        </div>
      </div>
    ),
    { ...size }
  );
}
