"use client";

import { ClipboardList, FileText, Sparkles } from "lucide-react";
import { useScrollAnimation } from "@applyingmyself/ui/hooks/useScrollAnimation";

const steps = [
  {
    icon: ClipboardList,
    title: "Paste the job post",
    description: "Copy the job listing from any site. We extract what matters.",
  },
  {
    icon: FileText,
    title: "Add your background",
    description: "Upload a resume or paste your experience. We learn your voice.",
  },
  {
    icon: Sparkles,
    title: "Get your letter & track it",
    description: "A tailored cover letter that sounds like you — plus a dashboard to track every application.",
  },
];

export function HowItWorksSection() {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.1 });

  return (
    <section id="how-it-works" className="scroll-mt-24 py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <h2
          ref={ref}
          className={`font-display text-3xl md:text-5xl text-foreground mb-16 text-center transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          Three steps. Thirty seconds<span className="text-primary">.</span>
        </h2>

        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
          {/* Connecting line (desktop) */}
          <div className="hidden md:block absolute top-12 left-[16.67%] right-[16.67%] h-px bg-gradient-to-r from-transparent via-border to-transparent" />

          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <StepCard key={i} icon={Icon} title={step.title} description={step.description} index={i} />
            );
          })}
        </div>
      </div>
    </section>
  );
}

function StepCard({
  icon: Icon,
  title,
  description,
  index,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  index: number;
}) {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.2 });

  return (
    <div
      ref={ref}
      className={`text-center transition-all duration-700 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
      style={{ transitionDelay: `${index * 200}ms` }}
    >
      {/* Step number + icon */}
      <div className="relative inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-card border border-border/60 mb-6">
        <Icon className="w-8 h-8 text-primary" />
        <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
          {index + 1}
        </span>
      </div>

      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm max-w-xs mx-auto">
        {description}
      </p>
    </div>
  );
}
