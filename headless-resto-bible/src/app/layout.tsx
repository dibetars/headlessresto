
import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";

const manrope = Manrope({ 
  subsets: ["latin"],
  variable: '--font-manrope',
  weight: ['200', '300', '400', '500', '600', '700', '800'],
});

export const metadata: Metadata = {
  title: "HeadlessResto — The operating system for serious restaurants",
  description: "360 restaurant management: KDS, QR ordering, POS, delivery, and staff scheduling. Offline-first. No per-order fees.",
  icons: {
    icon: '/favicon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${manrope.variable}`}>
      <body className={`${manrope.className} bg-white text-gray-800 antialiased`}>{children}</body>
    </html>
  );
}
