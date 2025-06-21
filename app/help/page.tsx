import Link from "next/link";
import type { Metadata } from "next";
import { ApplyingMyselfLogo } from "@/components/ApplyingMyselfLogo";

export const metadata: Metadata = {
    title: "Help & Support - Applying Myself AI Cover Letter Generator",
    description: "Get help with Applying Myself AI cover letter generator. Find answers to common questions, tutorials, and support for creating professional cover letters.",
    keywords: [
        "Applying Myself help",
        "AI cover letter support",
        "how to use cover letter generator",
        "tutorial",
        "FAQ",
        "customer support"
    ],
    openGraph: {
        title: "Help & Support - Applying Myself",
        description: "Get help with our AI cover letter generator. Find tutorials, FAQs, and support resources.",
        type: "website",
        url: "https://applyingmyself.com/help",
        images: [
            {
                url: "/og-help.png",
                width: 1200,
                height: 630,
                alt: "Applying Myself Help & Support",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "Help & Support - Applying Myself",
        description: "Get help with our AI cover letter generator. Find tutorials, FAQs, and support resources",
        images: ["/twitter-help.png"],
    },
    alternates: {
        canonical: "https://applyingmyself.com/help",
    },
    robots: {
        index: true,
        follow: true,
    },
};

export default function HelpPage() {
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
                <div className="p-6">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold text-gray-900">Help & Support</h1>
                        <p className="mt-1 text-sm text-gray-600">
                            Everything you need to know about using Applying Myself to create professional cover letters with AI
                        </p>
                    </div>

                    {/* Quick Actions Stats */}
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-8">
                        <Link href="/dashboard/cover-letters/new" className="group block">
                            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:border-gray-200 hover:-translate-y-1 cursor-pointer transition-all duration-200">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow duration-200">
                                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="ml-4 flex-1">
                                        <dl>
                                            <dt className="text-sm font-medium text-gray-500 truncate group-hover:text-gray-700 transition-colors duration-200">
                                                Quick Start
                                            </dt>
                                            <dd className="text-lg font-bold text-gray-900 mt-1">
                                                Create Cover Letter
                                            </dd>
                                            <dd className="text-xs text-gray-400 group-hover:text-purple-600 transition-colors duration-200 mt-1">
                                                Start generating now
                                            </dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                        </Link>

                        <Link href="/contact" className="group block">
                            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:border-gray-200 hover:-translate-y-1 cursor-pointer transition-all duration-200">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow duration-200">
                                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="ml-4 flex-1">
                                        <dl>
                                            <dt className="text-sm font-medium text-gray-500 truncate group-hover:text-gray-700 transition-colors duration-200">
                                                Need Help?
                                            </dt>
                                            <dd className="text-lg font-bold text-gray-900 mt-1">
                                                Contact Support
                                            </dd>
                                            <dd className="text-xs text-gray-400 group-hover:text-green-600 transition-colors duration-200 mt-1">
                                                Get personalized help
                                            </dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                        </Link>

                        <Link href="/dashboard" className="group block">
                            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:border-gray-200 hover:-translate-y-1 cursor-pointer transition-all duration-200">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow duration-200">
                                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2-2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="ml-4 flex-1">
                                        <dl>
                                            <dt className="text-sm font-medium text-gray-500 truncate group-hover:text-gray-700 transition-colors duration-200">
                                                Your Account
                                            </dt>
                                            <dd className="text-lg font-bold text-gray-900 mt-1">
                                                View Dashboard
                                            </dd>
                                            <dd className="text-xs text-gray-400 group-hover:text-blue-600 transition-colors duration-200 mt-1">
                                                Manage your account
                                            </dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    </div>

                    {/* Chrome Extension Section */}
                    <div className="card mb-8">
                        <div className="flex items-center mb-4">
                            <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center mr-4">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-lg font-medium text-gray-900">Chrome Extension - Skip the Copy & Paste!</h3>
                                <p className="text-sm text-gray-600">Automatically extract job details from any job board</p>
                            </div>
                        </div>
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                            <p className="text-sm text-green-800 mb-3">
                                <strong>Pro Tip:</strong> Instead of manually copying and pasting job descriptions, use our Chrome extension to automatically extract job details from LinkedIn, Indeed, Glassdoor, and other job boards with just one click!
                            </p>
                            <div className="flex flex-col sm:flex-row gap-3">
                                <a href="https://chrome.google.com/webstore" target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors">
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                    Install Chrome Extension
                                </a>
                                <span className="text-xs text-gray-500 flex items-center">
                                    Works with LinkedIn, Indeed, Glassdoor & more
                                </span>
                            </div>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-4 text-sm">
                            <div className="flex items-start">
                                <div className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-bold text-xs mr-3 mt-0.5">✓</div>
                                <div>
                                    <h4 className="font-semibold text-gray-900 mb-1">One-Click Extraction</h4>
                                    <p className="text-gray-600 text-xs">Click the extension icon on any job posting to automatically extract company, role, and job description</p>
                                </div>
                            </div>
                            <div className="flex items-start">
                                <div className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-bold text-xs mr-3 mt-0.5">✓</div>
                                <div>
                                    <h4 className="font-semibold text-gray-900 mb-1">Instant Sync</h4>
                                    <p className="text-gray-600 text-xs">Extracted job details are automatically saved to your dashboard for cover letter generation</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                        <div className="card">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Getting Started</h3>
                            <div className="space-y-4">
                                <div className="flex items-start">
                                    <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-sm mr-4 mt-1 flex-shrink-0">1</div>
                                    <div>
                                        <h4 className="text-sm font-semibold text-gray-900 mb-1">Create Your Account</h4>
                                        <p className="text-gray-600 text-xs">Sign up with your email or Google account. Choose a subscription plan that fits your job search needs.</p>
                                    </div>
                                </div>

                                <div className="flex items-start">
                                    <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-sm mr-4 mt-1 flex-shrink-0">2</div>
                                    <div>
                                        <h4 className="text-sm font-semibold text-gray-900 mb-1">Upload Your Resume</h4>
                                        <p className="text-gray-600 text-xs">Upload your resume so our AI can understand your background, skills, and experience to create personalized cover letters.</p>
                                    </div>
                                </div>

                                <div className="flex items-start">
                                    <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-sm mr-4 mt-1 flex-shrink-0">3</div>
                                    <div>
                                        <h4 className="text-sm font-semibold text-gray-900 mb-1">Add Job Information</h4>
                                        <p className="text-gray-600 text-xs">Use our Chrome extension to automatically extract job details from job boards, or manually paste the job description. Our AI will analyze the requirements and tailor your cover letter accordingly.</p>
                                    </div>
                                </div>

                                <div className="flex items-start">
                                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm mr-4 mt-1 flex-shrink-0">4</div>
                                    <div>
                                        <h4 className="text-sm font-semibold text-gray-900 mb-1">Generate Cover Letter</h4>
                                        <p className="text-gray-600 text-xs">Click generate and watch our AI create a professional, personalized cover letter in seconds.</p>
                                    </div>
                                </div>

                                <div className="flex items-start">
                                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm mr-4 mt-1 flex-shrink-0">5</div>
                                    <div>
                                        <h4 className="text-sm font-semibold text-gray-900 mb-1">Review & Edit</h4>
                                        <p className="text-gray-600 text-xs">Review the generated cover letter, make any adjustments, and ensure it perfectly represents you.</p>
                                    </div>
                                </div>

                                <div className="flex items-start">
                                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm mr-4 mt-1 flex-shrink-0">6</div>
                                    <div>
                                        <h4 className="text-sm font-semibold text-gray-900 mb-1">Download & Apply</h4>
                                        <p className="text-gray-600 text-xs">Download your cover letter as a PDF or copy the text to use in your job applications.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="card">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
                            <div className="space-y-3">
                                <Link href="/dashboard/cover-letters/new" className="w-full btn-primary flex items-center justify-center space-x-2">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <span>Generate Cover Letter</span>
                                </Link>
                                <Link href="/dashboard/resumes/upload" className="w-full bg-white border border-gray-300 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-50 font-medium transition-colors flex items-center justify-center space-x-2">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <span>Upload Resume</span>
                                </Link>
                                <Link href="/dashboard/jobs/new" className="w-full bg-white border border-gray-300 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-50 font-medium transition-colors flex items-center justify-center space-x-2">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 00-2 2H8a2 2 0 00-2-2V4m8 0h2a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2" />
                                    </svg>
                                    <span>Add Job Application</span>
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* FAQ Section */}
                    <div className="card mb-8">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Frequently Asked Questions</h3>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div>
                                    <h4 className="text-sm font-semibold text-gray-900 mb-2">How does the AI generate cover letters?</h4>
                                    <p className="text-gray-600 text-xs">Our AI analyzes your resume and the job description to create personalized cover letters that highlight your relevant skills and experience for each specific role.</p>
                                </div>

                                <div>
                                    <h4 className="text-sm font-semibold text-gray-900 mb-2">Can I edit the generated cover letters?</h4>
                                    <p className="text-gray-600 text-xs">Absolutely! You can edit, customize, and refine any generated cover letter to match your personal style and add specific details.</p>
                                </div>

                                <div>
                                    <h4 className="text-sm font-semibold text-gray-900 mb-2">How many cover letters can I generate?</h4>
                                    <p className="text-gray-600 text-xs">This depends on your subscription plan. Starter plans include 10 cover letters per month, while Pro and Hired plans offer unlimited generation.</p>
                                </div>

                                <div>
                                    <h4 className="text-sm font-semibold text-gray-900 mb-2">Is my data secure and private?</h4>
                                    <p className="text-gray-600 text-xs">Yes! We use enterprise-grade security to protect your data. Your resumes and cover letters are encrypted and never shared with third parties. <Link href="/privacy" className="text-purple-600 hover:text-purple-700">Learn more</Link></p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <h4 className="text-sm font-semibold text-gray-900 mb-2">What job sites do you support?</h4>
                                    <p className="text-gray-600 text-xs">Our Chrome extension works with LinkedIn, Indeed, Glassdoor, and most major job boards. You can also manually paste job descriptions.</p>
                                </div>

                                <div>
                                    <h4 className="text-sm font-semibold text-gray-900 mb-2">Can I cancel my subscription anytime?</h4>
                                    <p className="text-gray-600 text-xs">Yes, you can cancel your subscription at any time from your account settings. You&rsquo;ll continue to have access until the end of your billing period.</p>
                                </div>

                                <div>
                                    <h4 className="text-sm font-semibold text-gray-900 mb-2">Do you offer refunds?</h4>
                                    <p className="text-gray-600 text-xs">We offer a 30-day money-back guarantee. If you&rsquo;re not satisfied with our service, contact us for a full refund.</p>
                                </div>

                                <div>
                                    <h4 className="text-sm font-semibold text-gray-900 mb-2">How do I install the Chrome extension?</h4>
                                    <p className="text-gray-600 text-xs">Visit the Chrome Web Store, search for &ldquo;Applying Myself&rdquo;, and click &ldquo;Add to Chrome&rdquo;. The extension will appear in your browser toolbar.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Feature Guides */}
                    <div className="grid md:grid-cols-3 gap-6 mb-8">
                        <div className="card">
                            <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center mb-4">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-3">Resume Management</h3>
                            <p className="text-gray-600 text-sm mb-4">Learn how to upload, manage, and optimize your resumes for better cover letter generation.</p>
                            <Link href="/dashboard/resumes" className="text-purple-600 hover:text-purple-700 text-sm font-medium">Manage Resumes →</Link>
                        </div>

                        <div className="card">
                            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center mb-4">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 00-2 2H8a2 2 0 00-2-2V4m8 0h2a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-3">Job Tracking</h3>
                            <p className="text-gray-600 text-sm mb-4">Keep track of your job applications, cover letters, and application status in one place.</p>
                            <Link href="/dashboard/jobs" className="text-blue-600 hover:text-blue-700 text-sm font-medium">View Jobs →</Link>
                        </div>

                        <div className="card">
                            <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center mb-4">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-3">Account Settings</h3>
                            <p className="text-gray-600 text-sm mb-4">Customize your profile, manage billing, and configure notification preferences.</p>
                            <Link href="/dashboard/settings" className="text-green-600 hover:text-green-700 text-sm font-medium">Settings →</Link>
                        </div>
                    </div>

                    {/* Contact Support */}
                    <div className="card">
                        <div className="text-center">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Still Need Help?</h3>
                            <p className="text-sm text-gray-600 mb-6">
                                Our support team is here to help you succeed in your job search
                            </p>
                            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                <Link href="/contact" className="btn-primary">
                                    Contact Support
                                </Link>
                                <a href="mailto:support@applyingmyself.com" className="bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 font-medium transition-colors">
                                    Email Us Directly
                                </a>
                            </div>
                        </div>
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
                                <li><Link href="/help" className="text-gray-400 hover:text-white transition-colors">Help</Link></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-semibold mb-4">Support</h4>
                            <ul className="space-y-2 text-sm">
                                <li><Link href="/help" className="text-gray-400 hover:text-white transition-colors">Help Center</Link></li>
                                <li><Link href="/contact" className="text-gray-400 hover:text-white transition-colors">Contact Us</Link></li>
                                <li><Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</Link></li>
                                <li><Link href="/terms" className="text-gray-400 hover:text-white transition-colors">Terms of Use</Link></li>
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