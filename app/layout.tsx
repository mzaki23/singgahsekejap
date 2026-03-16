import type { Metadata } from 'next';
import './globals.css';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/next-auth';
import SessionProvider from '@/components/providers/SessionProvider';
import { Toaster } from 'react-hot-toast';
import CookieBanner from '@/components/CookieBanner';
import WelcomeBanner from '@/components/WelcomeBanner';
import BackToTop from '@/components/BackToTop';

export const metadata: Metadata = {
  title: 'Singgah Sekejap - Panduan Wisata & Kuliner Batam',
  description: 'Website interaktif untuk menemukan tempat wisata, kuliner, dan aktivitas menarik di Batam dengan desain Y2K retro yang playful!',
  keywords: ['batam', 'wisata', 'kuliner', 'travel', 'indonesia', 'panduan'],
  authors: [{ name: 'Singgah Sekejap Team' }],
  openGraph: {
    title: 'Singgah Sekejap',
    description: 'Panduan Wisata & Kuliner Batam',
    type: 'website',
    locale: 'id_ID'
  }
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bangers&family=Caveat:wght@700&family=Fredoka:wght@400;600;700&family=Permanent+Marker&family=Playfair+Display:wght@400;700;900&family=Libre+Baskerville:wght@400;700&family=DotGothic16&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-cute bg-[#F5F5DC] text-text-dark overflow-x-hidden">
        <SessionProvider session={session}>
          <div className="fixed inset-0 opacity-30 pointer-events-none z-0"
            style={{
              backgroundImage: `
                repeating-linear-gradient(0deg, rgba(0,0,0,0.01) 0px, transparent 1px, transparent 2px, rgba(0,0,0,0.01) 3px),
                repeating-linear-gradient(90deg, rgba(0,0,0,0.01) 0px, transparent 1px, transparent 2px, rgba(0,0,0,0.01) 3px)
              `
            }}
          />
          <div className="relative z-10">
            {children}
          </div>
          <Toaster position="top-right" />
          <WelcomeBanner />
          <CookieBanner />
          <BackToTop />
        </SessionProvider>
      </body>
    </html>
  );
}
