"use client";

import { SiteNav } from "@/components/marketing/SiteNav";
import { HeroSection } from "@/components/marketing/HeroSection";
import { AntiCompetitorSection } from "@/components/marketing/AntiCompetitorSection";
import { HowItWorksSection } from "@/components/marketing/HowItWorksSection";
import { LiveExampleSection } from "@/components/marketing/LiveExampleSection";
import { SocialProofSection } from "@/components/marketing/SocialProofSection";
import { ExtensionPromoSection } from "@/components/marketing/ExtensionPromoSection";
import { FinalCTASection } from "@/components/marketing/FinalCTASection";
import { SiteFooter } from "@/components/marketing/SiteFooter";

export default function HomePageClient() {
  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <HeroSection />
      <AntiCompetitorSection />
      <HowItWorksSection />
      <LiveExampleSection />
      <SocialProofSection />
      <ExtensionPromoSection />
      <FinalCTASection />
      <SiteFooter />
    </div>
  );
}
