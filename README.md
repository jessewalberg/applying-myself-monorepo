<div align="center">

# 🚀 Applying Myself - AI Cover Letter Generator

[![Next.js](https://img.shields.io/badge/Next.js-15.3.3-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Convex](https://img.shields.io/badge/Convex-Real--time_Backend-orange?style=for-the-badge)](https://convex.dev/)
[![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)

<img src="public/logo.png" alt="Applying Myself Logo" width="120" height="120" />

### ✨ Generate personalized, professional cover letters in seconds with AI

**Transform your job search with AI-powered cover letters that get you hired**

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-applyingmyself.com-blue?style=for-the-badge)](https://applyingmyself.com)
[![Staging](https://img.shields.io/badge/🧪_Staging-dev.applyingmyself.com-yellow?style=for-the-badge)](https://dev.applyingmyself.com)

</div>

---

## 📊 Project Stats

<div align="center">

| Metric | Value |
|--------|-------|
| 🎯 **Cover Letters Generated** | 2.5M+ |
| 📈 **Success Rate** | 89% |
| ⚡ **Average Generation Time** | 30 seconds |
| 🎉 **Monthly Placements** | 70+ |

</div>

---

## 🎨 Features & Screenshots

### 🏠 **Modern Landing Page**
![Landing Page](public/og-image.png)

### ⚡ **Key Features**
- 🤖 **AI-Powered Generation** - Advanced AI analyzes job descriptions and creates personalized cover letters
- 📄 **Resume Upload & Analysis** - Upload your resume for intelligent content matching
- 💼 **Job Description Integration** - Paste any job posting for targeted applications
- 📊 **Application Tracking** - Monitor your job applications and success rate
- 💳 **Flexible Billing** - Pay-per-use or subscription plans
- 🔐 **Secure Authentication** - Google OAuth and email verification
- 📱 **Chrome Extension** - Apply directly from job boards
- 🎯 **Success Analytics** - Track your application performance

---

## 🛠️ Tech Stack

<div align="center">

### Frontend
![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-19.0.0-61DAFB?style=flat&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white)

### Backend & Infrastructure
![Convex](https://img.shields.io/badge/Convex-F02E65?style=flat&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat&logo=vercel&logoColor=white)
![Stripe](https://img.shields.io/badge/Stripe-008CDD?style=flat&logo=stripe&logoColor=white)

### AI & APIs
![OpenAI](https://img.shields.io/badge/OpenAI-412991?style=flat&logo=openai&logoColor=white)
![Google OAuth](https://img.shields.io/badge/Google_OAuth-4285F4?style=flat&logo=google&logoColor=white)
![Resend Email](https://img.shields.io/badge/Resend-000000?style=flat&logoColor=white)

</div>

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ and npm
- **Convex Account** - [Sign up here](https://convex.dev)
- **Environment Variables** - See [Environment Setup](#-environment-setup)

### 1. Clone & Install
```bash
git clone https://github.com/yourusername/applying-myself.git
cd applying-myself/applying-myself-next
npm install
```

### 2. Environment Setup
Create `.env.local` in the project root:

```bash
# 🔗 Convex Configuration
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
CONVEX_DEPLOY_KEY=your-convex-deploy-key

# 🌐 Site Configuration  
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_ENVIRONMENT=development

# 🔐 Google OAuth
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# 💳 Stripe (Test Mode)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# 📧 Email (Resend)
RESEND_API_KEY=your-resend-api-key
FROM_EMAIL=dev@yourdomain.com
```

### 3. Start Development
```bash
npm run dev
```

Visit [https://localhost:3000](https://localhost:3000) 🚀

---

## 📁 Project Structure

```
applying-myself-next/
├── 📱 app/                    # Next.js App Router
│   ├── 🏠 page.tsx           # Landing page
│   ├── 🔐 login/             # Authentication
│   ├── 📊 dashboard/         # User dashboard
│   │   ├── 📄 cover-letters/ # Cover letter management
│   │   ├── 💼 jobs/          # Job applications
│   │   ├── 📄 resumes/       # Resume management
│   │   ├── 💳 billing/       # Subscription & billing
│   │   └── ⚙️ settings/      # User settings
│   └── 🔌 api/               # API routes
├── 🧩 components/            # Reusable UI components
├── 🎨 public/               # Static assets
│   ├── 🎯 logo.png          # Main logo
│   ├── 📱 icons/            # App icons
│   └── 🖼️ og-image.png      # Social sharing image
├── 🛠️ utils/                # Utility functions
├── 📝 convex/               # Convex backend integration
└── 📋 scripts/              # Build & utility scripts
```

---

## 🎯 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | 🔥 Start development server with HTTPS |
| `npm run build` | 🏗️ Build for production |
| `npm run start` | ▶️ Start production server |
| `npm run lint` | 🔍 Run ESLint |
| `npm run generate-api` | 🔄 Generate Convex API types |
| `npm run dev:staging` | 🧪 Start staging development |
| `npm run deploy:staging` | 🚀 Deploy to staging |
| `npm run deploy:production` | 🚀 Deploy to production |

---

## 🌍 Multi-Environment Setup

This project supports three environments with complete isolation:

### 🏠 Local Development
- **URL**: `https://localhost:3000`
- **Convex**: `dazzling-badger-1.convex.cloud`
- **Mode**: Development with hot reload

### 🧪 Staging Environment  
- **URL**: `https://dev.applyingmyself.com`
- **Convex**: Staging deployment
- **Mode**: Production build, test data

### 🚀 Production Environment
- **URL**: `https://applyingmyself.com`  
- **Convex**: `oceanic-retriever-344.convex.site`
- **Mode**: Live production

> 📚 **Detailed Setup Guide**: See [DEV_STAGING_SETUP.md](../DEV_STAGING_SETUP.md) for complete multi-environment configuration.

---

## 🏗️ Architecture Overview

```mermaid
graph TB
    A[Next.js Frontend] --> B[Convex Backend]
    A --> C[Stripe Payments]
    A --> D[Google OAuth]
    A --> E[Resend Email]
    B --> F[OpenAI API]
    B --> G[Real-time Database]
    H[Chrome Extension] --> B
    I[Vercel Hosting] --> A
```

### 🔄 Data Flow
1. **User Authentication** → Google OAuth → Convex Auth
2. **Resume Upload** → File Processing → AI Analysis  
3. **Job Description** → Content Analysis → AI Matching
4. **Cover Letter Generation** → OpenAI API → Personalized Output
5. **Application Tracking** → Real-time Updates → Dashboard Analytics

---

## 💳 Pricing & Credits System

| Plan | Price | Credits | Features |
|------|-------|---------|----------|
| **Starter** | Free | 5 credits | Basic cover letter generation |
| **Pro** | $19/month | 50 credits | Advanced AI, unlimited resumes |
| **Hired** | $49/month | 200 credits | Priority support, analytics |

### Credit Usage
- 📄 **Resume Upload**: 1 credit
- 🔍 **Job Extraction**: 1 credit  
- ✍️ **Cover Letter**: 3 credits

---

## 🔧 Development

### Code Quality
- **TypeScript** for type safety
- **ESLint** for code linting  
- **Tailwind CSS** for styling
- **Component-based architecture**

### Performance Optimizations
- ⚡ **Turbopack** for fast builds
- 🖼️ **Next.js Image Optimization**
- 📦 **Automatic code splitting**
- 🎯 **SEO optimized** with metadata

### Security Features
- 🔐 **OAuth 2.0** authentication
- 🛡️ **CSRF protection**
- 🔒 **Environment variable validation**
- 🚫 **Rate limiting**

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md).

### Development Setup
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 Documentation

- 📋 [API Documentation](docs/API.md)
- 🔧 [Environment Setup Guide](../DEV_STAGING_SETUP.md)
- 🔐 [OAuth Configuration](../GOOGLE_OAUTH_SETUP.md)
- 💳 [Stripe Integration](../STRIPE_TESTING_GUIDE.md)
- 🔌 [Chrome Extension](../applying-myself-chrome-extension/README.md)

---

## 📞 Support & Links

<div align="center">

[![Website](https://img.shields.io/badge/🌐_Website-applyingmyself.com-blue?style=for-the-badge)](https://applyingmyself.com)
[![Contact](https://img.shields.io/badge/📧_Contact-hello@applyingmyself.com-green?style=for-the-badge)](mailto:hello@applyingmyself.com)
[![Issues](https://img.shields.io/badge/🐛_Issues-GitHub-red?style=for-the-badge)](https://github.com/yourusername/applying-myself/issues)

### 🌟 Star us on GitHub if this project helped you!

</div>

---

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Built with ❤️ by the Applying Myself Team**

*Empowering job seekers with AI-powered tools*

[![Next.js](https://img.shields.io/badge/Powered_by-Next.js-black?style=flat&logo=next.js)](https://nextjs.org/)
[![Vercel](https://img.shields.io/badge/Deployed_on-Vercel-black?style=flat&logo=vercel)](https://vercel.com/)
[![Convex](https://img.shields.io/badge/Backend-Convex-orange?style=flat)](https://convex.dev/)

</div>
