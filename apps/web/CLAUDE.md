# Applying Myself - Codebase Guide

## Project Overview
**Applying Myself** is an AI-powered cover letter generation platform built with Next.js 15, TypeScript, and Convex as the backend. The application helps job seekers create personalized cover letters by analyzing resumes and job descriptions.

## Tech Stack
- **Frontend**: Next.js 15.3.3 (App Router), React 19, TypeScript 5
- **Styling**: Tailwind CSS 4
- **Backend**: Convex (real-time backend with database)
- **Authentication**: Clerk (`@clerk/nextjs`) + Convex Clerk integration
- **Icons**: Lucide React, Heroicons
- **Document Processing**: docx, jspdf, html2canvas
- **Analytics**: Vercel Analytics

## Project Structure

```
applying-myself-next/
├── app/                           # Next.js App Router
│   ├── layout.tsx                 # Root layout with metadata & ConvexProvider
│   ├── page.tsx                   # Homepage (imports HomePageClient)
│   ├── HomePageClient.tsx         # Main landing page component
│   ├── globals.css                # Global styles
│   ├── login/                     # Authentication pages
│   ├── register/
│   ├── dashboard/                 # Protected dashboard area
│   │   ├── layout.tsx             # Dashboard layout wrapper
│   │   ├── page.tsx               # Dashboard home
│   │   ├── cover-letters/         # Cover letter management
│   │   ├── jobs/                  # Job application tracking
│   │   ├── resumes/               # Resume management
│   │   ├── billing/               # Subscription & billing
│   │   └── settings/              # User settings
│   └── help/, contact/, privacy/, terms/  # Static pages
├── components/                    # Reusable React components
│   ├── ConvexProvider.tsx         # Convex client wrapper
│   ├── DashboardLayout.tsx        # Main dashboard layout
│   ├── ProtectedRoute.tsx         # Authentication guard
│   ├── ApplyingMyselfLogo.tsx     # Logo component
│   └── ui/                        # UI components
├── convex/                        # Convex backend
│   ├── _generated/                # Auto-generated types
│   └── convex.json                # Deployment config
├── utils/                         # Utility functions
│   └── auth.ts                    # Environment-specific auth config
├── scripts/                       # Build & utility scripts
└── public/                        # Static assets
```

## Key Components & Architecture

### Authentication Flow
- **Provider**: `ConvexProvider` wraps the app with `ClerkProvider` + `ConvexProviderWithClerk`
- **Guards**: `ProtectedRoute` guards dashboard routes
- **Middleware**: `middleware.ts` protects dashboard/debug routes via Clerk

### Layout Structure
1. **Root Layout** (`app/layout.tsx`): SEO metadata, font setup, ConvexProvider
2. **Dashboard Layout** (`app/dashboard/layout.tsx`): ProtectedRoute + NavigationProvider wrapper
3. **DashboardLayout Component**: Sidebar navigation, user menu, responsive design

### Homepage Architecture
- **HomePageClient**: Main landing page with sections:
  - Navigation with mobile responsive menu
  - Hero section with animated elements
  - Company logos social proof
  - Features grid
  - Testimonials
  - Pricing plans
  - CTA section
  - Footer

### Key Features
- **Credit System**: Pay-per-use model (1 credit for job extraction/resume upload, 3 credits for cover letter)
- **Multi-Environment**: Development, staging, production configurations
- **Real-time Backend**: Convex handles database/API while Clerk handles auth identity
- **Responsive Design**: Mobile-first with Tailwind CSS
- **SEO Optimized**: Structured data, metadata, sitemap generation

## Development Workflows

### Available Scripts
```bash
# Development
bun run dev                 # Start dev server with HTTPS & Turbopack
bun run dev:clean          # Clean build and start dev
bun run dev:staging        # Start staging development

# Build & Deploy
bun run build              # Production build + sitemap generation
bun run start              # Start production server
bun run deploy:staging     # Deploy to staging
bun run deploy:production  # Deploy to production

# Utilities
bun run lint               # ESLint code checking
bun run generate-api       # Generate Convex API types
bun run sitemap           # Generate sitemap
bun run validate-seo      # Validate SEO setup
```

### Environment Configuration
- **Local**: `localhost:3000` with `dazzling-badger-1.convex.cloud`
- **Staging**: `dev.applyingmyself.com` 
- **Production**: `applyingmyself.com` with `oceanic-retriever-344.convex.site`

### Key Configuration Files
- `next.config.ts`: Performance optimization, security headers, image config
- `tsconfig.json`: TypeScript configuration with path aliases
- `convex.json`: Convex deployment configuration
- `eslint.config.mjs`: Code linting rules
- `postcss.config.mjs`: Tailwind CSS processing

## Code Patterns & Conventions

### File Organization
- Client components use `"use client"` directive
- Server components for static content and metadata
- Separate layout files for route groups
- Utility functions in dedicated `utils/` directory

### Component Patterns
- Functional components with TypeScript interfaces
- Custom hooks for Convex queries/mutations
- Responsive design with Tailwind CSS classes
- Icon components from Lucide React

### Authentication Pattern
- Singleton ConvexReactClient for auth state persistence
- Protected routes with `ProtectedRoute` wrapper
- User profile management with Convex mutations
- Environment-specific auth configuration

### State Management
- Convex real-time queries for server state
- React useState for local component state
- Navigation state managed in layout components

## Build Process
1. **TypeScript Compilation**: Strict mode enabled
2. **Next.js Build**: App Router compilation with Turbopack
3. **Sitemap Generation**: Automatic sitemap creation post-build
4. **SEO Validation**: Optional SEO validation script
5. **Asset Optimization**: Image optimization, CSS minification

## Testing & Quality
- **ESLint**: Code quality and consistency
- **TypeScript**: Type safety and IntelliSense
- **Production Build**: Build validation before deployment

## Performance Optimizations
- **Turbopack**: Fast development builds
- **Image Optimization**: Next.js automatic image optimization
- **Code Splitting**: Automatic route-based splitting
- **CSS Optimization**: Tailwind CSS purging and minification
- **SEO**: Structured data, metadata, and performance headers
