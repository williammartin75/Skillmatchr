/** @type {import('next').NextConfig} */
const nextConfig = {
  // Optimisations pour réduire les recompilations
  experimental: {
    // Optimisation du cache
    optimizeCss: true,
    optimizePackageImports: ['@next/font'],
  },
  
  // Configuration du webpack pour optimiser les performances
  webpack: (config, { dev, isServer }) => {
    if (dev) {
      // En mode développement, optimiser les recompilations
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
        ignored: ['**/node_modules', '**/.next', '**/uploads'],
      };
    }
    
    return config;
  },
  
  // Optimisations de performance
  compress: true,
  poweredByHeader: false,
  
  // Configuration des headers pour le cache
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
        ],
      },
    ];
  },
  
  // Optimisation des images
  images: {
    domains: [],
    formats: ['image/webp', 'image/avif'],
  },
  
  // Configuration TypeScript (si utilisé)
  typescript: {
    ignoreBuildErrors: false,
  },
  
  // Configuration ESLint (si utilisé)
  eslint: {
    ignoreDuringBuilds: false,
  },
};

module.exports = nextConfig; 