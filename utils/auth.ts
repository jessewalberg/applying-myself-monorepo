/**
 * Utility functions for environment-specific authentication configuration
 */

export function getGoogleClientId(): string {
    const environment = process.env.NEXT_PUBLIC_ENVIRONMENT || 'development';

    // Use environment-specific client IDs
    switch (environment) {
        case 'production':
            return process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID_PROD || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';
        case 'staging':
            return process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID_STAGING || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';
        case 'development':
        default:
            return process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID_DEV || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';
    }
}

export function getGoogleRedirectUri(): string {
    const environment = process.env.NEXT_PUBLIC_ENVIRONMENT || 'development';
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

    if (!siteUrl) {
        // Fallback based on environment
        switch (environment) {
            case 'production':
                return 'https://applyingmyself.com/api/auth/callback/google';
            case 'staging':
                return 'https://dev.applyingmyself.com/api/auth/callback/google';
            default:
                return 'http://localhost:3000/api/auth/callback/google';
        }
    }

    return `${siteUrl}/api/auth/callback/google`;
}

export function getEnvironment(): 'development' | 'staging' | 'production' {
    return (process.env.NEXT_PUBLIC_ENVIRONMENT as 'development' | 'staging' | 'production') || 'development';
}

export function isProduction(): boolean {
    return getEnvironment() === 'production';
}

export function isStaging(): boolean {
    return getEnvironment() === 'staging';
}

export function isDevelopment(): boolean {
    return getEnvironment() === 'development';
} 