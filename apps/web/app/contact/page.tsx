import Link from "next/link";
import { Metadata } from "next";
import { ApplyingMyselfLogo } from "@/components/ApplyingMyselfLogo";
import { ContactForm } from "./ContactForm";

export const metadata: Metadata = {
  title: "Contact Us - Applying Myself AI Cover Letter Generator",
  description: "Get in touch with the Applying Myself team. Contact us for support, feedback, or questions about our AI cover letter generator service.",
  keywords: [
    "Applying Myself contact",
    "AI cover letter support",
    "customer service",
    "help center",
    "feedback"
  ],
  openGraph: {
    title: "Contact Us - Applying Myself",
    description: "Get in touch with the Applying Myself team for support and questions.",
    type: "website",
    url: "https://applyingmyself.com/contact",
    images: [
      {
        url: "/og-contact.png",
        width: 1200,
        height: 630,
        alt: "Applying Myself Contact Page",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact Us - Applying Myself",
    description: "Get in touch with the Applying Myself team",
    images: ["/twitter-contact.png"],
  },
};

// Navigation Component
function Navigation() {
  return (
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
            <Link href="/contact" className="text-purple-600 font-medium">Contact</Link>
            <Link href="/login" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">Sign in</Link>
            <Link href="/register" className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all transform hover:scale-105 shadow-lg">
              Get started
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button className="text-gray-600 hover:text-gray-900 p-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

// Contact Hero Section
function ContactHero() {
  return (
    <section className="relative pt-20 pb-16 bg-gradient-to-br from-purple-50 via-white to-blue-50 overflow-hidden min-h-[60vh] flex items-center">
      {/* Advanced Background Elements */}
      <div className="absolute inset-0 bg-grid-pattern opacity-20"></div>

      {/* Floating Geometric Shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Large floating circles */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-purple-400/10 to-pink-400/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-gradient-to-r from-blue-400/10 to-cyan-400/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-40 left-1/3 w-80 h-80 bg-gradient-to-r from-indigo-400/10 to-purple-400/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }}></div>

        {/* Smaller floating elements */}
        <div className="absolute top-32 right-1/4 w-4 h-4 bg-purple-400 rounded-full animate-bounce opacity-60" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-20 w-3 h-3 bg-blue-400 rounded-full animate-bounce opacity-60" style={{ animationDelay: '3s' }}></div>
        <div className="absolute bottom-1/3 right-16 w-5 h-5 bg-pink-400 rounded-full animate-bounce opacity-60" style={{ animationDelay: '5s' }}></div>

        {/* Glass morphism shapes */}
        <div className="absolute top-24 left-1/4 w-32 h-32 bg-white/20 backdrop-blur-sm rounded-2xl rotate-12 animate-float opacity-60" style={{ animationDelay: '1.5s' }}></div>
        <div className="absolute bottom-32 right-1/4 w-24 h-24 bg-white/20 backdrop-blur-sm rounded-xl -rotate-12 animate-float opacity-60" style={{ animationDelay: '3.5s' }}></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        <div className="text-center">
          {/* Animated Badge */}
          <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-green-50/80 backdrop-blur-sm text-green-700 border border-green-200/50 mb-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 animate-pulse-slow">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
            <span className="relative">
              We respond within 24 hours
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-ping"></span>
            </span>
          </div>

          {/* Animated Hero Content */}
          <div className="space-y-6">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 tracking-tight leading-tight">
              <span className="inline-block animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                Get in touch
              </span>
              <span className="block bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent animate-fade-in-up animate-gradient-x" style={{ animationDelay: '0.4s' }}>
                We&rsquo;re here to help
              </span>
            </h1>
          </div>

          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-12 leading-relaxed animate-fade-in-up opacity-0" style={{ animationDelay: '0.6s', animationFillMode: 'forwards' }}>
            Have questions about Applying Myself? Need help with your account? Want to share feedback?
            We&rsquo;d love to hear from you and help you land your dream job.
          </p>
        </div>
      </div>
    </section>
  );
}

// Contact Methods Section
function ContactMethods() {
  const contactMethods = [
    {
      icon: "📧",
      title: "Email Support",
      description: "Get detailed help with any questions or issues",
      contact: "support@applyingmyself.com",
      action: "Send Email",
      href: "mailto:support@applyingmyself.com",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: "💬",
      title: "Live Chat",
      description: "Chat with our team in real-time during business hours",
      contact: "Coming Soon",
      action: "Coming Soon",
      href: "#",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: "📱",
      title: "Social Media",
      description: "Follow us for updates and quick support",
      contact: "@ApplyingMyself",
      action: "Follow Us",
      href: "#",
      color: "from-indigo-500 to-purple-500"
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Multiple ways to reach us
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choose the method that works best for you. We&rsquo;re committed to providing excellent support.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {contactMethods.map((method, index) => (
            <div key={index} className="group bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 relative overflow-hidden">
              {/* Background gradient on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${method.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>

              <div className="relative z-10">
                <div className="text-5xl mb-6 transform group-hover:scale-110 transition-transform duration-300">
                  {method.icon}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{method.title}</h3>
                <p className="text-gray-600 mb-4 leading-relaxed">{method.description}</p>
                <p className="text-lg font-semibold text-gray-800 mb-6">{method.contact}</p>

                <a href={method.href}
                  className={`inline-flex items-center px-6 py-3 rounded-lg font-semibold text-white bg-gradient-to-r ${method.color} hover:shadow-lg transform hover:scale-105 transition-all duration-300`}>
                  {method.action}
                  <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}



// FAQ Section
function FAQ() {
  const faqs = [
    {
      question: "How quickly do you respond to support requests?",
      answer: "We typically respond to all support requests within 24 hours during business days. For urgent technical issues, we often respond much faster."
    },
    {
      question: "Can I get help with my cover letter content?",
      answer: "Absolutely! Our support team can help you optimize your cover letter generation settings and provide tips for better results."
    },
    {
      question: "Do you offer phone support?",
      answer: "Currently, we provide support via email and live chat. This allows us to better track your issues and provide detailed, documented solutions."
    },
    {
      question: "Can you help with billing questions?",
      answer: "Yes! We can help with all billing-related questions, including plan changes, payment issues, and refund requests."
    },
    {
      question: "Is there a way to provide product feedback?",
      answer: "We love hearing from our users! You can share feedback through our contact form, email, or during live chat sessions."
    },
    {
      question: "Do you offer training or onboarding help?",
      answer: "While we don&rsquo;t offer formal training, our support team is happy to help you get started and make the most of Applying Myself's features."
    }
  ];

  return (
    <section className="py-24 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Frequently asked questions
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Quick answers to common questions. Can&rsquo;t find what you&rsquo;re looking for? Contact us directly.
          </p>
        </div>

        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <div key={index} className="group bg-gray-50 rounded-xl p-6 hover:bg-gray-100 transition-all duration-300 border border-gray-200 hover:border-purple-200 hover:shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 group-hover:text-purple-600 transition-colors duration-300">
                {faq.question}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-600 mb-6">Still have questions?</p>
          <a href="#contact-form"
            className="inline-flex items-center px-6 py-3 rounded-lg font-semibold text-purple-600 bg-purple-50 hover:bg-purple-100 transition-all duration-300 transform hover:scale-105">
            Contact our support team
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}

// Footer Component
function Footer() {
  return (
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
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z" />
                </svg>
              </a>
            </div>
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
            <h3 className="text-lg font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              <li><Link href="/contact" className="text-gray-400 hover:text-white transition-colors">Contact</Link></li>
              <li><a href="mailto:support@applyingmyself.com" className="text-gray-400 hover:text-white transition-colors">Email Support</a></li>
              <li><Link href="#" className="text-gray-400 hover:text-white transition-colors">Help Center</Link></li>
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
  );
}

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <ContactHero />
      <ContactMethods />
      <div id="contact-form">
        <ContactForm />
      </div>
      <FAQ />
      <Footer />
    </div>
  );
} 