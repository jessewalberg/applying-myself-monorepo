# CoverCraft Extension Setup Guide

## Quick Start with Your Convex Deployment

Your Convex deployment is running at: **https://dazzling-badger-1.convex.cloud** ✅

This extension has been pre-configured to work with your development deployment!

## 🚀 Quick Setup (2 minutes)

```bash
# 1. Install dependencies and build
npm run setup

# 2. Start development mode with auto-reload
npm start
```

Then load the `dist/` folder in Chrome at `chrome://extensions/` (enable Developer mode first).

Now any changes you make to the source code will automatically rebuild and reload the extension in Chrome! 🎉

## 📋 Detailed Setup Steps

### 1. Verify Configuration
```bash
npm run check-config
```

This should show:
- ✅ Development Environment: `https://dazzling-badger-1.convex.cloud`
- ⚠️ Production Environment: (needs configuration when you deploy to production)

### 2. Build the Extension

#### For Development (current setup):
```bash
npm run build:dev
```

#### For Production (when ready):
```bash
npm run build:prod
```

### 3. Load in Chrome

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `dist/` folder from this project
5. The extension should appear as "CoverCraft - Development"

### 4. Test the Extension

1. Go to any job posting website (LinkedIn, Indeed, etc.)
2. Click the extension icon
3. Create an account or log in
4. Try extracting a job posting
5. Upload a resume and generate a cover letter

## 🔧 Development Workflow

### Development Mode (Auto-rebuild + Auto-reload)
```bash
npm run dev
# or simply
npm start
```

This will:
- ✅ Build the extension if needed
- ✅ Start webpack in watch mode (auto-rebuild on file changes)
- ✅ Start auto-reload server (automatically reload extension in Chrome)
- ✅ Use development configuration with enhanced logging

The extension will automatically reload in Chrome whenever you make changes to the source code!

### Configuration Management

Check current config:
```bash
npm run check-config
```

Update development URL (if needed):
```bash
npm run update-config https://dazzling-badger-1.convex.cloud development
```

Update production URL (when you have a production deployment):
```bash
npm run update-config https://your-prod-deployment.convex.cloud production
```

## 🏭 Production Deployment

When you're ready to deploy to production:

1. **Deploy your Convex backend to production** (separate deployment)
2. **Update production config**:
   ```bash
   npm run update-config https://your-prod-deployment.convex.cloud production
   ```
3. **Build for production**:
   ```bash
   npm run build:prod
   ```
4. **Package for Chrome Web Store**:
   ```bash
   npm run zip
   ```

## 🐛 Troubleshooting

### Extension Not Working
```bash
# Check configuration
npm run check-config

# Rebuild extension
npm run build:dev

# Check browser console for errors
```

### API Connection Issues
- Verify your Convex deployment is running: https://dazzling-badger-1.convex.cloud
- Check network tab in browser dev tools
- Ensure manifest.json has correct permissions

### Common Issues

**"Cannot connect to API server"**
- Your Convex deployment URL is correct: ✅ `https://dazzling-badger-1.convex.cloud`
- Check if your Convex functions are deployed properly
- Verify the extension has network permissions

**"User not authenticated"**
- Try logging out and back in
- Clear extension storage: Chrome → Settings → Privacy → Site Settings → CoverCraft → Clear Data

**Job extraction not working**
- Make sure you're on a valid job posting page
- Check that the content script is injecting properly
- Try refreshing the page

## 📦 Package Scripts Reference

| Script | Purpose |
|--------|---------|
| `npm start` | Start development mode (alias for `npm run dev`) |
| `npm run dev` | Development with auto-rebuild + auto-reload |
| `npm run build:dev` | Build development version (one-time) |
| `npm run build:prod` | Build production version |
| `npm run check-config` | Check configuration status |
| `npm run update-config` | Update Convex URLs |
| `npm run setup` | Install dependencies + initial build |
| `npm run zip` | Package for distribution |

## 🔒 Security & Privacy

- All communication uses HTTPS
- Your Convex deployment: `https://dazzling-badger-1.convex.cloud`
- No data is shared with third parties
- Resume content is encrypted and secure

## 📚 Next Steps

1. **Test thoroughly** with different job sites
2. **Configure production** when ready to launch
3. **Customize branding** (icons, names, etc.)
4. **Submit to Chrome Web Store** (production build)

## 🆘 Getting Help

- Check browser console for detailed error messages
- Run `npm run check-config` to verify setup
- Review the network tab for API call failures
- Check your Convex dashboard for function logs

---

**Your deployment is ready! 🎉** 

The extension is configured to work with `https://dazzling-badger-1.convex.cloud` right out of the box. 