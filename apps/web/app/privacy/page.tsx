import Link from "next/link";
import type { Metadata } from "next";
import { SiteNav } from "@/components/marketing/SiteNav";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { Shield, Eye, Pencil, Trash2, Ban } from "lucide-react";

export const metadata: Metadata = {
    title: "Privacy Policy - Applying Myself AI Cover Letter Generator",
    description: "Applying Myself privacy policy. Learn how we collect, use, and protect your personal information when using our AI cover letter generator platform.",
    keywords: [
        "Applying Myself privacy policy",
        "data protection",
        "personal information",
        "AI cover letter privacy",
        "user data security"
    ],
    openGraph: {
        title: "Privacy Policy - Applying Myself",
        description: "Learn how Applying Myself protects your privacy and handles your personal information.",
        type: "website",
        url: "https://applyingmyself.com/privacy",
    },
    alternates: {
        canonical: "https://applyingmyself.com/privacy",
    },
};

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-background">
            <SiteNav />

            <main className="pt-24 pb-16">
                <div className="max-w-3xl mx-auto px-6">
                    {/* Header */}
                    <div className="mb-16">
                        <h1 className="font-display text-4xl md:text-5xl text-foreground mb-4">
                            Privacy Policy<span className="text-primary">.</span>
                        </h1>
                        <p className="text-muted-foreground">
                            Last updated: December 2024
                        </p>
                    </div>

                    {/* Introduction */}
                    <div className="mb-12">
                        <p className="text-secondary-foreground leading-relaxed mb-6">
                            At Applying Myself, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our AI-powered cover letter generation service.
                        </p>
                        <div className="rounded-xl border border-primary/20 bg-primary/5 p-5">
                            <p className="text-sm text-secondary-foreground">
                                By using our service, you agree to the collection and use of information in accordance with this policy. We will not use or share your information with anyone except as described in this Privacy Policy.
                            </p>
                        </div>
                    </div>

                    {/* Information We Collect */}
                    <section className="mb-12">
                        <h2 className="text-2xl font-semibold text-foreground mb-6">Information We Collect</h2>

                        <div className="space-y-4">
                            <div className="rounded-xl border border-border/50 bg-card/60 p-6">
                                <h3 className="text-lg font-semibold text-foreground mb-4">Personal Information</h3>
                                <p className="text-sm text-muted-foreground mb-4">When you create an account or use our service, we may collect:</p>
                                <div className="grid md:grid-cols-2 gap-3">
                                    {["Email address", "Name and profile information", "Resume and career information", "Job application data"].map((item) => (
                                        <div key={item} className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                            <span className="text-sm text-secondary-foreground">{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="rounded-xl border border-border/50 bg-card/60 p-6">
                                <h3 className="text-lg font-semibold text-foreground mb-4">Usage Information</h3>
                                <p className="text-sm text-muted-foreground mb-4">We automatically collect certain information when you use our service:</p>
                                <div className="grid md:grid-cols-2 gap-3">
                                    {["Device and browser information", "IP address and location data", "Usage patterns and preferences", "Performance and error data"].map((item) => (
                                        <div key={item} className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                                            <span className="text-sm text-secondary-foreground">{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* How We Use Your Information */}
                    <section className="mb-12">
                        <h2 className="text-2xl font-semibold text-foreground mb-6">How We Use Your Information</h2>
                        <div className="rounded-xl bg-muted/50 p-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <h4 className="font-semibold text-foreground mb-3">Service Delivery</h4>
                                    <ul className="space-y-2 text-sm text-secondary-foreground">
                                        <li>Generate personalized cover letters</li>
                                        <li>Provide job matching suggestions</li>
                                        <li>Maintain your account and preferences</li>
                                        <li>Process payments and subscriptions</li>
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-foreground mb-3">Improvement &amp; Support</h4>
                                    <ul className="space-y-2 text-sm text-secondary-foreground">
                                        <li>Improve our AI algorithms</li>
                                        <li>Provide customer support</li>
                                        <li>Send service updates and notifications</li>
                                        <li>Analyze usage patterns</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Data Security */}
                    <section className="mb-12">
                        <h2 className="text-2xl font-semibold text-foreground mb-6">Data Security</h2>
                        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-6">
                            <div className="flex items-start gap-4">
                                <Shield className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
                                <div>
                                    <h3 className="font-semibold text-foreground mb-3">We protect your data with:</h3>
                                    <div className="grid md:grid-cols-2 gap-2 text-sm text-secondary-foreground">
                                        <ul className="space-y-1.5">
                                            <li>End-to-end encryption</li>
                                            <li>Secure cloud infrastructure</li>
                                            <li>Regular security audits</li>
                                        </ul>
                                        <ul className="space-y-1.5">
                                            <li>Access controls and monitoring</li>
                                            <li>Data backup and recovery</li>
                                            <li>Compliance with industry standards</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Your Rights */}
                    <section className="mb-12">
                        <h2 className="text-2xl font-semibold text-foreground mb-6">Your Privacy Rights</h2>
                        <div className="grid sm:grid-cols-2 gap-4">
                            {[
                                { icon: Eye, title: "Access & Portability", color: "text-primary", desc: "Request a copy of your personal data and download your information in a portable format." },
                                { icon: Pencil, title: "Correction & Updates", color: "text-blue-400", desc: "Update or correct your personal information at any time through your account settings." },
                                { icon: Trash2, title: "Deletion", color: "text-rose-400", desc: "Request deletion of your personal data, subject to legal and contractual obligations." },
                                { icon: Ban, title: "Opt-Out", color: "text-amber-400", desc: "Unsubscribe from marketing communications and opt-out of certain data processing activities." },
                            ].map((right) => (
                                <div key={right.title} className="rounded-xl border border-border/50 bg-card/60 p-5">
                                    <div className="flex items-center gap-2 mb-2">
                                        <right.icon className={`w-4 h-4 ${right.color}`} />
                                        <h4 className="font-semibold text-foreground text-sm">{right.title}</h4>
                                    </div>
                                    <p className="text-xs text-muted-foreground">{right.desc}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Cookies */}
                    <section className="mb-12">
                        <h2 className="text-2xl font-semibold text-foreground mb-6">Cookies &amp; Tracking</h2>
                        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-6">
                            <p className="text-sm text-secondary-foreground mb-4">
                                We use cookies and similar technologies to enhance your experience, analyze usage, and provide personalized content. You can control cookie preferences through your browser settings.
                            </p>
                            <div className="grid md:grid-cols-3 gap-4 text-sm">
                                {[
                                    { name: "Essential Cookies", desc: "Required for basic site functionality and security." },
                                    { name: "Analytics Cookies", desc: "Help us understand how you use our service." },
                                    { name: "Preference Cookies", desc: "Remember your settings and preferences." },
                                ].map((cookie) => (
                                    <div key={cookie.name}>
                                        <h4 className="font-semibold text-foreground mb-1">{cookie.name}</h4>
                                        <p className="text-muted-foreground text-xs">{cookie.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Contact */}
                    <section className="mb-12">
                        <h2 className="text-2xl font-semibold text-foreground mb-6">Contact Us</h2>
                        <div className="rounded-xl bg-muted/50 p-6">
                            <p className="text-sm text-secondary-foreground mb-4">
                                If you have any questions about this Privacy Policy or wish to exercise your privacy rights, please contact us:
                            </p>
                            <p className="text-sm text-secondary-foreground">
                                <span className="font-semibold text-foreground">Privacy Questions</span> &mdash; Contact us through our{" "}
                                <Link href="/contact" className="text-primary hover:text-primary/80 transition-colors">contact page</Link>{" "}
                                or email us directly.
                            </p>
                        </div>
                    </section>

                    <div className="border-t border-border/40 pt-6">
                        <p className="text-xs text-muted-foreground">End of Privacy Policy</p>
                    </div>
                </div>
            </main>

            <SiteFooter />
        </div>
    );
}
