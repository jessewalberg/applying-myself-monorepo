import type { Metadata } from "next";
import { HomePageClient } from "./HomePageClient";

export const metadata: Metadata = {
  title: "AI Cover Letter Generator - Free & Personalized",
  description: "Generate personalized, professional cover letters in seconds with AI. Upload your resume, paste job descriptions, and get hired faster. Try Applying Myself free today!",
  keywords: [
    "AI cover letter generator",
    "cover letter creator",
    "job application",
    "resume builder",
    "career tools",
    "AI job search",
    "personalized cover letters",
    "professional cover letters"
  ],
  openGraph: {
    title: "Applying Myself - Free AI Cover Letter Generator",
    description: "Generate personalized cover letters with AI technology. Upload your resume, paste job descriptions, and get hired faster.",
    type: "website",
    url: "https://applyingmyself.com",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Applying Myself AI Cover Letter Generator Homepage",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Applying Myself - Free AI Cover Letter Generator",
    description: "Generate personalized cover letters with AI technology",
    images: ["/twitter-image.png"],
  },
  alternates: {
    canonical: "https://applyingmyself.com",
  },
};

export default function HomePage() {
  return <HomePageClient />;
}