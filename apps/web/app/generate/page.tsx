import type { Metadata } from "next";
import { GenerateClient } from "./GenerateClient";

export const metadata: Metadata = {
  title: "Generate Cover Letter",
  description:
    "Generate a personalized, AI-powered cover letter in 30 seconds. Paste a job description and your resume to get started.",
  openGraph: {
    title: "Generate Cover Letter - Applying Myself",
    description:
      "Generate a personalized, AI-powered cover letter in 30 seconds.",
    url: "https://applyingmyself.com/generate",
  },
};

export default function GeneratePage() {
  return <GenerateClient />;
}
