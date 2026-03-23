import Link from "next/link";
import type { Metadata } from "next";
import { SiteNav } from "@/components/marketing/SiteNav";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import {
    Sparkles,
    FileText,
    Briefcase,
    Settings,
    Mail,
} from "lucide-react";

export const metadata: Metadata = {
    title: "Help & Support - Applying Myself AI Cover Letter Generator",
    description:
        "Get help with Applying Myself AI cover letter generator. Find answers to common questions, tutorials, and support for creating professional cover letters.",
    keywords: [
        "Applying Myself help",
        "AI cover letter support",
        "how to use cover letter generator",
        "tutorial",
        "FAQ",
        "customer support",
    ],
    openGraph: {
        title: "Help & Support - Applying Myself",
        description:
            "Get help with our AI cover letter generator. Find tutorials, FAQs, and support resources.",
        type: "website",
        url: "https://applyingmyself.com/help",
    },
    alternates: {
        canonical: "https://applyingmyself.com/help",
    },
};

const gettingStartedSteps = [
    {
        num: 1,
        title: "Create Your Account",
        desc: "Sign up with your email or Google account.",
    },
    {
        num: 2,
        title: "Upload Your Resume",
        desc: "Upload your resume so our AI can understand your background and voice.",
    },
    {
        num: 3,
        title: "Add Job Information",
        desc: "Paste the job description from any job board. Our AI analyzes the requirements.",
    },
    {
        num: 4,
        title: "Generate Cover Letter",
        desc: "Click generate and get a tailored cover letter in seconds.",
    },
    {
        num: 5,
        title: "Review & Edit",
        desc: "Make any adjustments to ensure it represents you perfectly.",
    },
    {
        num: 6,
        title: "Download & Apply",
        desc: "Download as PDF or copy the text for your application.",
    },
];

const featureGuides = [
    {
        icon: FileText,
        title: "Resume Management",
        desc: "Upload, manage, and optimize your resumes for better cover letter generation.",
        href: "/dashboard/resumes",
        color: "text-primary bg-primary/10",
    },
    {
        icon: Briefcase,
        title: "Job Tracking",
        desc: "Track every application, interview, and offer in one dashboard.",
        href: "/dashboard/jobs",
        color: "text-blue-400 bg-blue-500/10",
    },
    {
        icon: Settings,
        title: "Account Settings",
        desc: "Customize your profile, manage billing, and configure preferences.",
        href: "/dashboard/settings",
        color: "text-emerald-400 bg-emerald-500/10",
    },
];

const faqs = [
    {
        q: "How does the AI generate cover letters?",
        a: "Our AI analyzes your resume and the job description to create personalized cover letters that highlight your relevant skills and experience for each specific role.",
    },
    {
        q: "Can I edit the generated cover letters?",
        a: "You can edit, customize, and refine any generated cover letter to match your personal style and add specific details.",
    },
    {
        q: "How many cover letters can I generate?",
        a: "This depends on your plan. Starter plans include 10 cover letters per month, while Pro and Hired plans offer unlimited generation.",
    },
    {
        q: "Is my data secure and private?",
        a: "Yes! We use enterprise-grade security to protect your data. Your resumes and cover letters are encrypted and never shared with third parties.",
    },
    {
        q: "What job sites do you support?",
        a: "You can copy job descriptions from LinkedIn, Indeed, Glassdoor, and any job board. Our Chrome extension automates this process.",
    },
    {
        q: "Can I cancel my subscription anytime?",
        a: "Yes, you can cancel your subscription at any time from your account settings. You\u2019ll continue to have access until the end of your billing period.",
    },
    {
        q: "Do you offer refunds?",
        a: "We offer a 30-day money-back guarantee. If you\u2019re not satisfied, contact us for a full refund.",
    },
    {
        q: "How do I install the Chrome extension?",
        a: "Visit the Chrome Web Store and search for \u201cApplying Myself\u201d, or use the link from your dashboard.",
    },
];

export default function HelpPage() {
    return (
        <div className="min-h-screen bg-background">
            <SiteNav />

            <main className="pt-24 pb-16">
                <div className="max-w-4xl mx-auto px-6">
                    {/* Header */}
                    <div className="mb-12">
                        <h1 className="font-display text-4xl md:text-5xl text-foreground mb-3">
                            Help &amp; Support
                            <span className="text-primary">.</span>
                        </h1>
                        <p className="text-muted-foreground max-w-xl">
                            Everything you need to know about using Applying
                            Myself to create professional cover letters with AI.
                        </p>
                    </div>

                    {/* Quick Actions */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
                        <Link
                            href="/generate"
                            className="group rounded-xl border border-border/50 bg-card/60 p-5 hover:border-border transition-colors"
                        >
                            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                                <Sparkles className="w-4 h-4 text-primary" />
                            </div>
                            <p className="text-sm font-semibold text-foreground">
                                Generate Cover Letter
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                                Start generating now
                            </p>
                        </Link>
                        <Link
                            href="/contact"
                            className="group rounded-xl border border-border/50 bg-card/60 p-5 hover:border-border transition-colors"
                        >
                            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center mb-3">
                                <Mail className="w-4 h-4 text-emerald-400" />
                            </div>
                            <p className="text-sm font-semibold text-foreground">
                                Contact Support
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                                Get personalized help
                            </p>
                        </Link>
                        <Link
                            href="/dashboard"
                            className="group rounded-xl border border-border/50 bg-card/60 p-5 hover:border-border transition-colors"
                        >
                            <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center mb-3">
                                <Briefcase className="w-4 h-4 text-blue-400" />
                            </div>
                            <p className="text-sm font-semibold text-foreground">
                                View Dashboard
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                                Manage your account
                            </p>
                        </Link>
                    </div>

                    {/* Getting Started */}
                    <section className="mb-12">
                        <h2 className="text-2xl font-semibold text-foreground mb-6">
                            Getting Started
                        </h2>
                        <div className="rounded-xl border border-border/50 bg-card/60 p-6">
                            <div className="space-y-5">
                                {gettingStartedSteps.map((step) => (
                                    <div
                                        key={step.num}
                                        className="flex items-start gap-4"
                                    >
                                        <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shrink-0">
                                            {step.num}
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-semibold text-foreground">
                                                {step.title}
                                            </h4>
                                            <p className="text-xs text-muted-foreground mt-0.5">
                                                {step.desc}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Feature Guides */}
                    <section className="mb-12">
                        <h2 className="text-2xl font-semibold text-foreground mb-6">
                            Feature Guides
                        </h2>
                        <div className="grid md:grid-cols-3 gap-4">
                            {featureGuides.map((guide) => (
                                <Link
                                    key={guide.title}
                                    href={guide.href}
                                    className="rounded-xl border border-border/50 bg-card/60 p-5 hover:border-border transition-colors"
                                >
                                    <div
                                        className={`w-9 h-9 rounded-lg ${guide.color} flex items-center justify-center mb-3`}
                                    >
                                        <guide.icon className="w-4 h-4" />
                                    </div>
                                    <h3 className="text-sm font-semibold text-foreground mb-1">
                                        {guide.title}
                                    </h3>
                                    <p className="text-xs text-muted-foreground">
                                        {guide.desc}
                                    </p>
                                </Link>
                            ))}
                        </div>
                    </section>

                    {/* FAQ */}
                    <section className="mb-12">
                        <h2 className="text-2xl font-semibold text-foreground mb-6">
                            Frequently Asked Questions
                        </h2>
                        <div className="grid md:grid-cols-2 gap-4">
                            {faqs.map((faq) => (
                                <div
                                    key={faq.q}
                                    className="rounded-xl border border-border/50 bg-card/60 p-5"
                                >
                                    <h4 className="text-sm font-semibold text-foreground mb-2">
                                        {faq.q}
                                    </h4>
                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                        {faq.a}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Still Need Help */}
                    <section className="rounded-xl border border-border/50 bg-card/60 p-8 text-center">
                        <h3 className="text-lg font-semibold text-foreground mb-2">
                            Still need help?
                        </h3>
                        <p className="text-sm text-muted-foreground mb-5">
                            Our support team is here to help you succeed in your
                            job search.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <Link href="/contact" className="btn-primary">
                                Contact Support
                            </Link>
                            <a
                                href="mailto:support@applyingmyself.com"
                                className="btn-secondary"
                            >
                                Email Us Directly
                            </a>
                        </div>
                    </section>
                </div>
            </main>

            <SiteFooter />
        </div>
    );
}
