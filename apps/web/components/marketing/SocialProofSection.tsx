"use client";

import { Card, CardContent } from "@applyingmyself/ui/components/card";
import { useScrollAnimation } from "@applyingmyself/ui/hooks/useScrollAnimation";

const testimonials = [
  {
    quote:
      "I went from spending 45 minutes per cover letter to under a minute. Got three interviews in my first week.",
    name: "Sarah K.",
    role: "Product Designer",
    initials: "SK",
  },
  {
    quote:
      "The letters actually sound like me — not like ChatGPT wrote them. My recruiter friend couldn't tell the difference.",
    name: "James T.",
    role: "Software Engineer",
    initials: "JT",
  },
  {
    quote:
      "Applied to 30 jobs in a weekend. Before this, I'd been putting off applications for weeks because cover letters felt like a chore.",
    name: "Priya M.",
    role: "Marketing Manager",
    initials: "PM",
  },
];

const stats = [
  { value: "50K+", label: "Letters generated" },
  { value: "30s", label: "Average generation" },
  { value: "4.8/5", label: "User rating" },
  { value: "89%", label: "Interview rate increase" },
];

export function SocialProofSection() {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.1 });

  return (
    <section className="py-24 px-6 bg-muted/30">
      <div className="max-w-7xl mx-auto">
        <h2
          ref={ref}
          className={`font-display text-3xl md:text-5xl text-foreground mb-12 text-center transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          People are landing interviews<span className="text-primary">.</span>
        </h2>

        {/* Testimonials */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {testimonials.map((t, i) => (
            <TestimonialCard key={i} {...t} index={i} />
          ))}
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <StatCard key={i} {...stat} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function TestimonialCard({
  quote,
  name,
  role,
  initials,
  index,
}: {
  quote: string;
  name: string;
  role: string;
  initials: string;
  index: number;
}) {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.2 });

  return (
    <Card
      ref={ref}
      className={`bg-card/60 backdrop-blur-sm border-border/50 transition-all duration-700 hover:-translate-y-1 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
      style={{ transitionDelay: `${index * 150}ms` }}
    >
      <CardContent className="p-6">
        <p className="text-secondary-foreground text-sm leading-relaxed mb-4">
          &ldquo;{quote}&rdquo;
        </p>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center text-primary text-xs font-semibold">
            {initials}
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">{name}</p>
            <p className="text-xs text-muted-foreground">{role}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function StatCard({
  value,
  label,
  index,
}: {
  value: string;
  label: string;
  index: number;
}) {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.3 });

  return (
    <div
      ref={ref}
      className={`text-center p-4 transition-all duration-700 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      <p className="text-3xl md:text-4xl font-bold text-primary tabular-nums">
        {value}
      </p>
      <p className="text-sm text-muted-foreground mt-1">{label}</p>
    </div>
  );
}
