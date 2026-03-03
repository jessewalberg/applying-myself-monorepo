# Chrome Extension Convex Migration Guide

This document outlines the changes made to update the Chrome extension to work with the new Convex backend.

## Key Changes Made

### 1. New Convex API Service (`src/services/convexApi.ts`)

- **Created**: New service class that replaces the old REST API calls
- **Features**: 
  - Direct HTTP calls to Convex functions via `/api/query/` and `/api/mutation/` endpoints
  - Proper authentication handling with user ID management
  - Error handling and retry logic
  - Type-safe function calls

### 2. Updated Configuration (`src/config.ts`)

- **Added**: `CONVEX_URL` field for Convex deployment URL
- **Updated**: `API_BASE_URL` to point to Convex endpoint
- **Maintained**: Backward compatibility with existing config structure

### 3. Component Updates

#### Popup App (`src/popup/App.tsx`)
- Replaced `apiService` imports with `convexApi`
- Updated all API calls to use new Convex service

#### Generate Tab (`src/popup/components/GenerateTab.tsx`)
- Updated job extraction to use `convexApi.extractJobFromHTML()`
- Modified data handling for new Convex response format
- Updated resume upload and cover letter generation flows

#### History Tab (`src/popup/components/HistoryTab.tsx`)
- Updated to use `convexApi.getCoverLetters()`

#### Settings Tab (`src/popup/components/SettingsTab.tsx`)
- Updated billing session creation to use Convex

### 4. Manifest Updates (`src/manifest.json`)

- **Added**: Host permissions for `*.convex.cloud` domains
- **Maintained**: All existing permissions and functionality

### 5. New Configuration Files

#### Convex Config (`convex.json`)
- Links extension to Convex deployment
- Points to shared functions directory

#### Package Scripts (`package.json`)
- Added `update-config` script for easy URL updates
- Added `setup` script for one-command installation

### 6. Developer Tools

#### Update Script (`scripts/update-config.js`)
- Automated tool to update Convex URL configuration
- Validates URL format and updates both CONVEX_URL and API_BASE_URL

#### Documentation (`README.md`)
- Comprehensive setup and troubleshooting guide
- Architecture overview
- Development workflow instructions

## API Function Mapping

The extension now calls these Convex functions:

| Old REST Endpoint | New Convex Function | Purpose |
|------------------|-------------------|---------|
| `POST /auth/login` | `auth:login` | User authentication |
| `POST /auth/register` | `auth:register` | User registration |
| `GET /auth/profile` | `auth:getUserProfile` | Get user data |
| `GET /resumes` | `resumes:getResumes` | List user resumes |
| `POST /resumes/upload` | `resumes:upload` | Upload resume |
| `POST /jobs/extract-from-html` | `jobs:extractFromHTML` | Extract job data |
| `POST /cover-letters/generate` | `coverLetters:generate` | Generate cover letter |
| `GET /cover-letters` | `coverLetters:getCoverLetters` | List cover letters |
| `POST /billing/session` | `billing:createSubscriptionCheckout` | Create billing session |

## Data Format Changes

### Authentication
- Now stores user ID directly for Convex function calls
- Token format: `convex_user_{userId}`
- User data structure remains compatible

### Job Extraction Response
```typescript
// Old format
{ id, title, company, ... }

// New format  
{ jobData: { title, company, ... }, tokensUsed, remainingCredits }
```

### Error Handling
- Improved error messages for Convex-specific issues
- Better network error detection
- Graceful fallbacks for API connectivity issues

## Migration Steps for Developers

1. **Update Convex URL**: Use the update script or manually edit `config.ts`
2. **Build Extension**: Run `bun run build`
3. **Test Authentication**: Verify login/register flows work
4. **Test Job Extraction**: Try extracting from various job sites
5. **Test Cover Letter Generation**: Ensure full workflow works
6. **Verify Billing**: Test subscription flows (if applicable)

## Backward Compatibility

- All existing user data and settings are preserved
- UI/UX remains identical to users
- Extension permissions and functionality unchanged
- Storage format compatible with existing installations

## Performance Improvements

- Direct Convex calls eliminate REST API overhead
- Better error handling reduces failed requests
- Improved retry logic for network issues
- Optimized data serialization

## Security Enhancements

- Secure authentication with Convex's built-in security
- Proper user isolation through userId parameters
- HTTPS-only communication with Convex cloud
- No sensitive data stored in extension storage

## Testing Checklist

- [ ] Extension loads without errors
- [ ] User can log in and register
- [ ] Job extraction works on major job sites
- [ ] Resume upload and management functions
- [ ] Cover letter generation completes successfully
- [ ] History tab shows previous cover letters
- [ ] Settings and billing flows work
- [ ] Extension works across browser restarts
- [ ] Network error handling is graceful

## Troubleshooting Common Issues

### "Cannot connect to API server"
- Check CONVEX_URL in config.ts
- Verify Convex deployment is accessible
- Check browser network tab for failed requests

### "User not authenticated" 
- Clear extension storage and re-login
- Check that userId is properly stored
- Verify Convex auth functions are working

### Job extraction fails
- Check content script injection
- Verify page has extractable job content
- Check Convex function logs for errors

### Build errors
- Run `bun install` to ensure all dependencies
- Check TypeScript compilation errors
- Verify all imports are correct 