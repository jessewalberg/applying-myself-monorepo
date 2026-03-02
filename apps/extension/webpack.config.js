const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const webpack = require('webpack');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';
  const isDevelopment = !isProduction;
  
  // Get environment from command line or default to development
  const environment = env?.environment || (isProduction ? 'production' : 'development');
  console.log(`🔧 Building Chrome Extension for: ${environment}`);

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
            MiniCssExtractPlugin.loader,
            'css-loader'
          ]
        },
        {
          test: /jspdf.*\.js$/,
          loader: 'string-replace-loader',
          options: {
            search: 'https://cdnjs.cloudflare.com/ajax/libs/pdfobject/2.1.1/pdfobject.min.js',
            replace: '',
            flags: 'g'
          }
        }
      ]
    },
    plugins: [
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(environment),
        'process.env.BUILD_ENV': JSON.stringify(environment),
        // Replace CDN references at compile time
        'process.env.PDFOBJECT_CDN_URL': JSON.stringify('')
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
            from: `./src/manifest.${environment === 'development' ? 'dev' : environment === 'production' ? 'prod' : environment}.json`,
            to: 'manifest.json',
            transform: (content) => {
              const manifest = JSON.parse(content.toString());
              
              if (environment === 'development') {
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
      new MiniCssExtractPlugin({
        filename: '[name].css'
      })
    ],
    resolve: {
      extensions: ['.tsx', '.ts', '.js', '.jsx'],
      alias: {
        '@': path.resolve(__dirname, 'src'),
        '@/types': path.resolve(__dirname, 'src/types'),
        '@/components': path.resolve(__dirname, 'src/components'),
        '@/popup-components': path.resolve(__dirname, 'src/popup/components'),
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