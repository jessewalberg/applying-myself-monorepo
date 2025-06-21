interface StructuredDataProps {
    data: object;
}

export function StructuredData({ data }: StructuredDataProps) {
    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
        />
    );
}

// Organization Schema
export const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Applying Myself",
    "description": "AI-powered cover letter generation that helps job seekers land their dream jobs. Create personalized, professional cover letters in seconds.",
    "url": "https://applyingmyself.com",
    "logo": "https://applyingmyself.com/logo.png",
    "foundingDate": "2024",
    "contactPoint": {
        "@type": "ContactPoint",
        "contactType": "customer service",
        "email": "support@applyingmyself.com"
    },
    "sameAs": [
        "https://twitter.com/applyingmyself"
    ]
};

// Web Application Schema
export const webApplicationSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Applying Myself",
    "description": "AI-powered cover letter generation platform that helps job seekers create personalized, professional cover letters in seconds.",
    "url": "https://applyingmyself.com",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web Browser",
    "offers": [
        {
            "@type": "Offer",
            "name": "Starter Plan",
            "price": "9.00",
            "priceCurrency": "USD",
            "priceSpecification": {
                "@type": "RecurringPaymentsPlan",
                "frequency": "monthly"
            },
            "description": "50 credits per month with AI cover letter generation"
        },
        {
            "@type": "Offer",
            "name": "Pro Plan",
            "price": "19.00",
            "priceCurrency": "USD",
            "priceSpecification": {
                "@type": "RecurringPaymentsPlan",
                "frequency": "monthly"
            },
            "description": "150 credits per month with advanced AI features"
        },
        {
            "@type": "Offer",
            "name": "Hired Plan",
            "price": "49.00",
            "priceCurrency": "USD",
            "priceSpecification": {
                "@type": "RecurringPaymentsPlan",
                "frequency": "monthly"
            },
            "description": "500 credits per month with premium AI models"
        }
    ],
    "featureList": [
        "AI-powered cover letter generation",
        "Job extraction from websites",
        "Resume upload and processing",
        "Application tracking",
        "Multiple resume management",
        "Chrome extension (coming soon)"
    ],
    "screenshot": "https://applyingmyself.com/screenshots/dashboard.png"
};

// Service Schema
export const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "AI Cover Letter Generation",
    "description": "Professional AI-powered cover letter writing service that creates personalized cover letters tailored to specific job applications.",
    "provider": {
        "@type": "Organization",
        "name": "Applying Myself"
    },
    "serviceType": "Cover Letter Writing Service",
    "audience": {
        "@type": "Audience",
        "audienceType": "Job Seekers"
    },
    "offers": {
        "@type": "Offer",
        "priceRange": "$9-$49",
        "priceCurrency": "USD"
    },
    "hasOfferCatalog": {
        "@type": "OfferCatalog",
        "name": "Cover Letter Services",
        "itemListElement": [
            {
                "@type": "Offer",
                "itemOffered": {
                    "@type": "Service",
                    "name": "AI Cover Letter Generation",
                    "description": "Generate personalized cover letters using advanced AI"
                }
            },
            {
                "@type": "Offer",
                "itemOffered": {
                    "@type": "Service",
                    "name": "Job Application Tracking",
                    "description": "Track and manage your job applications"
                }
            },
            {
                "@type": "Offer",
                "itemOffered": {
                    "@type": "Service",
                    "name": "Resume Management",
                    "description": "Upload and manage multiple resumes"
                }
            }
        ]
    }
}; 