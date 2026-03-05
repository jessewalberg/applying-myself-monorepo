import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SiteNav } from "@/components/marketing/SiteNav";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { Badge } from "@applyingmyself/ui/components/badge";
import { Button } from "@applyingmyself/ui/components/button";
import { ArrowLeft } from "lucide-react";
import { posts, getPostBySlug } from "../posts";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};

  return {
    title: post.title,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      url: `https://applyingmyself.com/blog/${post.slug}`,
      publishedTime: post.date,
    },
    alternates: {
      canonical: `https://applyingmyself.com/blog/${post.slug}`,
    },
  };
}

function renderContent(content: string) {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let inBlockquote = false;
  let blockquoteLines: string[] = [];

  const flushBlockquote = () => {
    if (blockquoteLines.length > 0) {
      elements.push(
        <blockquote
          key={`bq-${elements.length}`}
          className="border-l-2 border-primary/40 pl-4 my-6 text-secondary-foreground italic"
        >
          {blockquoteLines.map((line, i) => (
            <p key={i} className="text-sm leading-relaxed mb-2 last:mb-0">
              {line}
            </p>
          ))}
        </blockquote>
      );
      blockquoteLines = [];
    }
    inBlockquote = false;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith("> ")) {
      inBlockquote = true;
      blockquoteLines.push(line.slice(2));
      continue;
    } else if (inBlockquote && line.startsWith(">")) {
      blockquoteLines.push(line.slice(1).trim());
      continue;
    } else if (inBlockquote) {
      flushBlockquote();
    }

    if (line.startsWith("## ")) {
      elements.push(
        <h2
          key={i}
          className="text-xl font-semibold text-foreground mt-10 mb-4"
        >
          {line.slice(3)}
        </h2>
      );
    } else if (line.startsWith("**") && line.endsWith("**")) {
      elements.push(
        <p key={i} className="text-sm font-semibold text-foreground mt-4 mb-1">
          {line.slice(2, -2)}
        </p>
      );
    } else if (line.startsWith("**")) {
      const boldEnd = line.indexOf("**", 2);
      if (boldEnd > 0) {
        const boldText = line.slice(2, boldEnd);
        const rest = line.slice(boldEnd + 2);
        elements.push(
          <p key={i} className="text-sm text-secondary-foreground leading-relaxed mb-3">
            <strong className="text-foreground">{boldText}</strong>
            {rest}
          </p>
        );
      } else {
        elements.push(
          <p key={i} className="text-sm text-secondary-foreground leading-relaxed mb-3">
            {line}
          </p>
        );
      }
    } else if (line.startsWith("- ")) {
      elements.push(
        <li key={i} className="text-sm text-secondary-foreground leading-relaxed ml-4 mb-1 list-disc">
          {line.slice(2).replace(/\*\*(.*?)\*\*/g, "$1")}
        </li>
      );
    } else if (line.match(/^\d+\. /)) {
      elements.push(
        <li key={i} className="text-sm text-secondary-foreground leading-relaxed ml-4 mb-1 list-decimal">
          {line.replace(/^\d+\. /, "").replace(/\*\*(.*?)\*\*/g, "$1")}
        </li>
      );
    } else if (line.trim() === "") {
      continue;
    } else {
      elements.push(
        <p key={i} className="text-sm text-secondary-foreground leading-relaxed mb-3">
          {line}
        </p>
      );
    }
  }

  flushBlockquote();
  return elements;
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const currentIndex = posts.findIndex((p) => p.slug === slug);
  const prevPost = currentIndex > 0 ? posts[currentIndex - 1] : null;
  const nextPost =
    currentIndex < posts.length - 1 ? posts[currentIndex + 1] : null;

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />

      <main className="pt-24 pb-16">
        <article className="max-w-2xl mx-auto px-6">
          {/* Back link */}
          <Link
            href="/blog"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            All posts
          </Link>

          {/* Header */}
          <header className="mb-10">
            <div className="flex items-center gap-3 mb-4">
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
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
            <h1 className="font-display text-3xl md:text-4xl text-foreground leading-tight">
              {post.title}
            </h1>
          </header>

          {/* Content */}
          <div className="mb-16">{renderContent(post.content)}</div>

          {/* CTA */}
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-6 mb-12 text-center">
            <p className="text-foreground font-semibold mb-2">
              Ready to try it?
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              Generate a tailored cover letter in 30 seconds.
            </p>
            <Button asChild>
              <Link href="/generate">Generate Your Cover Letter</Link>
            </Button>
          </div>

          {/* Navigation */}
          <div className="flex items-stretch gap-4 border-t border-border/40 pt-8">
            {prevPost ? (
              <Link
                href={`/blog/${prevPost.slug}`}
                className="flex-1 rounded-xl border border-border/50 bg-card/60 p-4 hover:border-border transition-colors"
              >
                <span className="text-xs text-muted-foreground">Previous</span>
                <p className="text-sm font-medium text-foreground mt-1 line-clamp-2">
                  {prevPost.title}
                </p>
              </Link>
            ) : (
              <div className="flex-1" />
            )}
            {nextPost ? (
              <Link
                href={`/blog/${nextPost.slug}`}
                className="flex-1 rounded-xl border border-border/50 bg-card/60 p-4 hover:border-border transition-colors text-right"
              >
                <span className="text-xs text-muted-foreground">Next</span>
                <p className="text-sm font-medium text-foreground mt-1 line-clamp-2">
                  {nextPost.title}
                </p>
              </Link>
            ) : (
              <div className="flex-1" />
            )}
          </div>
        </article>
      </main>

      <SiteFooter />
    </div>
  );
}
