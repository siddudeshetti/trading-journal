// app/layout.tsx
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Trading Journal Pro - Track, Analyze, Improve',
  description: 'Professional trading journal for crypto and stock traders. Track your trades, analyze performance, and improve your edge.',
  keywords: ['trading journal', 'crypto trading', 'stock trading', 'trade tracker', 'trading analytics'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
