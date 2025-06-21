"use client";

import { useState } from 'react';
import { useConvex } from "convex/react";
import { api } from "@/convexApi";

// Contact Form Section
export function ContactForm() {
    const convex = useConvex();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        subject: '',
        message: '',
        newsletter: false
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;

        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitMessage(null);

        try {
            const result = await convex.action(api.emailResend.submitContactForm, {
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                subject: formData.subject,
                message: formData.message,
                newsletter: formData.newsletter
            });

            if (result.success) {
                setSubmitMessage({ type: 'success', text: result.message });
                // Reset form
                setFormData({
                    firstName: '',
                    lastName: '',
                    email: '',
                    subject: '',
                    message: '',
                    newsletter: false
                });
            } else {
                setSubmitMessage({ type: 'error', text: result.message });
            }
        } catch (error) {
            console.error('Contact form error:', error);
            setSubmitMessage({
                type: 'error',
                text: 'Sorry, there was an error sending your message. Please try again or email us directly at support@applyingmyself.com'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section className="py-24 bg-gradient-to-br from-gray-50 to-blue-50 relative overflow-hidden">
            {/* Background decorations */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 right-10 w-64 h-64 bg-gradient-to-r from-purple-400/10 to-pink-400/10 rounded-full blur-3xl animate-float"></div>
                <div className="absolute bottom-20 left-10 w-80 h-80 bg-gradient-to-r from-blue-400/10 to-cyan-400/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }}></div>
            </div>

            <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                        Send us a message
                    </h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Have a specific question or need personalized help? Fill out the form below and we&rsquo;ll get back to you soon.
                    </p>
                </div>

                <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-8 md:p-12 shadow-2xl border border-white/20">
                    {submitMessage && (
                        <div className={`mb-6 p-4 rounded-lg ${submitMessage.type === 'success'
                            ? 'bg-green-50 border border-green-200 text-green-800'
                            : 'bg-red-50 border border-red-200 text-red-800'
                            }`}>
                            {submitMessage.text}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="group">
                                <label htmlFor="firstName" className="block text-sm font-semibold text-gray-700 mb-2">
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
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 bg-white/50 backdrop-blur-sm group-hover:bg-white/70 disabled:opacity-50"
                                    placeholder="Enter your first name"
                                />
                            </div>

                            <div className="group">
                                <label htmlFor="lastName" className="block text-sm font-semibold text-gray-700 mb-2">
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
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 bg-white/50 backdrop-blur-sm group-hover:bg-white/70 disabled:opacity-50"
                                    placeholder="Enter your last name"
                                />
                            </div>
                        </div>

                        <div className="group">
                            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
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
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 bg-white/50 backdrop-blur-sm group-hover:bg-white/70 disabled:opacity-50"
                                placeholder="Enter your email address"
                            />
                        </div>

                        <div className="group">
                            <label htmlFor="subject" className="block text-sm font-semibold text-gray-700 mb-2">
                                Subject *
                            </label>
                            <select
                                id="subject"
                                name="subject"
                                required
                                value={formData.subject}
                                onChange={handleInputChange}
                                disabled={isSubmitting}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 bg-white/50 backdrop-blur-sm group-hover:bg-white/70 disabled:opacity-50"
                            >
                                <option value="">Select a subject</option>
                                <option value="general">General Question</option>
                                <option value="technical">Technical Support</option>
                                <option value="billing">Billing & Payments</option>
                                <option value="feature">Feature Request</option>
                                <option value="bug">Bug Report</option>
                                <option value="feedback">Feedback</option>
                            </select>
                        </div>

                        <div className="group">
                            <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
                                Message *
                            </label>
                            <textarea
                                id="message"
                                name="message"
                                rows={6}
                                required
                                value={formData.message}
                                onChange={handleInputChange}
                                disabled={isSubmitting}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 bg-white/50 backdrop-blur-sm group-hover:bg-white/70 resize-none disabled:opacity-50"
                                placeholder="Tell us how we can help you..."
                            ></textarea>
                        </div>

                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="newsletter"
                                name="newsletter"
                                checked={formData.newsletter}
                                onChange={handleInputChange}
                                disabled={isSubmitting}
                                className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2 disabled:opacity-50"
                            />
                            <label htmlFor="newsletter" className="ml-2 text-sm text-gray-600">
                                I&rsquo;d like to receive updates about new features and tips for job searching
                            </label>
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="group relative w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 shadow-2xl hover:shadow-purple-500/25 overflow-hidden disabled:opacity-50 disabled:transform-none disabled:hover:scale-100 disabled:hover:translate-y-0"
                            >
                                <span className="relative z-10 flex items-center justify-center">
                                    {isSubmitting ? 'Sending...' : 'Send Message'}
                                    {!isSubmitting && (
                                        <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                        </svg>
                                    )}
                                </span>
                                <div className="absolute inset-0 bg-gradient-to-r from-purple-700 to-blue-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </section>
    );
} 