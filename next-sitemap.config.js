/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.SITE_URL || 'https://applyingmyself.com',
  generateRobotsTxt: false, // We have a custom robots.txt
  generateIndexSitemap: false, // Single sitemap for now
  changefreq: 'daily',
  priority: 0.7,
  sitemapSize: 5000,
  
  // Include specific paths
  additionalPaths: async (config) => [
    await config.transform(config, '/'),
    await config.transform(config, '/help'),
    await config.transform(config, '/privacy'),
    await config.transform(config, '/terms'),
    await config.transform(config, '/contact'),
    await config.transform(config, '/login'),
    await config.transform(config, '/register'),
  ],
  
  // Exclude protected and API routes
  exclude: [
    '/dashboard',
    '/dashboard/*',
    '/admin',
    '/admin/*',
    '/api/*',
    '/test-stripe',
    '/test-stripe/*',
    '/_next/*',
    '/convex/*',
  ],
  
  // Custom transform for each URL
  transform: async (config, path) => {
    // Set custom priorities and frequencies for different pages
    let priority = 0.7;
    let changefreq = 'weekly';
    
    switch (path) {
      case '/':
        priority = 1.0;
        changefreq = 'daily';
        break;
      case '/help':
        priority = 0.8;
        changefreq = 'weekly';
        break;
      case '/privacy':
      case '/terms':
        priority = 0.3;
        changefreq = 'monthly';
        break;
      case '/contact':
      case '/login':
      case '/register':
        priority = 0.6;
        changefreq = 'weekly';
        break;
    }
    
    return {
      loc: path,
      changefreq,
      priority,
      lastmod: new Date().toISOString(),
    };
  },
  
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/dashboard/',
          '/api/',
          '/test-stripe/',
          '/_next/',
          '/convex/',
        ],
      },
    ],
    additionalSitemaps: [
      'https://applyingmyself.com/sitemap.xml',
    ],
  },
}; 