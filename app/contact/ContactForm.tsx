"use client";

// Contact Form Section
export function ContactForm() {
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Handle form submission here
        alert('Thank you for your message! We&rsquo;ll get back to you soon.');
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
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 bg-white/50 backdrop-blur-sm group-hover:bg-white/70"
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
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 bg-white/50 backdrop-blur-sm group-hover:bg-white/70"
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
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 bg-white/50 backdrop-blur-sm group-hover:bg-white/70"
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
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 bg-white/50 backdrop-blur-sm group-hover:bg-white/70"
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
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 bg-white/50 backdrop-blur-sm group-hover:bg-white/70 resize-none"
                                placeholder="Tell us how we can help you..."
                            ></textarea>
                        </div>

                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="newsletter"
                                name="newsletter"
                                className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
                            />
                            <label htmlFor="newsletter" className="ml-2 text-sm text-gray-600">
                                I&rsquo;d like to receive updates about new features and tips for job searching
                            </label>
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                className="group relative w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 shadow-2xl hover:shadow-purple-500/25 overflow-hidden"
                            >
                                <span className="relative z-10 flex items-center justify-center">
                                    Send Message
                                    <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                    </svg>
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