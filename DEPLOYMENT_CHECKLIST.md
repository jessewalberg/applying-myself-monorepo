# Chrome Extension Deployment Checklist

## 🚀 Pre-Deployment Setup

### ✅ Technical Preparation
- [x] Extension builds successfully (`npm run build:prod`)
- [x] Package size optimized (654KB - well under limits)
- [x] Extension dimensions updated to 640x400px for better UX
- [x] All assets properly sized and optimized
- [x] Store assets prepared in `store-assets/` directory
- [x] Screenshots and promotional images ready

### 🔧 Configuration Needed
- [ ] Chrome Web Store Developer Account ($5 fee)
- [ ] Extension tested and working locally
- [ ] All placeholder values replaced with production values
- [ ] Production Convex deployment ready
- [ ] Real Convex deployment URL configured

## 📋 Chrome Web Store Publishing Steps

### Step 1: Upload Extension
1. [ ] Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole/)
2. [ ] Click "New Item"
3. [ ] Upload `extension-production.zip`
4. [ ] Fill out listing details:
   - [ ] Name: "Applying Myself - AI Cover Letter Generator"
   - [ ] Description: (from CHROME_EXTENSION_DEPLOYMENT.md)
   - [ ] Category: "Productivity"
   - [ ] Screenshots: Upload from `store-assets/screenshots/`
   - [ ] Icons: Upload from `store-assets/`

### Step 2: Set Privacy Level
- [ ] Choose visibility:
  - [ ] **Private** (only you can install) - RECOMMENDED for initial setup
  - [ ] **Unlisted** (anyone with link can install)
  - [ ] **Public** (searchable in store) - for final release

### Step 3: Get Extension ID
- [ ] Note the Extension ID from the dashboard (format: `abcdefghijklmnopqrstuvwxyz123456`)

## 🔐 Authentication Configuration

The extension now uses Convex's built-in authentication system. No additional OAuth setup is required.

### Step 1: Verify Convex Auth Setup
1. [ ] Confirm Convex auth is working in production
2. [ ] Test login/logout flows
3. [ ] Verify user sessions persist correctly

### Step 2: Extension Permissions
The extension requires these permissions:
- `activeTab` - To read job posting content
- `storage` - To cache user preferences
- `scripting` - To inject content scripts
- `contextMenus` - For right-click job extraction

## 🔄 Update Extension Configuration

### Update `config.ts` with production values:
```typescript
export const CONFIG = {
  ENVIRONMENT: 'production' as const,
  CONVEX_URL: 'https://oceanic-retriever-344.convex.site',
  SITE_URL: 'https://applyingmyself.com',
  DEBUG: false,
  VERSION: '1.0.0'
};
```

### Update `manifest.prod.json`:
- [ ] Set correct `name` and `description`
- [ ] Update `version` to match package.json
- [ ] Set production `host_permissions` to match Convex URL
- [ ] Remove any development-only permissions

## 🧪 Testing Checklist

### Pre-Submission Testing
- [ ] Install extension locally in Chrome
- [ ] Test on multiple job sites (LinkedIn, Indeed, etc.)
- [ ] Verify job content extraction works
- [ ] Test cover letter generation flow
- [ ] Verify user authentication works
- [ ] Test all popup navigation tabs
- [ ] Check extension icon displays correctly
- [ ] Verify no console errors in production build

### Cross-Browser Testing (Optional)
- [ ] Test in Chrome (primary target)
- [ ] Test in Edge (Chromium-based, should work)

## 📤 Chrome Web Store Submission

### Required Assets
- [ ] Extension ZIP file (built for production)
- [ ] 5 screenshots (1280x800 or 640x400)
- [ ] 128x128 icon for store listing
- [ ] 1400x560 marquee promotional image
- [ ] 440x280 promotional tile image
- [ ] Detailed description (up to 16,000 characters)
- [ ] Privacy policy URL
- [ ] Support contact email

### Store Listing Information
- [ ] Choose appropriate category (Productivity)
- [ ] Add relevant tags/keywords
- [ ] Set target audience (mature/general)
- [ ] Configure pricing (free)
- [ ] Set geographic distribution

## 🔍 Common Issues & Solutions

### Build Issues
1. **"Module not found" errors**
   - Run `npm install` to ensure all dependencies are installed
   - Check that all import paths are correct

2. **"Manifest validation failed"**
   - Verify all required manifest fields are present
   - Check that file paths in manifest exist

### Runtime Issues
1. **"Extension context invalidated"**
   - This happens during development when reloading
   - Refresh the page after reloading extension

2. **"Authentication failed"**
   - Verify Convex URL is correct for environment
   - Check that Convex deployment is accessible

### Store Rejection Issues
1. **"Permissions too broad"**
   - Review and minimize requested permissions
   - Provide clear justification for each permission

2. **"Unclear functionality"**
   - Improve extension description
   - Add more detailed screenshots
   - Include clear use case examples

## 🚀 Post-Publication

### After Approval
- [ ] Update website with Chrome Web Store link
- [ ] Announce launch on social media/blog
- [ ] Monitor user reviews and ratings
- [ ] Set up analytics tracking (if applicable)
- [ ] Plan for future updates and maintenance

### Ongoing Maintenance
- [ ] Monitor Chrome Web Store developer dashboard
- [ ] Respond to user reviews and feedback
- [ ] Plan regular updates for new features
- [ ] Keep extension compatible with Chrome updates
- [ ] Monitor and fix any reported bugs

---

## 📞 Support Resources

- [Chrome Web Store Developer Documentation](https://developer.chrome.com/docs/webstore/)
- [Chrome Extension Development Guide](https://developer.chrome.com/docs/extensions/)
- [Convex Documentation](https://docs.convex.dev/)

---

**✅ Ready for Production!** Once all checklist items are complete, your extension is ready for Chrome Web Store submission.