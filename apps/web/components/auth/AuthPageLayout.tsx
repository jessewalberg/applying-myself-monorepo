"use client";

import type { ReactNode } from "react";
import Link from "next/link";

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
      {/* Ambient glow */}
      <div className="pointer-events-none absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-1/4 w-64 h-64 bg-accent/5 rounded-full blur-3xl" />

      <div className="relative mx-auto grid min-h-screen w-full max-w-6xl items-center gap-10 px-4 py-10 sm:px-8 lg:grid-cols-2">
        {/* Left — branding */}
        <section className="hidden lg:block">
          <Link href="/" className="flex items-center gap-1">
            <span className="font-display italic text-xl text-foreground">
              applying myself
            </span>
            <span className="text-primary text-2xl leading-none">.</span>
          </Link>
          <div className="mt-8 space-y-3">
            <h1 className="font-display text-4xl tracking-tight text-foreground">
              {heading}
            </h1>
            <p className="max-w-md text-lg text-muted-foreground">
              {subheading}
            </p>
          </div>
        </section>

        {/* Right — auth form */}
        <section className="mx-auto w-full max-w-md">
          <div className="mb-6 flex justify-center lg:hidden">
            <Link href="/" className="flex items-center gap-1">
              <span className="font-display italic text-xl text-foreground">
                applying myself
              </span>
              <span className="text-primary text-2xl leading-none">.</span>
            </Link>
          </div>

          <div className="rounded-xl border border-border bg-card p-6 shadow-xl shadow-black/10">
            {children}
          </div>

          <div className="mt-6 text-center">
            <Link
              href="/"
              className="text-sm font-medium text-primary transition-colors hover:text-primary/80"
            >
              &larr; Back to home
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
