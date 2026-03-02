# CoverCraft Chrome Extension

> **⚡ Backend Technology**: This extension uses [Convex](https://convex.dev/) as the backend infrastructure, replacing the previous Cloudflare Workers setup.

AI-powered cover letter generator Chrome extension that works with the Convex backend.

## Setup Instructions

### 1. Configure Convex Backend

First, make sure your Convex backend is deployed and running. From the main project directory:

```bash
cd convex
npx convex deploy
```

Note your deployment URL (e.g., `https://your-deployment.convex.cloud`).

### 2. Update Extension Configuration

The extension now supports separate development and production configurations. 

#### For Development (using your dev deployment):
```bash
npm run update-config https://dazzling-badger-1.convex.cloud development
```

#### For Production (when you have a production deployment):
```bash
npm run update-config https://your-production-deployment.convex.cloud production
```

The configuration automatically detects the environment and uses the appropriate settings.

### 3. Install Dependencies

```bash
npm install
```

### 4. Build the Extension

#### For Development:
```bash
npm run build:dev
```

#### For Production:
```bash
npm run build:prod
```

#### Or use the default build (production):
```bash
npm run build
```

### 5. Load Extension in Chrome

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" in the top right
3. Click "Load unpacked"
4. Select the `dist` folder from this directory

## Development

### Environment Configuration

The extension now supports two environments:

#### Development Environment
- Uses your development Convex deployment (`https://dazzling-badger-1.convex.cloud`)
- Extension name shows "CoverCraft - Development" 
- Enhanced logging and debugging
- Includes hot-reload functionality
- More permissive host permissions

#### Production Environment  
- Uses your production Convex deployment (to be configured)
- Clean extension name "CoverCraft"
- Minimal logging
- Optimized build
- Restricted host permissions

### Development Mode

For development with auto-rebuild and auto-reload:

```bash
npm run dev
# or simply
npm start
```

This starts:
- ⚡ Webpack watch mode (auto-rebuild on changes)
- 🔄 Auto-reload server (extension reloads automatically in Chrome)
- 📝 Enhanced development logging

### Testing

1. Navigate to any job posting website (LinkedIn, Indeed, etc.)
2. Click the extension icon
3. Log in with your account
4. Click "Extract Current Page" to extract job information
5. Upload a resume and generate a cover letter

## Features

- **Job Extraction**: Automatically extracts job information from web pages
- **Resume Management**: Upload and manage multiple resumes
- **Cover Letter Generation**: AI-powered cover letter creation
- **History**: View and manage previously generated cover letters
- **Credit System**: Track usage with credit-based billing

## Architecture

The extension consists of:

- **Popup**: Main UI for user interaction
- **Content Script**: Extracts page content from job sites
- **Background Script**: Handles extension lifecycle and messaging
- **Convex API Service**: Communicates with the Convex backend

## API Integration

The extension uses the Convex backend with the following key functions:

- `auth:login` / `auth:register` - User authentication
- `resumes:getResumes` / `resumes:upload` - Resume management
- `jobs:extractFromHTML` - Job information extraction
- `coverLetters:generate` / `coverLetters:getCoverLetters` - Cover letter operations
- `billing:createSubscriptionCheckout` - Billing management

## Configuration

Key configuration options in `src/config.ts`:

- `CONVEX_URL`: Your Convex deployment URL
- `MAX_RETRIES`: Number of retry attempts for failed requests
- `REQUEST_TIMEOUT`: Request timeout in milliseconds

## Troubleshooting

### Extension Not Loading
- Check that the build completed successfully
- Verify all dependencies are installed
- Check the Chrome developer console for errors

### API Connection Issues
- Verify the Convex URL is correct in `config.ts`
- Check that the Convex backend is deployed and accessible
- Verify host permissions in `manifest.json` include your Convex domain

### Content Extraction Not Working
- Ensure you're on a supported job site
- Check that the content script is injected properly
- Verify the page has job-related content

## Supported Job Sites

The extension works on most job posting websites including:
- LinkedIn Jobs
- Indeed
- Glassdoor
- AngelList
- Company career pages
- And many more

## Privacy & Security

- All data is encrypted in transit
- Resume content is securely stored in Convex
- No data is shared with third parties
- User authentication is handled securely

## Support

For issues or questions:
1. Check the browser console for error messages
2. Verify your Convex backend is running
3. Check the extension's popup for error messages
4. Review the network tab for failed API calls 