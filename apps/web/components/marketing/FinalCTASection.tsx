import Link from "next/link";
import { Button } from "@applyingmyself/ui/components/button";

export function FinalCTASection() {
  return (
    <section className="py-32 px-6 bg-muted/50 relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-primary/5 rounded-full blur-3xl" />

      <div className="max-w-3xl mx-auto text-center relative">
        <h2 className="font-display text-4xl md:text-6xl text-foreground mb-6 leading-tight">
          Your next cover letter is 30 seconds away
          <span className="text-primary">.</span>
        </h2>
        <div className="flex flex-col items-center gap-4">
          <Button asChild size="lg" className="text-base px-10 h-13">
            <Link href="/generate">Start Writing &rarr;</Link>
          </Button>
          <p className="text-sm text-muted-foreground">
            Paste a job description and get a tailored letter in seconds.
          </p>
        </div>
      </div>
    </section>
  );
}
