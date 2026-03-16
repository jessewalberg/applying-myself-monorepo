"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { FileText, Sparkles, Shield } from "lucide-react";
import { ApplyingMyselfLogo } from "@/components/ApplyingMyselfLogo";

interface AuthPageLayoutProps {
  children: ReactNode;
  heading: string;
  subheading: string;
}

export function AuthPageLayout({
  children,
  heading,
  subheading,
}: AuthPageLayoutProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* Noise texture */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Ambient glows */}
      <div className="pointer-events-none absolute -top-40 left-1/3 w-[500px] h-[500px] bg-primary/8 rounded-full blur-[120px]" />
      <div className="pointer-events-none absolute bottom-0 right-1/4 w-80 h-80 bg-accent/5 rounded-full blur-[100px]" />

      <div className="relative mx-auto grid min-h-screen w-full max-w-6xl items-center gap-0 px-4 py-10 sm:px-8 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
        {/* Left — branding panel */}
        <section className="hidden lg:flex lg:flex-col lg:justify-center">
          <Link href="/" className="flex items-center gap-2 mb-12">
            <ApplyingMyselfLogo size="md" className="shrink-0" />
            <span className="font-display italic text-xl text-foreground">
              applying myself
            </span>
            <span className="text-primary text-2xl leading-none">.</span>
          </Link>

          <div className="space-y-4">
            <h1 className="font-display text-4xl xl:text-5xl tracking-tight text-foreground leading-[1.15]">
              {heading}
            </h1>
            <p className="max-w-lg text-lg text-muted-foreground leading-relaxed">
              {subheading}
            </p>
          </div>

          {/* Value props */}
          <div className="mt-12 space-y-5">
            <ValueProp
              icon={<Sparkles className="w-4 h-4" />}
              title="AI-powered generation"
              description="Tailored cover letters in 30 seconds"
            />
            <ValueProp
              icon={<FileText className="w-4 h-4" />}
              title="Resume-matched"
              description="Every letter reflects your real experience"
            />
            <ValueProp
              icon={<Shield className="w-4 h-4" />}
              title="Your data stays yours"
              description="We never share or sell your information"
            />
          </div>

          {/* Testimonial */}
          <div className="mt-12 rounded-lg border border-border/50 bg-card/30 p-5">
            <p className="text-sm text-secondary-foreground leading-relaxed italic">
              &ldquo;I went from spending 45 minutes per cover letter to having a polished draft in under a minute. Landed 3 interviews in my first week.&rdquo;
            </p>
            <div className="mt-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-semibold text-primary">
                JM
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Jordan M.</p>
                <p className="text-xs text-muted-foreground">Product Designer</p>
              </div>
            </div>
          </div>
        </section>

        {/* Right — auth form */}
        <section className="w-full max-w-[420px] justify-self-center">
          {/* Mobile logo */}
          <div className="mb-8 flex flex-col items-center lg:hidden">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <ApplyingMyselfLogo size="md" className="shrink-0" />
              <span className="font-display italic text-xl text-foreground">
                applying myself
              </span>
              <span className="text-primary text-2xl leading-none">.</span>
            </Link>
            <h1 className="font-display text-2xl tracking-tight text-foreground text-center">
              {heading}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground text-center max-w-xs">
              {subheading}
            </p>
          </div>

          <div className="rounded-2xl border border-border/60 bg-card/60 backdrop-blur-sm p-8 shadow-2xl shadow-black/20">
            {children}
          </div>

          <div className="mt-6 text-center">
            <Link
              href="/"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              &larr; Back to home
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

function ValueProp({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
