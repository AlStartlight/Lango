import { ImageResponse } from 'next/og';

interface OpenGraphImageProps {
  title: string;
  subtitle?: string;
  locale?: string;
  type?: 'home' | 'about' | 'pricing' | 'languages' | 'default';
}

export async function generateOpenGraphImage({
  title,
  subtitle,
  locale = 'en',
  type = 'default',
}: OpenGraphImageProps) {
  // Font loading would be done here in production
  // const interBold = await fetch(
  //   new URL('https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiJ-Ek-_EeA.woff2')
  // ).then((res) => res.arrayBuffer());

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
          fontFamily: 'Inter',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              fontSize: '72px',
              fontWeight: 'bold',
              color: '#166534',
              marginBottom: '20px',
              textShadow: '2px 2px 4px rgba(0,0,0,0.1)',
            }}
          >
            {title}
          </div>
          {subtitle && (
            <div
              style={{
                fontSize: '32px',
                color: '#15803d',
                marginTop: '10px',
              }}
            >
              {subtitle}
            </div>
          )}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginTop: '40px',
              padding: '15px 30px',
              background: '#166534',
              borderRadius: '50px',
              color: 'white',
              fontSize: '24px',
              fontWeight: '600',
            }}
          >
            Lingo - Learn Languages Online
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}

export default function OpenGraphImage({
  title,
  subtitle,
  locale = 'en',
  type = 'default',
}: OpenGraphImageProps) {
  return null;
}
