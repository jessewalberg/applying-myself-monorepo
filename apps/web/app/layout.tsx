import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Fraunces, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ConvexProvider } from "@/components/ConvexProvider";
import { Analytics } from "@vercel/analytics/next";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Applying Myself - AI-Powered Cover Letters",
    template: "%s | Applying Myself - AI-Powered Cover Letters"
  },
  description: "Generate personalized cover letters with AI technology. Upload your resume and let Applying Myself create compelling cover letters tailored to any job posting.",
  keywords: [
    "AI cover letter generator",
    "automated cover letters",
    "job application tools",
    "resume cover letter matching",
    "cover letter AI",
    "job search automation",
    "personalized cover letters",
    "cover letter writing assistant",
    "AI job application",
    "professional cover letters"
  ],
  authors: [{ name: "Applying Myself Team" }],
  creator: "Applying Myself Team",
  publisher: "Applying Myself",
  applicationName: "Applying Myself",
  generator: "Next.js",
  referrer: "origin-when-cross-origin",
  colorScheme: "dark",
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/icon-152x152.png", sizes: "152x152", type: "image/png" },
    ],
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://applyingmyself.com",
    title: "Applying Myself - AI-Powered Cover Letters",
    description: "Generate personalized cover letters with AI technology. Upload your resume and let Applying Myself create compelling cover letters tailored to any job posting.",
    siteName: "Applying Myself",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Applying Myself - AI-Powered Cover Letters",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Applying Myself - AI-Powered Cover Letters",
    description: "Generate personalized cover letters with AI technology",
    images: ["/twitter-image.png"],
    creator: "@applyingmyself",
    site: "@applyingmyself",
  },
  alternates: {
    canonical: "https://applyingmyself.com",
  },
  category: "technology",
  classification: "Business Software",
  other: {
    "google-site-verification": "your-google-site-verification-code",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#d97706" },
    { media: "(prefers-color-scheme: dark)", color: "#0f0d0a" }
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${plusJakarta.variable} ${fraunces.variable} ${jetbrainsMono.variable}`}>
      <body className="font-sans antialiased bg-background text-foreground">
        <ConvexProvider>
          {children}
        </ConvexProvider>
        <Analytics />
      </body>
    </html>
  );
}
