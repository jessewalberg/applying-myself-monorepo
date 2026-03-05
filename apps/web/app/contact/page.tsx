import Link from "next/link";
import { Metadata } from "next";
import { SiteNav } from "@/components/marketing/SiteNav";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { ContactForm } from "./ContactForm";
import { Mail, MessageCircle, AtSign } from "lucide-react";

export const metadata: Metadata = {
    title: "Contact Us - Applying Myself AI Cover Letter Generator",
    description:
        "Get in touch with the Applying Myself team. Contact us for support, feedback, or questions about our AI cover letter generator service.",
    keywords: [
        "Applying Myself contact",
        "AI cover letter support",
        "customer service",
        "help center",
        "feedback",
    ],
    openGraph: {
        title: "Contact Us - Applying Myself",
        description:
            "Get in touch with the Applying Myself team for support and questions.",
        type: "website",
        url: "https://applyingmyself.com/contact",
    },
};

const contactMethods = [
    {
        icon: Mail,
        title: "Email Support",
        description: "Get detailed help with any questions or issues",
        contact: "support@applyingmyself.com",
        href: "mailto:support@applyingmyself.com",
    },
    {
        icon: MessageCircle,
        title: "Live Chat",
        description: "Chat with our team in real-time during business hours",
        contact: "Coming Soon",
        href: "#",
    },
    {
        icon: AtSign,
        title: "Social Media",
        description: "Follow us for updates and quick support",
        contact: "@ApplyingMyself",
        href: "#",
    },
];

const faqs = [
    {
        question: "How quickly do you respond to support requests?",
        answer: "We typically respond to all support requests within 24 hours during business days. For urgent technical issues, we often respond much faster.",
    },
    {
        question: "Can I get help with my cover letter content?",
        answer: "Our support team can help you optimize your cover letter generation settings and provide tips for better results.",
    },
    {
        question: "Do you offer phone support?",
        answer: "Currently, we provide support via email and live chat. This allows us to better track your issues and provide detailed, documented solutions.",
    },
    {
        question: "Can you help with billing questions?",
        answer: "Yes! We can help with all billing-related questions, including plan changes, payment issues, and refund requests.",
    },
    {
        question: "Is there a way to provide product feedback?",
        answer: "We love hearing from our users! You can share feedback through our contact form, email, or during live chat sessions.",
    },
    {
        question: "Do you offer training or onboarding help?",
        answer: "While we don\u2019t offer formal training, our support team is happy to help you get started and make the most of Applying Myself\u2019s features.",
    },
];

export default function ContactPage() {
    return (
        <div className="min-h-screen bg-background">
            <SiteNav />

            {/* Hero */}
            <section className="pt-32 pb-16 px-6">
                <div className="max-w-3xl mx-auto">
                    <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-xs text-emerald-400 font-medium mb-6">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        We respond within 24 hours
                    </div>
                    <h1 className="font-display text-4xl md:text-6xl text-foreground mb-4">
                        Get in touch<span className="text-primary">.</span>
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-xl">
                        Have questions about Applying Myself? Need help with
                        your account? We&rsquo;d love to hear from you.
                    </p>
                </div>
            </section>

            {/* Contact Methods */}
            <section className="py-12 px-6">
                <div className="max-w-3xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {contactMethods.map((method) => (
                            <a
                                key={method.title}
                                href={method.href}
                                className="group rounded-xl border border-border/50 bg-card/60 p-5 hover:border-border transition-colors"
                            >
                                <method.icon className="w-5 h-5 text-primary mb-3" />
                                <h3 className="font-semibold text-foreground text-sm mb-1">
                                    {method.title}
                                </h3>
                                <p className="text-xs text-muted-foreground mb-3">
                                    {method.description}
                                </p>
                                <p className="text-xs font-medium text-secondary-foreground">
                                    {method.contact}
                                </p>
                            </a>
                        ))}
                    </div>
                </div>
            </section>

            {/* Contact Form */}
            <ContactForm />

            {/* FAQ */}
            <section className="py-24 px-6">
                <div className="max-w-3xl mx-auto">
                    <h2 className="font-display text-3xl md:text-4xl text-foreground mb-3">
                        Frequently asked questions
                        <span className="text-primary">.</span>
                    </h2>
                    <p className="text-muted-foreground mb-10">
                        Quick answers to common questions. Can&rsquo;t find what
                        you&rsquo;re looking for?{" "}
                        <a
                            href="#contact-form"
                            className="text-primary hover:text-primary/80 transition-colors"
                        >
                            Contact us directly
                        </a>
                        .
                    </p>

                    <div className="space-y-3">
                        {faqs.map((faq) => (
                            <div
                                key={faq.question}
                                className="rounded-xl border border-border/50 bg-card/60 p-5 hover:border-border transition-colors"
                            >
                                <h3 className="text-sm font-semibold text-foreground mb-2">
                                    {faq.question}
                                </h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    {faq.answer}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <SiteFooter />
        </div>
    );
}
