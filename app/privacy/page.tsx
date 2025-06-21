import Link from "next/link";
import type { Metadata } from "next";
import { ApplyingMyselfLogo } from "@/components/ApplyingMyselfLogo";

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
        images: [
            {
                url: "/og-privacy.png",
                width: 1200,
                height: 630,
                alt: "Applying Myself Privacy Policy",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "Privacy Policy - Applying Myself",
        description: "Learn how Applying Myself protects your privacy and handles your personal information",
        images: ["/twitter-privacy.png"],
    },
    alternates: {
        canonical: "https://applyingmyself.com/privacy",
    },
    robots: {
        index: true,
        follow: true,
    },
};

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-white">
            {/* Navigation */}
            <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-md border-b border-gray-100 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center space-x-3">
                            <ApplyingMyselfLogo size="md" className="drop-shadow-sm" />
                            <Link href="/" className="text-xl font-bold text-gray-900">Applying Myself</Link>
                        </div>

                        <div className="hidden md:flex items-center space-x-8">
                            <Link href="/#features" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">Features</Link>
                            <Link href="/#pricing" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">Pricing</Link>
                            <Link href="/#testimonials" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">Reviews</Link>
                            <Link href="/contact" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">Contact</Link>
                            <Link href="/login" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">Sign in</Link>
                            <Link href="/register" className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all transform hover:scale-105 shadow-lg">
                                Get started
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="pt-16">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
                    {/* Header */}
                    <div className="text-center mb-16">
                        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                            Privacy Policy
                        </h1>
                        <p className="text-lg text-gray-600">
                            Last updated: December 2024
                        </p>
                    </div>

                    {/* Introduction */}
                    <div className="mb-12">
                        <p className="text-xl text-gray-700 leading-relaxed mb-6">
                            At Applying Myself, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our AI-powered cover letter generation service.
                        </p>
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                            <p className="text-gray-700">
                                By using our service, you agree to the collection and use of information in accordance with this policy. We will not use or share your information with anyone except as described in this Privacy Policy.
                            </p>
                        </div>
                    </div>

                    {/* Information We Collect */}
                    <section className="mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-6">Information We Collect</h2>

                        <div className="space-y-6">
                            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                                <h3 className="text-xl font-semibold text-gray-900 mb-4">Personal Information</h3>
                                <p className="text-gray-700 mb-4">When you create an account or use our service, we may collect:</p>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <div className="flex items-center">
                                            <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                                            <span className="text-gray-600">Email address</span>
                                        </div>
                                        <div className="flex items-center">
                                            <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                                            <span className="text-gray-600">Name and profile information</span>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center">
                                            <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                                            <span className="text-gray-600">Resume and career information</span>
                                        </div>
                                        <div className="flex items-center">
                                            <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                                            <span className="text-gray-600">Job application data</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                                <h3 className="text-xl font-semibold text-gray-900 mb-4">Usage Information</h3>
                                <p className="text-gray-700 mb-4">We automatically collect certain information when you use our service:</p>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <div className="flex items-center">
                                            <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                                            <span className="text-gray-600">Device and browser information</span>
                                        </div>
                                        <div className="flex items-center">
                                            <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                                            <span className="text-gray-600">IP address and location data</span>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center">
                                            <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                                            <span className="text-gray-600">Usage patterns and preferences</span>
                                        </div>
                                        <div className="flex items-center">
                                            <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                                            <span className="text-gray-600">Performance and error data</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* How We Use Your Information */}
                    <section className="mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-6">How We Use Your Information</h2>
                        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-8">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <h4 className="font-semibold text-gray-900 mb-3">Service Delivery</h4>
                                    <ul className="space-y-2 text-sm text-gray-700">
                                        <li>• Generate personalized cover letters</li>
                                        <li>• Provide job matching suggestions</li>
                                        <li>• Maintain your account and preferences</li>
                                        <li>• Process payments and subscriptions</li>
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-900 mb-3">Improvement & Support</h4>
                                    <ul className="space-y-2 text-sm text-gray-700">
                                        <li>• Improve our AI algorithms</li>
                                        <li>• Provide customer support</li>
                                        <li>• Send service updates and notifications</li>
                                        <li>• Analyze usage patterns</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Data Security */}
                    <section className="mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-6">Data Security</h2>
                        <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                            <div className="flex items-start">
                                <svg className="w-8 h-8 text-green-600 mr-4 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-3">We protect your data with:</h3>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <ul className="space-y-2 text-sm text-gray-700">
                                            <li>• End-to-end encryption</li>
                                            <li>• Secure cloud infrastructure</li>
                                            <li>• Regular security audits</li>
                                        </ul>
                                        <ul className="space-y-2 text-sm text-gray-700">
                                            <li>• Access controls and monitoring</li>
                                            <li>• Data backup and recovery</li>
                                            <li>• Compliance with industry standards</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Your Rights */}
                    <section className="mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-6">Your Privacy Rights</h2>
                        <div className="space-y-4">
                            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                                            <svg className="w-5 h-5 text-purple-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                            Access & Portability
                                        </h4>
                                        <p className="text-sm text-gray-600">Request a copy of your personal data and download your information in a portable format.</p>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                                            <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                            Correction & Updates
                                        </h4>
                                        <p className="text-sm text-gray-600">Update or correct your personal information at any time through your account settings.</p>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                                            <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                            Deletion
                                        </h4>
                                        <p className="text-sm text-gray-600">Request deletion of your personal data, subject to legal and contractual obligations.</p>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                                            <svg className="w-5 h-5 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
                                            </svg>
                                            Opt-Out
                                        </h4>
                                        <p className="text-sm text-gray-600">Unsubscribe from marketing communications and opt-out of certain data processing activities.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Cookies */}
                    <section className="mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-6">Cookies & Tracking</h2>
                        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                            <p className="text-gray-700 mb-4">
                                We use cookies and similar technologies to enhance your experience, analyze usage, and provide personalized content. You can control cookie preferences through your browser settings.
                            </p>
                            <div className="grid md:grid-cols-3 gap-4 text-sm">
                                <div>
                                    <h4 className="font-semibold text-gray-900 mb-2">Essential Cookies</h4>
                                    <p className="text-gray-600">Required for basic site functionality and security.</p>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-900 mb-2">Analytics Cookies</h4>
                                    <p className="text-gray-600">Help us understand how you use our service.</p>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-900 mb-2">Preference Cookies</h4>
                                    <p className="text-gray-600">Remember your settings and preferences.</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Contact */}
                    <section className="mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-6">Contact Us</h2>
                        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-8">
                            <p className="text-gray-700 mb-4">
                                If you have any questions about this Privacy Policy or wish to exercise your privacy rights, please contact us:
                            </p>
                            <div className="flex items-center">
                                <svg className="w-6 h-6 text-purple-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                <div>
                                    <p className="font-semibold text-gray-900">Privacy Questions</p>
                                    <p className="text-gray-600 text-sm">Contact us through our <Link href="/contact" className="text-purple-600 hover:text-purple-700">contact page</Link> or email us directly</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* End Notice */}
                    <div className="text-center py-8 border-t border-gray-200">
                        <p className="text-gray-500 text-sm font-medium">End of Privacy Policy</p>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div className="col-span-1 md:col-span-2">
                            <div className="flex items-center space-x-3 mb-6">
                                <ApplyingMyselfLogo size="md" className="drop-shadow-sm" />
                                <span className="text-xl font-bold">Applying Myself</span>
                            </div>
                            <p className="text-gray-400 text-sm leading-relaxed">
                                AI-powered cover letter generation that helps you land your dream job. Create personalized, professional cover letters in minutes.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold mb-4">Product</h4>
                            <ul className="space-y-2 text-sm">
                                <li><Link href="/#features" className="text-gray-400 hover:text-white transition-colors">Features</Link></li>
                                <li><Link href="/#pricing" className="text-gray-400 hover:text-white transition-colors">Pricing</Link></li>
                                <li><Link href="/dashboard" className="text-gray-400 hover:text-white transition-colors">Dashboard</Link></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-semibold mb-4">Legal</h4>
                            <ul className="space-y-2 text-sm">
                                <li><Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</Link></li>
                                <li><Link href="/terms" className="text-gray-400 hover:text-white transition-colors">Terms of Use</Link></li>
                                <li><Link href="/contact" className="text-gray-400 hover:text-white transition-colors">Contact</Link></li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-gray-800 mt-12 pt-8 text-center">
                        <p className="text-gray-400 text-sm">
                            © 2024 Applying Myself. All rights reserved.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
} 