import Link from "next/link";
import type { Metadata } from "next";
import { StructuredData, organizationSchema, webApplicationSchema, serviceSchema } from "@/components/StructuredData";
import { ApplyingMyselfLogo } from "@/components/ApplyingMyselfLogo";

export const metadata: Metadata = {
  title: "AI Cover Letter Generator - Free & Personalized",
  description: "Generate personalized, professional cover letters in seconds with AI. Upload your resume, paste job descriptions, and get hired faster. Try Applying Myself free today!",
  keywords: [
    "AI cover letter generator",
    "cover letter creator",
    "job application",
    "resume builder",
    "career tools",
    "AI job search",
    "personalized cover letters",
    "professional cover letters"
  ],
  openGraph: {
    title: "Applying Myself - Free AI Cover Letter Generator",
    description: "Generate personalized cover letters with AI technology. Upload your resume, paste job descriptions, and get hired faster.",
    type: "website",
    url: "https://applyingmyself.com",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Applying Myself AI Cover Letter Generator Homepage",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Applying Myself - Free AI Cover Letter Generator",
    description: "Generate personalized cover letters with AI technology",
    images: ["/twitter-image.png"],
  },
  alternates: {
    canonical: "https://applyingmyself.com",
  },
};

// Constants - Credit costs for main actions
const JOB_EXTRACTION_COST = 1;
const RESUME_UPLOAD_COST = 1;
const COVER_LETTER_GENERATION_COST = 3;

// Starter credits should always be the sum of the 3 main action costs
const STARTER_CREDITS = JOB_EXTRACTION_COST + RESUME_UPLOAD_COST + COVER_LETTER_GENERATION_COST;

// Navigation Component
function Navigation() {
  return (
    <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-md border-b border-gray-100 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <ApplyingMyselfLogo size="md" className="drop-shadow-sm" />
            <span className="text-xl font-bold text-gray-900">Applying Myself</span>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <Link href="#features" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">Features</Link>
            <Link href="#pricing" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">Pricing</Link>
            <Link href="#testimonials" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">Reviews</Link>
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

// Hero Component
function Hero() {
  return (
    <section className="relative pt-20 pb-32 bg-gradient-to-br from-purple-50 via-white to-blue-50 overflow-hidden min-h-screen flex items-center">
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
        <div className="absolute top-1/4 left-1/2 w-2 h-2 bg-indigo-400 rounded-full animate-ping opacity-40" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-1/4 right-1/3 w-3 h-3 bg-cyan-400 rounded-full animate-ping opacity-40" style={{ animationDelay: '4s' }}></div>

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
              70+ successful placements this month
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-ping"></span>
            </span>
          </div>

          {/* Animated Hero Content */}
          <div className="space-y-6">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 tracking-tight leading-tight">
              <span className="inline-block animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                AI-powered cover letters
              </span>
              <span className="block bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent animate-fade-in-up animate-gradient-x" style={{ animationDelay: '0.4s' }}>
                that get you hired
              </span>
            </h1>
          </div>

          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-12 leading-relaxed animate-fade-in-up opacity-0" style={{ animationDelay: '0.6s', animationFillMode: 'forwards' }}>
            Generate personalized, professional cover letters in seconds. Our AI analyzes job descriptions
            and creates compelling letters that get you noticed by hiring managers.
          </p>

          {/* Enhanced CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-16 animate-fade-in-up opacity-0" style={{ animationDelay: '0.8s', animationFillMode: 'forwards' }}>
            <Link href="/register"
              className="group relative bg-gradient-to-r from-purple-600 to-blue-600 text-white px-10 py-5 rounded-xl text-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 shadow-2xl hover:shadow-purple-500/25 min-w-[220px] overflow-hidden">
              <span className="relative z-10 flex items-center justify-center">
                Start applying
                <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-700 to-blue-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Link>

            <Link href="#demo"
              className="group relative bg-white/80 backdrop-blur-sm text-gray-700 px-10 py-5 rounded-xl text-lg font-semibold border-2 border-gray-200/50 hover:border-purple-300 hover:bg-white/90 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 shadow-xl hover:shadow-2xl min-w-[220px]">
              <span className="flex items-center justify-center">
                Watch demo
                <svg className="w-5 h-5 ml-2 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M19 10a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </span>
            </Link>
          </div>



          {/* Floating Stats */}
          <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl mx-auto animate-fade-in-up opacity-0" style={{ animationDelay: '1.2s', animationFillMode: 'forwards' }}>
            <div className="group">
              <div className="bg-white/60 backdrop-blur-lg rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-white/20">
                <div className="text-3xl font-bold text-purple-600 mb-2 group-hover:scale-110 transition-transform duration-300">2.5M+</div>
                <div className="text-gray-600 font-medium">Cover Letters Generated</div>
              </div>
            </div>

            <div className="group">
              <div className="bg-white/60 backdrop-blur-lg rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-white/20" style={{ animationDelay: '0.1s' }}>
                <div className="text-3xl font-bold text-blue-600 mb-2 group-hover:scale-110 transition-transform duration-300">89%</div>
                <div className="text-gray-600 font-medium">Success Rate</div>
              </div>
            </div>

            <div className="group">
              <div className="bg-white/60 backdrop-blur-lg rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-white/20" style={{ animationDelay: '0.2s' }}>
                <div className="text-3xl font-bold text-pink-600 mb-2 group-hover:scale-110 transition-transform duration-300">30sec</div>
                <div className="text-gray-600 font-medium">Average Generation Time</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Company Logos Component
function CompanyLogos() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          {/* Enhanced Social Proof with Animation */}
          <div className="text-sm text-gray-500 animate-fade-in-up opacity-0" style={{ animationDelay: '1s', animationFillMode: 'forwards' }}>
            <span className="relative">
              Our users landed jobs at these companies
              <div className="absolute -bottom-1 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-400 to-transparent animate-pulse"></div>
            </span>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-8 items-center justify-items-center opacity-60">
          {/* Google */}
          <div className="h-16 flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-300">
            <img
              src="https://img.logo.dev/google.com?token=pk_Qr86mvCGSU67diH-oAXvVA&format=png&size=160"
              alt="Google"
              className="h-12 w-auto"
              loading="lazy"
            />
          </div>

          {/* Apple */}
          <div className="h-16 flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-300">
            <img
              src="https://img.logo.dev/apple.com?token=pk_Qr86mvCGSU67diH-oAXvVA&format=png&size=160"
              alt="Apple"
              className="h-14 w-auto"
              loading="lazy"
            />
          </div>

          {/* Microsoft */}
          <div className="h-16 flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-300">
            <img
              src="https://img.logo.dev/microsoft.com?token=pk_Qr86mvCGSU67diH-oAXvVA&format=png&size=160"
              alt="Microsoft"
              className="h-12 w-auto"
              loading="lazy"
            />
          </div>

          {/* Meta */}
          <div className="h-16 flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-300">
            <img
              src="https://img.logo.dev/meta.com?token=pk_Qr86mvCGSU67diH-oAXvVA&format=png&size=160"
              alt="Meta"
              className="h-12 w-auto"
              loading="lazy"
            />
          </div>

          {/* Netflix */}
          <div className="h-16 flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-300">
            <img
              src="https://img.logo.dev/netflix.com?token=pk_Qr86mvCGSU67diH-oAXvVA&format=png&size=160"
              alt="Netflix"
              className="h-12 w-auto"
              loading="lazy"
            />
          </div>

          {/* Tesla */}
          <div className="h-16 flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-300">
            <img
              src="https://img.logo.dev/tesla.com?token=pk_Qr86mvCGSU67diH-oAXvVA&format=png&size=160"
              alt="Tesla"
              className="h-12 w-auto"
              loading="lazy"
            />
          </div>

          {/* Disney */}
          <div className="h-16 flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-300">
            <img
              src="https://img.logo.dev/disney.com?token=pk_Qr86mvCGSU67diH-oAXvVA&format=png&size=160"
              alt="Disney"
              className="h-12 w-auto"
              loading="lazy"
            />
          </div>

          {/* Nike */}
          <div className="h-16 flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-300">
            <img
              src="https://img.logo.dev/nike.com?token=pk_Qr86mvCGSU67diH-oAXvVA&format=png&size=160"
              alt="Nike"
              className="h-12 w-auto"
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

// Features Component
function Features() {
  const features = [
    {
      icon: "🤖",
      title: "AI Cover Letter Generation",
      description: "Upload your resume and paste any job posting. Our AI creates personalized cover letters that match the role perfectly in under 30 seconds."
    },
    {
      icon: "🌐",
      title: "One-Click Job Extraction",
      description: "Install our Chrome extension and extract job details from any job site with one click. No more copy-pasting job descriptions."
    },
    {
      icon: "📋",
      title: "Application Tracking",
      description: "Keep track of every application with status updates, notes, and deadlines. Never lose track of your job search progress again."
    },
    {
      icon: "📄",
      title: "Resume Management",
      description: "Upload multiple resumes and automatically extract text for AI processing. Perfect for targeting different types of roles."
    },
    {
      icon: "⚡",
      title: "Credit-Based System",
      description: `Pay only for what you use. Generate cover letters (${COVER_LETTER_GENERATION_COST} credits), extract jobs (${JOB_EXTRACTION_COST} credit), and upload resumes (${RESUME_UPLOAD_COST} credit) as needed.`
    },
    {
      icon: "🔒",
      title: "Secure & Private",
      description: "Your data is encrypted and secure. We never share your information with employers or third parties."
    }
  ];

  return (
    <section id="features" className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            The complete job application toolkit
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Extract jobs from any website, generate AI cover letters, and track your applications—all in one powerful platform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Testimonials Component
function Testimonials() {
  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Software Engineer at Google",
      content: "Applying Myself helped me land my dream job at Google. The AI-generated letter was so personalized and professional.",
      avatar: "SJ"
    },
    {
      name: "Michael Chen",
      role: "Product Manager at Meta",
      content: "I was skeptical at first, but the quality of the cover letters was incredible. Got 3 interviews in my first week!",
      avatar: "MC"
    },
    {
      name: "Emily Rodriguez",
      role: "Designer at Apple",
      content: "The AI-generated cover letters are perfectly tailored to each job posting. It highlights exactly what employers want to see!",
      avatar: "ER"
    }
  ];

  return (
    <section id="testimonials" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Loved by job seekers everywhere
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Join thousands of professionals who have successfully landed their dream jobs using Applying Myself.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-gray-50 rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white font-bold mr-4">
                  {testimonial.avatar}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                  <p className="text-sm text-gray-600">{testimonial.role}</p>
                </div>
              </div>
              <p className="text-gray-700 italic leading-relaxed">&ldquo;{testimonial.content}&rdquo;</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Pricing Component
function Pricing() {
  const plans = [
    {
      name: "Starter",
      price: "$9",
      period: "per month",
      features: [
        "50 credits per month",
        `AI cover letter generation (${COVER_LETTER_GENERATION_COST} credits)`,
        `Job extraction from websites (${JOB_EXTRACTION_COST} credit)`,
        `Resume upload & processing (${RESUME_UPLOAD_COST} credit)`,
        "Application tracking",
        "Email support"
      ],
      cta: "Get started",
      popular: false
    },
    {
      name: "Pro",
      price: "$19",
      period: "per month",
      features: [
        "150 credits per month",
        "Advanced AI cover letters",
        "Unlimited job extraction",
        "Multiple resume management",
        "Advanced application tracking",
        "Priority support"
      ],
      cta: "Most popular",
      popular: true
    },
    {
      name: "Hired",
      price: "$49",
      period: "per month",
      features: [
        "500 credits per month",
        "Premium AI models",
        "Bulk job processing",
        "Advanced analytics",
        "Export capabilities",
        "Dedicated support"
      ],
      cta: "For power users",
      popular: false
    }
  ];

  return (
    <section id="pricing" className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Pay only for what you use
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {`Credit-based pricing means you never waste money. Get ${STARTER_CREDITS} starter credits when you sign up.`}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <div key={index} className={`bg-white rounded-xl p-8 shadow-lg border-2 ${plan.popular ? 'border-purple-500 ring-4 ring-purple-100' : 'border-gray-200'} relative`}>
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-gray-600 ml-2">/{plan.period}</span>
                </div>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link href="/register"
                className={`block w-full text-center py-3 px-6 rounded-lg font-semibold transition-all transform hover:scale-105 ${plan.popular
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 shadow-lg'
                  : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}>
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// CTA Component
function CTA() {
  return (
    <section className="py-24 bg-gradient-to-r from-purple-600 to-blue-600">
      <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
          Start applying smarter today
        </h2>
        <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
          Join job seekers who&rsquo;ve streamlined their application process and landed jobs at top companies. Get {STARTER_CREDITS} starter credits included.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/register"
            className="bg-white text-purple-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-all transform hover:scale-105 shadow-xl min-w-[200px]">
            Get started now
          </Link>
          <Link href="/login"
            className="bg-transparent text-white px-8 py-4 rounded-lg text-lg font-semibold border-2 border-white hover:bg-white hover:text-purple-600 transition-all transform hover:scale-105 min-w-[200px]">
            Sign in
          </Link>
        </div>
      </div>
    </section>
  );
}

// Footer Component
function Footer() {
  return (
    <footer className="py-16 bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <ApplyingMyselfLogo size="md" className="drop-shadow-sm" />
              <span className="text-xl font-bold">Applying Myself</span>
            </div>
            <p className="text-gray-400 max-w-md mb-6">
              AI-powered cover letter generation that helps job seekers land their dream jobs.
              Create personalized, professional cover letters in seconds.
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
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="#features" className="hover:text-white transition-colors">Features</Link></li>
              <li><Link href="#pricing" className="hover:text-white transition-colors">Pricing</Link></li>
              <li><Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/help" className="hover:text-white transition-colors">Help Center</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
          <p>&copy; 2024 Applying Myself. All rights reserved.</p>
          <p className="mt-2">
            <a href="https://logo.dev" title="Logo API" className="hover:text-white transition-colors">
              Logos provided by Logo.dev
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}

// Main Homepage
export default function HomePage() {
  return (
    <>
      {/* Structured Data for SEO */}
      <StructuredData data={organizationSchema} />
      <StructuredData data={webApplicationSchema} />
      <StructuredData data={serviceSchema} />

      <main>
        <Navigation />
        <Hero />
        <CompanyLogos />
        <Features />
        <Testimonials />
        <Pricing />
        <CTA />
        <Footer />
      </main>
    </>
  )
}