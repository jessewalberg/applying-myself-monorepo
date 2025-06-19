import Link from "next/link";
import type { Metadata } from "next";
import { ApplyingMyselfLogo } from "@/components/ApplyingMyselfLogo";

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
        images: [
            {
                url: "/og-terms.png",
                width: 1200,
                height: 630,
                alt: "Applying Myself Terms of Use",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "Terms of Use - Applying Myself",
        description: "Read Applying Myself's terms of use and service agreement",
        images: ["/twitter-terms.png"],
    },
    alternates: {
        canonical: "https://applyingmyself.com/terms",
    },
    robots: {
        index: true,
        follow: true,
    },
};

export default function TermsPage() {
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
                            Terms of Use
                        </h1>
                        <p className="text-lg text-gray-600">
                            Last updated: June 16, 2025
                        </p>
                    </div>

                    {/* Introduction */}
                    <div className="mb-12">
                        <p className="text-xl text-gray-700 leading-relaxed mb-6">
                            These Terms of Use (&ldquo;Terms&rdquo;) govern your access to and use of the services provided by Applying Myself (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) via our websites, platforms, applications and services (collectively, the &ldquo;Service&rdquo;).
                        </p>
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                            <p className="text-gray-700">
                                &ldquo;You&rdquo; refers to the end user or customer (whether a natural person or an organization) who accesses or uses the Service. By accessing or using the Service, you agree to be bound by these Terms. Where you are acting on behalf of an organization, these Terms shall bind that organization, and you represent and warrant that you have the authority to bind that organization to these Terms.
                            </p>
                        </div>
                    </div>

                    {/* Use of Service */}
                    <section className="mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-6">Use of the Service</h2>
                        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm mb-6">
                            <p className="text-gray-700 mb-4">
                                You agree to use the Service only for lawful purposes and in accordance with these Terms. You must not:
                            </p>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-3">
                                    <div className="flex items-start">
                                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                                        <span className="text-gray-600">Violate any applicable law or regulation</span>
                                    </div>
                                    <div className="flex items-start">
                                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                                        <span className="text-gray-600">Infringe the rights of any third party</span>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex items-start">
                                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                                        <span className="text-gray-600">Interfere with or disrupt the Service</span>
                                    </div>
                                    <div className="flex items-start">
                                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                                        <span className="text-gray-600">Attempt to gain unauthorized access to the Service or its systems</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                            <div className="flex items-start">
                                <svg className="w-6 h-6 text-yellow-600 mr-3 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                                <div>
                                    <p className="text-gray-700 text-sm">
                                        We reserve the right to suspend or terminate your access if you engage in prohibited activities or violate these Terms. We may add, modify or discontinue any aspect of the Service at our own discretion and without further notice.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Disclaimers */}
                    <section className="mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-6">Disclaimers</h2>
                        <div className="space-y-4">
                            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                                <div className="flex items-start">
                                    <svg className="w-6 h-6 text-yellow-600 mr-3 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <div>
                                        <h4 className="font-semibold text-gray-900 mb-2">Not Professional Advice</h4>
                                        <p className="text-gray-700 text-sm">
                                            The Service does not provide legal, financial, or other professional advice. Any information or content made available through the Service is for general informational purposes only and should not be relied upon as a substitute for professional advice.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
                                <h4 className="font-semibold text-gray-900 mb-3">&ldquo;As Is&rdquo; Service</h4>
                                <p className="text-gray-700 text-sm">
                                    The Service, including all features, tools, and beta or experimental offerings, is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo; without warranties of any kind, either express or implied. We do not guarantee that the Service will be uninterrupted, secure, or error-free. You acknowledge that use of the Service is at your own risk.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Contact */}
                    <section className="mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-6">Contact Us</h2>
                        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-8">
                            <p className="text-gray-700 mb-4">
                                If you have any questions about these Terms, please contact us at:
                            </p>
                            <div className="flex items-center">
                                <svg className="w-6 h-6 text-purple-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                                <div>
                                    <p className="font-semibold text-gray-900">Applying Myself</p>
                                    <p className="text-gray-600 text-sm">Contact us through our <Link href="/contact" className="text-purple-600 hover:text-purple-700">contact page</Link></p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* End Notice */}
                    <div className="text-center py-8 border-t border-gray-200">
                        <p className="text-gray-500 text-sm font-medium">End of Terms</p>
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
                            <p className="text-gray-400 mb-6 max-w-md">
                                AI-powered cover letters that get you hired. Join thousands of job seekers who&rsquo;ve landed their dream jobs with Applying Myself.
                            </p>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold mb-4">Product</h3>
                            <ul className="space-y-2">
                                <li><Link href="/#features" className="text-gray-400 hover:text-white transition-colors">Features</Link></li>
                                <li><Link href="/#pricing" className="text-gray-400 hover:text-white transition-colors">Pricing</Link></li>
                                <li><Link href="/dashboard" className="text-gray-400 hover:text-white transition-colors">Dashboard</Link></li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold mb-4">Legal</h3>
                            <ul className="space-y-2">
                                <li><Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</Link></li>
                                <li><Link href="/terms" className="text-gray-400 hover:text-white transition-colors">Terms of Service</Link></li>
                                <li><Link href="/contact" className="text-gray-400 hover:text-white transition-colors">Contact</Link></li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-gray-800 mt-12 pt-8 text-center">
                        <p className="text-gray-400">
                            © 2024 Applying Myself. All rights reserved. Made with ❤️ for job seekers everywhere.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
} 