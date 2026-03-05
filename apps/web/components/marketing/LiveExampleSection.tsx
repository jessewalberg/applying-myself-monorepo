"use client";

import Link from "next/link";
import { Button } from "@applyingmyself/ui/components/button";
import { Card, CardContent } from "@applyingmyself/ui/components/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@applyingmyself/ui/components/tabs";
import { useScrollAnimation } from "@applyingmyself/ui/hooks/useScrollAnimation";

const EXAMPLE_LETTER = `Dear Hiring Team,

I'm reaching out about the Frontend Engineer position at Linear. As someone who's spent the last four years obsessing over interface performance at Vercel, I've developed a deep appreciation for tools that respect the user's time — and Linear is the gold standard.

In my current role, I architected a component library used across 12 product surfaces, reducing bundle size by 34% while improving Lighthouse scores to consistently above 95. I led our migration from REST to tRPC, cutting API-related bugs by 60% and significantly improving the developer experience for our team of 40+ engineers.

What draws me to Linear isn't just the product — it's the philosophy. Building software that's fast isn't just an engineering goal; it's a design decision. That alignment between craft and conviction is exactly where I do my best work.

I'd welcome the opportunity to discuss how my experience in performance-critical UI development can contribute to Linear's mission.

Best,
Marcus Rivera`;

const EXAMPLE_JOB = `Frontend Engineer — Linear

About Linear:
Linear is the issue tracking tool built for modern software teams. We're a small, focused team building a product used by thousands of companies including Vercel, Retool, and Ramp.

What you'll do:
• Build and maintain our web application using React and TypeScript
• Optimize rendering performance for complex, real-time interfaces
• Design and implement our component library and design system
• Work closely with design to ship pixel-perfect, accessible interfaces

What we're looking for:
• 3+ years of experience with React and TypeScript
• Deep understanding of browser rendering, performance optimization
• Experience with design systems and component libraries
• Strong eye for design and attention to detail
• Bonus: Experience with real-time applications, WebSockets`;

export function LiveExampleSection() {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.1 });

  return (
    <section id="examples" className="py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <div
          ref={ref}
          className={`transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <Tabs defaultValue="cover-letter" className="w-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-3xl md:text-4xl text-foreground">
                See it in action<span className="text-primary">.</span>
              </h2>
              <TabsList>
                <TabsTrigger value="cover-letter">Cover Letter</TabsTrigger>
                <TabsTrigger value="job-description">Job Description</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="cover-letter">
              <Card className="bg-card/60 backdrop-blur-sm border-border/50">
                <CardContent className="p-8">
                  <div className="font-mono text-sm text-secondary-foreground leading-relaxed whitespace-pre-wrap">
                    {EXAMPLE_LETTER}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="job-description">
              <Card className="bg-card/60 backdrop-blur-sm border-border/50">
                <CardContent className="p-8">
                  <div className="font-mono text-sm text-secondary-foreground leading-relaxed whitespace-pre-wrap">
                    {EXAMPLE_JOB}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <p className="text-muted-foreground text-sm">
              This took{" "}
              <span className="text-foreground font-semibold">28 seconds</span>.
              How long did your last one take?
            </p>
            <Button asChild size="sm">
              <Link href="/generate">Try it yourself &rarr;</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
