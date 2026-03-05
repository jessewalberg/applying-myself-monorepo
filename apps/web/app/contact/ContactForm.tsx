"use client";

import { useState } from "react";
import { useConvex } from "convex/react";
import { api } from "@applyingmyself/convex-client";
import { Button } from "@applyingmyself/ui/components/button";
import { Send } from "lucide-react";

export function ContactForm() {
    const convex = useConvex();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitMessage, setSubmitMessage] = useState<{
        type: "success" | "error";
        text: string;
    } | null>(null);
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        subject: "",
        message: "",
        newsletter: false,
    });

    const handleInputChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >
    ) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;

        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitMessage(null);

        try {
            const result = await convex.action(
                api.emailResend.submitContactForm,
                {
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    email: formData.email,
                    subject: formData.subject,
                    message: formData.message,
                    newsletter: formData.newsletter,
                }
            );

            if (result.success) {
                setSubmitMessage({ type: "success", text: result.message });
                setFormData({
                    firstName: "",
                    lastName: "",
                    email: "",
                    subject: "",
                    message: "",
                    newsletter: false,
                });
            } else {
                setSubmitMessage({ type: "error", text: result.message });
            }
        } catch (error) {
            console.error("Contact form error:", error);
            setSubmitMessage({
                type: "error",
                text: "Sorry, there was an error sending your message. Please try again or email us directly at support@applyingmyself.com",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section id="contact-form" className="py-24 px-6">
            <div className="max-w-2xl mx-auto">
                <h2 className="font-display text-3xl md:text-4xl text-foreground mb-3">
                    Send us a message<span className="text-primary">.</span>
                </h2>
                <p className="text-muted-foreground mb-10">
                    Have a specific question or need personalized help? We&rsquo;ll
                    get back to you soon.
                </p>

                <div className="rounded-xl border border-border/50 bg-card/60 p-6 md:p-8">
                    {submitMessage && (
                        <div
                            className={`mb-6 p-4 rounded-lg text-sm ${
                                submitMessage.type === "success"
                                    ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                                    : "bg-rose-500/10 border border-rose-500/20 text-rose-400"
                            }`}
                        >
                            {submitMessage.text}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label
                                    htmlFor="firstName"
                                    className="form-label"
                                >
                                    First Name *
                                </label>
                                <input
                                    type="text"
                                    id="firstName"
                                    name="firstName"
                                    required
                                    value={formData.firstName}
                                    onChange={handleInputChange}
                                    disabled={isSubmitting}
                                    className="input-field disabled:opacity-50"
                                    placeholder="First name"
                                />
                            </div>
                            <div>
                                <label
                                    htmlFor="lastName"
                                    className="form-label"
                                >
                                    Last Name *
                                </label>
                                <input
                                    type="text"
                                    id="lastName"
                                    name="lastName"
                                    required
                                    value={formData.lastName}
                                    onChange={handleInputChange}
                                    disabled={isSubmitting}
                                    className="input-field disabled:opacity-50"
                                    placeholder="Last name"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="email" className="form-label">
                                Email Address *
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                required
                                value={formData.email}
                                onChange={handleInputChange}
                                disabled={isSubmitting}
                                className="input-field disabled:opacity-50"
                                placeholder="you@example.com"
                            />
                        </div>

                        <div>
                            <label htmlFor="subject" className="form-label">
                                Subject *
                            </label>
                            <select
                                id="subject"
                                name="subject"
                                required
                                value={formData.subject}
                                onChange={handleInputChange}
                                disabled={isSubmitting}
                                className="input-field disabled:opacity-50"
                            >
                                <option value="">Select a subject</option>
                                <option value="general">
                                    General Question
                                </option>
                                <option value="technical">
                                    Technical Support
                                </option>
                                <option value="billing">
                                    Billing &amp; Payments
                                </option>
                                <option value="feature">
                                    Feature Request
                                </option>
                                <option value="bug">Bug Report</option>
                                <option value="feedback">Feedback</option>
                            </select>
                        </div>

                        <div>
                            <label htmlFor="message" className="form-label">
                                Message *
                            </label>
                            <textarea
                                id="message"
                                name="message"
                                rows={5}
                                required
                                value={formData.message}
                                onChange={handleInputChange}
                                disabled={isSubmitting}
                                className="input-field resize-none disabled:opacity-50"
                                placeholder="Tell us how we can help..."
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="newsletter"
                                name="newsletter"
                                checked={formData.newsletter}
                                onChange={handleInputChange}
                                disabled={isSubmitting}
                                className="w-4 h-4 rounded border-border bg-card text-primary focus:ring-primary/30 disabled:opacity-50"
                            />
                            <label
                                htmlFor="newsletter"
                                className="text-sm text-muted-foreground"
                            >
                                I&rsquo;d like to receive updates about new
                                features and tips
                            </label>
                        </div>

                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full h-12 text-base"
                        >
                            {isSubmitting ? (
                                "Sending..."
                            ) : (
                                <>
                                    Send Message
                                    <Send className="w-4 h-4 ml-2" />
                                </>
                            )}
                        </Button>
                    </form>
                </div>
            </div>
        </section>
    );
}
