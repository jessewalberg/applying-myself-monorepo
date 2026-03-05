import Link from "next/link";
import { Separator } from "@applyingmyself/ui/components/separator";

export function SiteFooter() {
  return (
    <footer className="py-12 px-6 border-t border-border/40">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-1">
            <span className="font-display italic text-lg text-foreground">
              applying myself
            </span>
            <span className="text-primary text-xl leading-none">.</span>
          </Link>

          {/* Links */}
          <div className="flex items-center gap-6">
            <Link
              href="/privacy"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Terms
            </Link>
            <Link
              href="/contact"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Contact
            </Link>
            <Link
              href="/blog"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Blog
            </Link>
          </div>
        </div>

        <Separator className="my-8 bg-border/40" />

        <p className="text-xs text-muted-foreground">
          Built for job seekers who&apos;d rather be interviewing.
        </p>
      </div>
    </footer>
  );
}
