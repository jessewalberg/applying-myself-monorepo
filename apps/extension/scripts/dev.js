#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const WebSocket = require('ws');
const chokidar = require('chokidar');

console.log('🚀 Starting CoverCraft Development Environment');
console.log('=' .repeat(50));

// Check if dist folder exists, if not do initial build
const distPath = path.join(__dirname, '../dist');
if (!fs.existsSync(distPath)) {
  console.log('📦 No dist folder found, doing initial build...');
  
  const buildProcess = spawn('npm', ['run', 'build:dev'], {
    stdio: 'inherit',
    shell: true,
    cwd: path.join(__dirname, '..')
  });

  buildProcess.on('close', (code) => {
    if (code === 0) {
      console.log('✅ Initial build complete!');
      startDevServer();
    } else {
      console.error('❌ Initial build failed');
      process.exit(1);
    }
  });
} else {
  console.log('📦 Dist folder exists, starting development server...');
  startDevServer();
}

function startDevServer() {
  console.log('\n🔧 Starting development server with auto-reload...');
  console.log('📁 Watching: src/ directory for changes');
  console.log('🔄 Auto-reload: Enabled on port 8080');
  console.log('🌐 Load extension: chrome://extensions/ → Load unpacked → dist/');
  console.log('\n💡 Press Ctrl+C to stop\n');

  // Start WebSocket server for auto-reload
  const wss = new WebSocket.Server({ port: 8080 });
  console.log('🔌 WebSocket server started on port 8080');

  // Start webpack in watch mode
  const webpackProcess = spawn('npx', ['webpack', '--mode', 'development', '--watch'], {
    stdio: 'inherit',
    shell: true,
    cwd: path.join(__dirname, '..')
  });

  // Watch for changes in dist folder and notify clients
  const watcher = chokidar.watch(distPath, {
    ignored: /node_modules/,
    persistent: true
  });

  watcher.on('change', (filePath) => {
    console.log(`📝 File changed: ${path.relative(distPath, filePath)}`);
    
    // Broadcast reload message to all connected clients
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ type: 'reload' }));
      }
    });
  });

  // Handle process termination
  process.on('SIGINT', () => {
    console.log('\n🛑 Stopping development server...');
    watcher.close();
    wss.close();
    webpackProcess.kill('SIGINT');
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    watcher.close();
    wss.close();
    webpackProcess.kill('SIGTERM');
    process.exit(0);
  });

  webpackProcess.on('close', (code) => {
    if (code !== 0) {
      console.error(`❌ Webpack process exited with code ${code}`);
    }
    watcher.close();
    wss.close();
    process.exit(code);
  });
} 