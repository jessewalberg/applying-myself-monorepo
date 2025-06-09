# Development Guide

## 🎯 Unified Development Workflow

The Chrome extension now has a streamlined development experience that combines building, watching, and auto-reload into a single command.

## ⚡ Quick Start

```bash
# One-time setup
npm run setup

# Start development (auto-rebuild + auto-reload)
npm start
```

That's it! Your extension will automatically:
- ✅ Rebuild when you change source files
- ✅ Reload in Chrome when builds complete
- ✅ Use development configuration and logging

## 🔧 What Happens When You Run `npm start`

1. **Initial Build Check**: If no `dist/` folder exists, does an initial development build
2. **Webpack Watch**: Starts webpack in watch mode to rebuild on file changes
3. **Auto-Reload Server**: Starts WebSocket server on port 8080 for extension reloading
4. **Development Manifest**: Uses `manifest.dev.json` with development-specific settings

## 📁 File Structure

```
chrome-extension/
├── src/
│   ├── manifest.dev.json    # Development manifest (auto-reload enabled)
│   ├── manifest.prod.json   # Production manifest (clean)
│   ├── config.ts           # Environment-aware configuration
│   ├── utils/reload.ts     # Auto-reload client
│   └── ...
├── scripts/
│   ├── dev.js             # New unified development script
│   ├── reload-server.js   # WebSocket server for auto-reload
│   └── reload-extension.js # Manual reload trigger
└── dist/                  # Built extension (load this in Chrome)
```

## 🛠️ Development Commands

| Command | Purpose |
|---------|---------|
| `npm start` | **Main development command** - build + watch + auto-reload |
| `npm run dev` | Same as `npm start` |
| `npm run build:dev` | One-time development build |
| `npm run build:prod` | Production build (no auto-reload) |
| `npm run check-config` | Verify environment configuration |
| `npm run setup` | First-time setup (install + build) |

## 🔄 Auto-Reload How It Works

1. **Webpack Watch**: Monitors `src/` directory for changes
2. **File Change Detected**: Webpack rebuilds the extension
3. **Build Complete**: Reload server detects `dist/` folder changes
4. **WebSocket Broadcast**: Sends reload message to extension
5. **Extension Reloads**: Auto-reload client triggers extension reload

## 🌐 Loading in Chrome

1. Open Chrome: `chrome://extensions/`
2. Enable "Developer mode" (top right toggle)
3. Click "Load unpacked"
4. Select the `dist/` folder
5. Extension appears as "CoverCraft - Development"

## 📝 Development Features

### Environment Detection
- Automatically uses development configuration
- Enhanced console logging for debugging
- Development-specific manifest with extra permissions

### Hot Reload
- Changes to TypeScript/React files trigger rebuilds
- Extension automatically reloads in Chrome
- No manual refresh needed

### Debug Logging
```javascript
// Development mode automatically logs API calls
console.log('📡 Convex query: auth:getUserProfile', args);
console.log('✅ Convex query success: auth:getUserProfile', result);
```

## 🚨 Troubleshooting

### Auto-reload not working?
```bash
# Check if reload server is running
lsof -i :8080

# Restart development
npm start
```

### Extension not updating?
```bash
# Force rebuild
npm run clean && npm run dev

# Check Chrome extension page for errors
# chrome://extensions/ → Details → Errors
```

### Build errors?
```bash
# Check configuration
npm run check-config

# Clean install
npm run clean && npm install && npm run setup
```

## 🎨 Making Changes

### Code Changes
Just edit files in `src/` - the extension will automatically rebuild and reload!

### Configuration Changes
```bash
# Update development URL
npm run update-config https://new-url.convex.cloud development

# Check configuration
npm run check-config
```

### Dependencies
```bash
# Add new dependency
npm install package-name

# Restart development
npm start
```

## 🚀 Going to Production

When ready to build for production:

```bash
# Update production configuration
npm run update-config https://prod-url.convex.cloud production

# Build production version
npm run build:prod

# Package for Chrome Web Store
npm run zip
```

## 💡 Tips

- Keep the development terminal open to see build status
- Use Chrome DevTools on the extension popup for debugging
- Check the background page for service worker logs
- Use `npm run check-config` to verify your setup

---

**Happy coding! 🎉** Your extension now has a modern development workflow with instant feedback. 