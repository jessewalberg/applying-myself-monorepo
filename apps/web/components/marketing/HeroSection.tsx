"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@applyingmyself/ui/components/button";
import { Badge } from "@applyingmyself/ui/components/badge";
import { Textarea } from "@applyingmyself/ui/components/textarea";
import { Card, CardContent } from "@applyingmyself/ui/components/card";
import { Upload } from "lucide-react";

const SAMPLE_LETTER = `Dear Hiring Manager,

I'm writing to express my strong interest in the Senior Product Designer role at Figma. With 6 years of experience shipping design systems at scale, I bring a unique perspective that bridges design craft with engineering pragmatism.

At my current role at Stripe, I led the redesign of our checkout flow, resulting in a 23% increase in conversion rates across 40+ markets. I thrive in the ambiguity of 0-to-1 product work — the exact environment Figma describes for this role.

What excites me most about Figma is the belief that design tools should be collaborative by default. I've spent my career making that belief tangible in the products I ship.

I'd love to discuss how my experience building at the intersection of design and developer tools aligns with Figma's next chapter.

Best regards,
Sarah Chen`;

function TypingCursor() {
  return (
    <span className="inline-block w-0.5 h-5 bg-primary animate-typing-cursor ml-0.5 align-text-bottom" />
  );
}

function useTyping(text: string, speed = 25, startDelay = 800) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    let i = 0;
    let timeout: ReturnType<typeof setTimeout>;

    const start = setTimeout(() => {
      const type = () => {
        if (i < text.length) {
          setDisplayed(text.slice(0, i + 1));
          i++;
          const delay = speed + (Math.random() - 0.5) * speed * 0.8;
          timeout = setTimeout(type, Math.max(8, delay));
        } else {
          setDone(true);
        }
      };
      type();
    }, startDelay);

    return () => {
      clearTimeout(start);
      clearTimeout(timeout);
    };
  }, [text, speed, startDelay]);

  return { displayed, done };
}

function CountUp({ target, duration = 2000 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const start = Date.now();
    const step = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration]);

  return <>{count.toLocaleString()}</>;
}

export function HeroSection() {
  const { displayed, done } = useTyping(SAMPLE_LETTER);

  return (
    <section className="relative min-h-screen pt-24 pb-16 overflow-hidden">
      {/* Noise texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Ambient glow */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-accent/5 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto px-6">
        {/* Headline */}
        <div className="max-w-3xl mb-12" style={{ animationDelay: "0ms" }}>
          <h1
            className="font-display text-4xl md:text-6xl lg:text-7xl text-foreground leading-[1.1] tracking-tight opacity-0 animate-fade-up"
          >
            Cover letters that sound like{" "}
            <span className="italic text-primary">you</span> wrote them.
          </h1>
          <p
            className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl opacity-0 animate-fade-up"
            style={{ animationDelay: "150ms" }}
          >
            Paste a job description. Get a tailored cover letter in 30 seconds.
            No signup required.
          </p>
        </div>

        {/* Split layout: Input / Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-[55fr_45fr] gap-6 mb-10">
          {/* LEFT — Input card */}
          <Card
            className="opacity-0 animate-fade-up bg-card/50 backdrop-blur-sm border-border/50"
            style={{ animationDelay: "300ms" }}
          >
            <CardContent className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Job Description
                </label>
                <Textarea
                  placeholder="Paste the job description here..."
                  className="min-h-[180px] bg-background/50 text-foreground placeholder:text-muted-foreground resize-none"
                  rows={8}
                />
              </div>

              <div className="flex items-center gap-3">
                <div className="flex-1 border-2 border-dashed border-border/60 rounded-lg p-4 text-center hover:border-primary/40 transition-colors cursor-pointer">
                  <Upload className="w-5 h-5 text-muted-foreground mx-auto mb-1" />
                  <span className="text-sm text-muted-foreground">
                    Drop resume or{" "}
                    <span className="text-primary font-medium">browse</span>
                  </span>
                </div>
                <Badge variant="outline" className="text-xs whitespace-nowrap">
                  or connect LinkedIn
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* RIGHT — Preview card */}
          <Card
            className="opacity-0 animate-fade-up bg-card/50 backdrop-blur-sm border-border/50 overflow-hidden"
            style={{ animationDelay: "450ms" }}
          >
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 rounded-full bg-accent" />
                <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                  Live Preview
                </span>
              </div>
              <div className="font-mono text-sm text-secondary-foreground leading-relaxed whitespace-pre-wrap max-h-[280px] overflow-hidden relative">
                {displayed}
                {!done && <TypingCursor />}
                {/* Fade out at bottom */}
                <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-card to-transparent" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CTA */}
        <div
          className="opacity-0 animate-fade-up"
          style={{ animationDelay: "600ms" }}
        >
          <Button
            asChild
            size="lg"
            className="text-base px-8 h-12 hover:animate-glow-pulse"
          >
            <Link href="/generate">Generate Your Cover Letter &rarr;</Link>
          </Button>
        </div>

        {/* Social proof */}
        <p
          className="mt-8 text-sm text-muted-foreground opacity-0 animate-fade-up"
          style={{ animationDelay: "750ms" }}
        >
          <span className="text-foreground font-semibold tabular-nums">
            <CountUp target={14293} />
          </span>{" "}
          cover letters generated this week
        </p>
      </div>
    </section>
  );
}
