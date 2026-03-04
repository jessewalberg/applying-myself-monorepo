"use client";

import type { ReactNode } from "react";
import Link from "next/link";
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
    <div className="relative min-h-screen overflow-hidden bg-slate-50">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(124,58,237,0.18),transparent_45%),radial-gradient(ellipse_at_bottom_right,_rgba(14,165,233,0.12),transparent_45%)]" />

      <div className="relative mx-auto grid min-h-screen w-full max-w-6xl items-center gap-10 px-4 py-10 sm:px-8 lg:grid-cols-2">
        <section className="hidden lg:block">
          <div className="flex items-center gap-3">
            <ApplyingMyselfLogo size="md" />
            <span className="text-xl font-semibold text-slate-900">Applying Myself</span>
          </div>
          <div className="mt-6 space-y-3">
            <h1 className="text-4xl font-semibold tracking-tight text-slate-900">{heading}</h1>
            <p className="max-w-md text-lg text-slate-600">{subheading}</p>
          </div>
        </section>

        <section className="mx-auto w-full max-w-md">
          <div className="mb-6 flex justify-center lg:hidden">
            <ApplyingMyselfLogo size="lg" />
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60">
            {children}
          </div>

          <div className="mt-6 text-center">
            <Link
              href="/"
              className="font-medium text-violet-600 transition-colors hover:text-violet-700"
            >
              ← Back to home
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
