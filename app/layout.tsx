import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {
  metadataBase: new URL('https://mobarez.honest-siren-5859.chatgpt.site'),
  title: 'مبارز | افسانه‌ات را زندگی کن',
  description:
    'یک بازی نقش‌آفرینی فارسی در ایران اسطوره‌ای. لشکرکشی کن، غنیمت به دست بیاور و پهلوان شو.',
  openGraph: {
    title: 'مبارز | افسانه‌ات را زندگی کن',
    description: 'ماجراجویی در سرزمین افسانه‌های ایران',
    locale: 'fa_IR',
    type: 'website',
    images: [
      {
        url: 'https://mobarez.honest-siren-5859.chatgpt.site/og.png',
        width: 1536,
        height: 1024,
        alt: 'مبارز، افسانه‌ات را زندگی کن',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['https://mobarez.honest-siren-5859.chatgpt.site/og.png'],
    title: 'مبارز',
    description: 'ماجراجویی در سرزمین افسانه‌های ایران',
  },
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fa" dir="rtl" className="dark">
      <body>{children}</body>
    </html>
  );
}
