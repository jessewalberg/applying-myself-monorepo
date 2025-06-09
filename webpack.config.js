const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const webpack = require('webpack');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';
  const isDevelopment = !isProduction;

  return {
    entry: {
      popup: './src/popup/index.tsx',
      content: './src/content/index.ts',
      background: './src/background/index.ts',
      options: './src/options/index.tsx',
      ...(isDevelopment && { reload: './src/utils/reload.ts' })
    },
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: '[name].js',
      clean: true
    },
    module: {
      rules: [
        {
          test: /\.(js|jsx|ts|tsx)$/,
          exclude: /node_modules/,
          use: [
            {
              loader: 'babel-loader',
            }
          ]
        },
        {
          test: /\.css$/,
          use: [
            isDevelopment ? 'style-loader' : MiniCssExtractPlugin.loader,
            'css-loader'
          ]
        }
      ]
    },
    plugins: [
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(isProduction ? 'production' : 'development'),
        'process.env.CONVEX_URL': JSON.stringify('https://dazzling-badger-1.convex.cloud')
      }),
      new HtmlWebpackPlugin({
        template: './src/popup/popup.html',
        filename: 'popup.html',
        chunks: ['popup']
      }),
      new HtmlWebpackPlugin({
        template: './src/options/options.html',
        filename: 'options.html',
        chunks: ['options']
      }),
      new CopyWebpackPlugin({
        patterns: [
          { 
            from: isDevelopment ? './src/manifest.dev.json' : './src/manifest.prod.json',
            to: 'manifest.json',
            transform: (content) => {
              const manifest = JSON.parse(content.toString());
              
              if (isDevelopment) {
                // Add reload script for development
                manifest.content_scripts = manifest.content_scripts || [];
                manifest.content_scripts.push({
                  matches: ["<all_urls>"],
                  js: ["reload.js"],
                  run_at: "document_start"
                });
                
                // Update version for development builds (Chrome requires dot-separated integers only)
                const timestamp = Date.now().toString().slice(-4); // Last 4 digits
                const versionParts = manifest.version.split('.');
                manifest.version = `${versionParts[0]}.${versionParts[1]}.${versionParts[2]}.${timestamp}`;
              }
              
              return JSON.stringify(manifest, null, 2);
            }
          },
          { from: './src/icons', to: 'icons', noErrorOnMissing: true }
        ]
      }),
      ...(isProduction ? [new MiniCssExtractPlugin()] : [])
    ],
    resolve: {
      extensions: ['.tsx', '.ts', '.js', '.jsx'],
      alias: {
        '@': path.resolve(__dirname, 'src'),
        '@/types': path.resolve(__dirname, 'src/types'),
        '@/components': path.resolve(__dirname, 'src/popup/components'),
        '@/services': path.resolve(__dirname, 'src/services'),
        '@/utils': path.resolve(__dirname, 'src/utils'),
        '@/config': path.resolve(__dirname, 'src/config')
      }
    },
    devtool: isDevelopment ? 'cheap-module-source-map' : false,
    
    optimization: {
      ...(isDevelopment ? {
        removeAvailableModules: false,
        removeEmptyChunks: false,
        splitChunks: false
      } : {
        minimize: true,
        usedExports: true,
        sideEffects: false
      })
    },
    
    ...(isDevelopment && {
      cache: {
        type: 'filesystem'
      }
    })
  };
};