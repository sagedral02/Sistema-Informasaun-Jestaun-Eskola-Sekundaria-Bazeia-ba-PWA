import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'NOSSEF Railaco | Sistema Informasaun Jestaun Eskola Sekundaria Bazeia ba PWA',
  description:
    'Sistema Informasaun Jestaun Eskola Sekundaria Bazeia ba PWA ba Escola Secundaria Catolica Nossa Senhora de Fatima Railaco, Ermera, Timor-Leste',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    apple: '/icons/icon-192x192.png',
  },
  applicationName: 'NOSSEF PWA',
  keywords: ['NOSSEF', 'Railaco', 'Ermera', 'Timor-Leste', 'Eskola Sekundária', 'PWA', 'Jestaun Eskolár'],
};

export const viewport: Viewport = {
  themeColor: '#080d1a',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tet">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body>
        {children}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(
                    function(reg) {
                      console.log('PWA ServiceWorker registadu ho susesu: ', reg.scope);
                    },
                    function(err) {
                      console.log('Falla rejistu PWA ServiceWorker: ', err);
                    }
                  );
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
