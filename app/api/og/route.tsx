import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const title = searchParams.get('title') || 'Lingo';
    const subtitle = searchParams.get('subtitle') || 'Learn Languages Online';
    const type = searchParams.get('type') || 'default';

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #dcfce7 0%, #86efac 50%, #22c55e 100%)',
            fontFamily: 'Inter, system-ui, sans-serif',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '40px 60px',
              textAlign: 'center',
            }}
          >
            {/* Logo */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '30px',
              }}
            >
              <div
                style={{
                  fontSize: '48px',
                  fontWeight: 'bold',
                  color: '#166534',
                  letterSpacing: '-0.02em',
                }}
              >
                Lingo
              </div>
            </div>

            {/* Title */}
            <div
              style={{
                fontSize: type === 'home' ? '72px' : '56px',
                fontWeight: 'bold',
                color: '#166534',
                marginBottom: '20px',
                textShadow: '2px 2px 4px rgba(0,0,0,0.1)',
                maxWidth: '900px',
                lineHeight: 1.2,
              }}
            >
              {decodeURIComponent(title)}
            </div>

            {/* Subtitle */}
            {subtitle && (
              <div
                style={{
                  fontSize: '32px',
                  color: '#15803d',
                  marginTop: '10px',
                  maxWidth: '800px',
                }}
              >
                {decodeURIComponent(subtitle)}
              </div>
            )}

            {/* CTA Badge */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                marginTop: '40px',
                padding: '15px 40px',
                background: '#166534',
                borderRadius: '50px',
                color: 'white',
                fontSize: '24px',
                fontWeight: '600',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              }}
            >
              Start Learning Free Today
            </div>

            {/* Language Flags */}
            <div
              style={{
                display: 'flex',
                gap: '12px',
                marginTop: '30px',
              }}
            >
              {['🇪🇸', '🇫🇷', '🇩🇪', '🇮🇹', '🇯🇵', '🇰🇷'].map((flag, i) => (
                <div
                  key={i}
                  style={{
                    fontSize: '32px',
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
                  }}
                >
                  {flag}
                </div>
              ))}
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e) {
    console.error('Error generating OG image:', e);
    return new Response('Failed to generate image', { status: 500 });
  }
}
