import { ImageResponse } from 'next/og';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
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
        {/* Main heading */}
        <div
          style={{
            fontSize: '80px',
            fontWeight: 900,
            color: '#ffffff',
            lineHeight: 1.05,
            letterSpacing: '-2px',
            marginBottom: '24px',
          }}
        >
          CalcHub
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: '36px',
            fontWeight: 400,
            color: '#a8d5bc',
            marginBottom: '48px',
          }}
        >
          Free Online Calculators
        </div>

        {/* Category pills */}
        <div style={{ display: 'flex', gap: '16px' }}>
          {['Finance', 'Health', 'Math'].map((label) => (
            <div
              key={label}
              style={{
                background: 'rgba(168,213,188,0.15)',
                border: '1px solid rgba(168,213,188,0.35)',
                borderRadius: '999px',
                padding: '8px 24px',
                fontSize: '22px',
                color: '#a8d5bc',
                fontWeight: 500,
              }}
            >
              {label}
            </div>
          ))}
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
      </div>
    ),
    { ...size }
  );
}
