import Link from "next/link";
import type { Metadata } from "next";
import { SiteNav } from "@/components/marketing/SiteNav";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { AlertTriangle, Info } from "lucide-react";

export const metadata: Metadata = {
    title: "Terms of Use - Applying Myself AI Cover Letter Generator",
    description: "Applying Myself terms of use and service agreement. Read about user rights, responsibilities, and guidelines for using our AI cover letter generator platform.",
    keywords: [
        "Applying Myself terms of use",
        "terms of service",
        "user agreement",
        "AI cover letter terms",
        "service guidelines"
    ],
    openGraph: {
        title: "Terms of Use - Applying Myself",
        description: "Read Applying Myself's terms of use and service agreement for our AI cover letter generator platform.",
        type: "website",
        url: "https://applyingmyself.com/terms",
    },
    alternates: {
        canonical: "https://applyingmyself.com/terms",
    },
};

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-background">
            <SiteNav />

            <main className="pt-24 pb-16">
                <div className="max-w-3xl mx-auto px-6">
                    {/* Header */}
                    <div className="mb-16">
                        <h1 className="font-display text-4xl md:text-5xl text-foreground mb-4">
                            Terms of Use<span className="text-primary">.</span>
                        </h1>
                        <p className="text-muted-foreground">
                            Last updated: June 16, 2025
                        </p>
                    </div>

                    {/* Introduction */}
                    <div className="mb-12">
                        <p className="text-secondary-foreground leading-relaxed mb-6">
                            These Terms of Use (&ldquo;Terms&rdquo;) govern your access to and use of the services provided by Applying Myself (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) via our websites, platforms, applications and services (collectively, the &ldquo;Service&rdquo;).
                        </p>
                        <div className="rounded-xl border border-primary/20 bg-primary/5 p-5">
                            <p className="text-sm text-secondary-foreground">
                                &ldquo;You&rdquo; refers to the end user or customer (whether a natural person or an organization) who accesses or uses the Service. By accessing or using the Service, you agree to be bound by these Terms. Where you are acting on behalf of an organization, these Terms shall bind that organization, and you represent and warrant that you have the authority to bind that organization to these Terms.
                            </p>
                        </div>
                    </div>

                    {/* Use of Service */}
                    <section className="mb-12">
                        <h2 className="text-2xl font-semibold text-foreground mb-6">Use of the Service</h2>
                        <div className="rounded-xl border border-border/50 bg-card/60 p-6 mb-4">
                            <p className="text-sm text-secondary-foreground mb-4">
                                You agree to use the Service only for lawful purposes and in accordance with these Terms. You must not:
                            </p>
                            <div className="grid md:grid-cols-2 gap-3">
                                {[
                                    "Violate any applicable law or regulation",
                                    "Infringe the rights of any third party",
                                    "Interfere with or disrupt the Service",
                                    "Attempt to gain unauthorized access to the Service or its systems",
                                ].map((item) => (
                                    <div key={item} className="flex items-start gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0" />
                                        <span className="text-sm text-secondary-foreground">{item}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-5">
                            <div className="flex items-start gap-3">
                                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                                <p className="text-sm text-secondary-foreground">
                                    We reserve the right to suspend or terminate your access if you engage in prohibited activities or violate these Terms. We may add, modify or discontinue any aspect of the Service at our own discretion and without further notice.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Disclaimers */}
                    <section className="mb-12">
                        <h2 className="text-2xl font-semibold text-foreground mb-6">Disclaimers</h2>
                        <div className="space-y-4">
                            <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-5">
                                <div className="flex items-start gap-3">
                                    <Info className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                                    <div>
                                        <h4 className="font-semibold text-foreground mb-2 text-sm">Not Professional Advice</h4>
                                        <p className="text-sm text-secondary-foreground">
                                            The Service does not provide legal, financial, or other professional advice. Any information or content made available through the Service is for general informational purposes only and should not be relied upon as a substitute for professional advice.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-xl border border-border/50 bg-card/60 p-5">
                                <h4 className="font-semibold text-foreground mb-2 text-sm">&ldquo;As Is&rdquo; Service</h4>
                                <p className="text-sm text-secondary-foreground">
                                    The Service, including all features, tools, and beta or experimental offerings, is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo; without warranties of any kind, either express or implied. We do not guarantee that the Service will be uninterrupted, secure, or error-free. You acknowledge that use of the Service is at your own risk.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Contact */}
                    <section className="mb-12">
                        <h2 className="text-2xl font-semibold text-foreground mb-6">Contact Us</h2>
                        <div className="rounded-xl bg-muted/50 p-6">
                            <p className="text-sm text-secondary-foreground mb-4">
                                If you have any questions about these Terms, please contact us:
                            </p>
                            <p className="text-sm text-secondary-foreground">
                                <span className="font-semibold text-foreground">Applying Myself</span> &mdash; Contact us through our{" "}
                                <Link href="/contact" className="text-primary hover:text-primary/80 transition-colors">contact page</Link>.
                            </p>
                        </div>
                    </section>

                    <div className="border-t border-border/40 pt-6">
                        <p className="text-xs text-muted-foreground">End of Terms</p>
                    </div>
                </div>
            </main>

            <SiteFooter />
        </div>
    );
}
