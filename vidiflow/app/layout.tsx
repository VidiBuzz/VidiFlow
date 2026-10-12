import type { Metadata } from 'next';
import localFont from 'next/font/local';
import Script from 'next/script';
import './globals.css';

const kumbh = localFont({
  src: './fonts/KumbhSans-Variable.ttf',
  weight: '100 900',
  style: 'normal',
  display: 'swap',
  variable: '--font-kumbh',
});

export const metadata: Metadata = {
  title: 'VidiSmart Bandwidth Lab — Swap parts, see tokens flow',
  description:
    'Interactive memory-bandwidth ladder and smart-stack configurator: pick GPUs, platforms, and models, and see whether your rig fits, offloads, or collapses — with every number source-linked.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={kumbh.variable}>
      <head>
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
      </head>
      <body>
        {children}
        <Script src="/vendor/gsap.min.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}