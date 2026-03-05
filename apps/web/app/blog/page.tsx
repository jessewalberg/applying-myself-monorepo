import Link from "next/link";
import type { Metadata } from "next";
import { SiteNav } from "@/components/marketing/SiteNav";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { Badge } from "@applyingmyself/ui/components/badge";
import { posts } from "./posts";

export const metadata: Metadata = {
  title: "Blog - Cover Letter Tips & Job Search Advice",
  description:
    "Expert advice on cover letters, job applications, and career growth. Learn how to write better cover letters and track your job search with AI.",
  openGraph: {
    title: "Blog - Applying Myself",
    description:
      "Cover letter tips, job search strategies, and career advice.",
    type: "website",
    url: "https://applyingmyself.com/blog",
  },
  alternates: {
    canonical: "https://applyingmyself.com/blog",
  },
};

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteNav />

      <main className="pt-24 pb-16">
        <div className="max-w-3xl mx-auto px-6">
          <div className="mb-12">
            <h1 className="font-display text-4xl md:text-5xl text-foreground mb-3">
              Blog<span className="text-primary">.</span>
            </h1>
            <p className="text-muted-foreground max-w-lg">
              Cover letter advice, job search strategies, and product updates.
            </p>
          </div>

          <div className="space-y-6">
            {posts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="block group rounded-xl border border-border/50 bg-card/60 p-6 hover:border-border transition-colors"
              >
                <div className="flex items-center gap-3 mb-3">
                  <Badge
                    variant="outline"
                    className="text-[11px] bg-primary/10 text-primary border-primary/20"
                  >
                    {post.category}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {post.readTime} read
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(post.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <h2 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors mb-2">
                  {post.title}
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {post.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
