import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ConvexProvider } from "@/components/ConvexProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "CoverCraft - AI-Powered Cover Letters",
  description: "Generate personalized cover letters with AI technology. Upload your resume and let CoverCraft create compelling cover letters tailored to any job posting.",
  keywords: ["cover letter", "AI", "job application", "resume", "career"],
  authors: [{ name: "CoverCraft Team" }],
  openGraph: {
    title: "CoverCraft - AI-Powered Cover Letters",
    description: "Generate personalized cover letters with AI technology",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-inter antialiased bg-white text-gray-900">
        <ConvexProvider>
          {children}
        </ConvexProvider>
      </body>
    </html>
  );
}
