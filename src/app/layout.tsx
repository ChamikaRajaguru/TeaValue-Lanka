import type { Metadata } from 'next';
import './globals.css';
import { I18nProvider } from '@/lib/i18n/context';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { DemoBanner } from '@/components/DemoBanner';
import { Inter, Noto_Sans_Sinhala } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const notoSansSinhala = Noto_Sans_Sinhala({
  subsets: ['sinhala'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-sinhala',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'TeaValue Lanka — Raw Green Tea Leaf Price Estimation',
  description:
    'Transparent, explainable price estimation tool for Sri Lankan smallholder tea growers. Calculate fresh raw leaf revenue based on verified factory pricing rules and regional market benchmarks.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isDemo = process.env.DEMO_MODE === 'true';

  return (
    <html lang="si" className={`${inter.variable} ${notoSansSinhala.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Noto+Sans+Sinhala:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen flex flex-col bg-cream-50 text-stone-900 font-sans antialiased">
        <I18nProvider>
          {isDemo && <DemoBanner />}
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </I18nProvider>
      </body>
    </html>
  );
}
