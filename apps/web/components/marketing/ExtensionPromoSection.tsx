"use client";

import { Chrome } from "lucide-react";
import { Button } from "@applyingmyself/ui/components/button";
import { Card, CardContent } from "@applyingmyself/ui/components/card";
import { Badge } from "@applyingmyself/ui/components/badge";
import { useScrollAnimation } from "@applyingmyself/ui/hooks/useScrollAnimation";

export function ExtensionPromoSection() {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.1 });

  return (
    <section className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div
          ref={ref}
          className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          {/* Left — Copy */}
          <div>
            <Badge variant="outline" className="mb-4 text-xs">
              Chrome Extension
            </Badge>
            <h2 className="font-display text-3xl md:text-5xl text-foreground mb-4">
              Generate cover letters without leaving the job board
              <span className="text-primary">.</span>
            </h2>
            <p className="text-muted-foreground text-lg mb-8 max-w-lg">
              See a job you like on LinkedIn, Indeed, or any job board? Click the
              extension, and your cover letter is ready before you finish reading
              the posting.
            </p>
            <Button size="lg" className="gap-2">
              <Chrome className="w-4 h-4" />
              Add to Chrome &mdash; Free
            </Button>
          </div>

          {/* Right — Browser mockup */}
          <div className="relative">
            <Card className="bg-card/60 backdrop-blur-sm border-border/50 overflow-hidden">
              <CardContent className="p-0">
                {/* Browser chrome */}
                <div className="flex items-center gap-2 px-4 py-3 border-b border-border/40 bg-muted/30">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-destructive/60" />
                    <div className="w-3 h-3 rounded-full bg-primary/40" />
                    <div className="w-3 h-3 rounded-full bg-green-500/40" />
                  </div>
                  <div className="flex-1 mx-4">
                    <div className="bg-muted/50 rounded-md px-3 py-1 text-xs text-muted-foreground">
                      linkedin.com/jobs/senior-frontend-engineer
                    </div>
                  </div>
                </div>

                {/* Job listing body */}
                <div className="p-6 min-h-[300px] relative">
                  <div className="space-y-3">
                    <div className="h-6 w-3/4 bg-muted/50 rounded" />
                    <div className="h-4 w-1/2 bg-muted/30 rounded" />
                    <div className="h-4 w-full bg-muted/20 rounded mt-4" />
                    <div className="h-4 w-full bg-muted/20 rounded" />
                    <div className="h-4 w-5/6 bg-muted/20 rounded" />
                    <div className="h-4 w-full bg-muted/20 rounded mt-4" />
                    <div className="h-4 w-3/4 bg-muted/20 rounded" />
                  </div>

                  {/* Extension popup overlay */}
                  <div className="absolute top-4 right-4 w-56 bg-card border border-border rounded-xl shadow-2xl shadow-black/20 p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded bg-primary flex items-center justify-center">
                        <span className="text-[8px] font-bold text-primary-foreground">am</span>
                      </div>
                      <span className="text-xs font-semibold text-foreground">
                        applying myself
                      </span>
                    </div>
                    <div className="h-2 w-full bg-primary/20 rounded-full overflow-hidden">
                      <div className="h-full w-3/4 bg-primary rounded-full animate-pulse" />
                    </div>
                    <p className="text-[10px] text-muted-foreground">
                      Generating your cover letter...
                    </p>
                    <div className="bg-muted/50 rounded-lg p-2 space-y-1">
                      <div className="h-2 w-full bg-muted-foreground/10 rounded" />
                      <div className="h-2 w-5/6 bg-muted-foreground/10 rounded" />
                      <div className="h-2 w-4/6 bg-muted-foreground/10 rounded" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
