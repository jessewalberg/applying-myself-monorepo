"use client";

import { Card, CardContent } from "@applyingmyself/ui/components/card";
import { useScrollAnimation } from "@applyingmyself/ui/hooks/useScrollAnimation";

const comparisons = [
  {
    bad: "Paywall after 3 uses",
    good: "Unlimited. Forever. We mean it.",
  },
  {
    bad: "Robotic templates with your name swapped in",
    good: "Matches your voice from your actual resume",
  },
  {
    bad: "No way to track where you applied",
    good: "Built-in dashboard to track every application.",
  },
];

function ComparisonCard({
  bad,
  good,
  index,
}: {
  bad: string;
  good: string;
  index: number;
}) {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.2 });

  return (
    <Card
      ref={ref}
      className={`bg-card/60 backdrop-blur-sm border-border/50 transition-all duration-700 hover:-translate-y-1 hover:border-primary/30 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
      style={{ transitionDelay: `${index * 150}ms` }}
    >
      <CardContent className="p-6 space-y-4">
        <p className="text-muted-foreground line-through decoration-muted-foreground/40 text-sm">
          &ldquo;{bad}&rdquo;
        </p>
        <p className="text-primary font-semibold text-lg">
          &ldquo;{good}&rdquo;
        </p>
      </CardContent>
    </Card>
  );
}

export function AntiCompetitorSection() {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.1 });

  return (
    <section className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <h2
          ref={ref}
          className={`font-display text-3xl md:text-5xl text-foreground mb-4 transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          Not another cover letter template<span className="text-primary">.</span>
        </h2>
        <p
          className={`text-muted-foreground text-lg mb-12 max-w-2xl transition-all duration-700 delay-100 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          Every competitor hides behind paywalls and generic templates.
          We built something different.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {comparisons.map((item, i) => (
            <ComparisonCard key={i} {...item} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
