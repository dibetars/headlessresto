import type { Metadata } from "next";
import { Fugaz_One, Work_Sans } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const fugazOne = Fugaz_One({ 
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-fugaz",
});

const workSans = Work_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-work-sans",
});

export const metadata: Metadata = {
  title: "HeadlessResto - Multi-tenant Restaurant Management",
  description: "Modern restaurant management platform",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn(fugazOne.variable, workSans.variable)}>
      <body className={cn(workSans.className, "min-h-screen bg-background antialiased font-work-sans")}>
        {children}
      </body>
    </html>
  );
}
