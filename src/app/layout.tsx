import type { Metadata } from 'next';
import './globals.css';
import { I18nProvider } from '@/lib/i18n/context';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { DemoBanner } from '@/components/DemoBanner';
import { Inter, Noto_Sans_Sinhala, Outfit } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
});

const notoSansSinhala = Noto_Sans_Sinhala({
  subsets: ['sinhala'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-sinhala',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'TeaValue Lanka — Next-Gen Raw Green Leaf Price Intelligence',
  description:
    'Futuristic agri-valuation platform for Sri Lankan smallholder tea growers. Deterministic price estimation powered by verified factory intelligence and market benchmarks.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isDemo = process.env.DEMO_MODE === 'true';

  return (
    <html lang="si" className={`${inter.variable} ${outfit.variable} ${notoSansSinhala.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&family=Inter:wght@400;500;600;700&family=Noto+Sans+Sinhala:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="relative overflow-x-hidden min-h-screen flex flex-col bg-[#f8faf9] text-stone-900 font-sans antialiased selection:bg-emerald-100 selection:text-emerald-900">
        {/* Soft Modern Green Ambient Glow & Grid Background */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-emerald-200/30 blur-[130px]" />
          <div className="absolute top-1/4 -right-32 w-[500px] h-[500px] rounded-full bg-teal-100/40 blur-[150px]" />
          <div className="absolute -bottom-32 left-1/3 w-[600px] h-[600px] rounded-full bg-emerald-100/35 blur-[160px]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#05966908_1px,transparent_1px),linear-gradient(to_bottom,#05966908_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_60%_at_50%_0%,#000_80%,transparent_100%)]" />
        </div>

        <I18nProvider>
          <div className="relative z-10 flex flex-col min-h-screen">
            {isDemo && <DemoBanner />}
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </I18nProvider>
      </body>
    </html>
  );
}
