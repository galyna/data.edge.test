import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  
  // Enable standalone output for Docker
  output: "standalone",
  
  // Compiler optimizations
  compiler: {
    // Remove console.log in production
    removeConsole: process.env.NODE_ENV === "production" ? { exclude: ["error", "warn"] } : false,
  },

  // Experimental features for performance
  experimental: {
    // Use optimized package imports
    optimizePackageImports: [
      "lucide-react",
      "@radix-ui/react-accordion",
      "@radix-ui/react-dialog",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-select",
      "@radix-ui/react-tabs",
      "@radix-ui/react-tooltip",
      "recharts",
    ],
  },

  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "logos-world.net",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "media.api-sports.io",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "ui-avatars.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      // ESPN CDN for news images
      {
        protocol: "https",
        hostname: "a.espncdn.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "a1.espncdn.com",
        pathname: "/**",
      },
      // BBC images
      {
        protocol: "https",
        hostname: "ichef.bbci.co.uk",
        pathname: "/**",
      },
      // Sky Sports images
      {
        protocol: "https",
        hostname: "e0.365dm.com",
        pathname: "/**",
      },
      // Fox Sports images
      {
        protocol: "https",
        hostname: "a57.foxsports.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "b.fssta.com",
        pathname: "/**",
      },
      // CBS Sports images
      {
        protocol: "https",
        hostname: "sportshub.cbsistatic.com",
        pathname: "/**",
      },
      // The Guardian images
      {
        protocol: "https",
        hostname: "i.guim.co.uk",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "media.guim.co.uk",
        pathname: "/**",
      },
      // Yahoo Sports images
      {
        protocol: "https",
        hostname: "s.yimg.com",
        pathname: "/**",
      },
      // NBC Sports images
      {
        protocol: "https",
        hostname: "nbcsports.brightspotcdn.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "www.nbcsports.com",
        pathname: "/**",
      },
    ],
    // Optimize image loading
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
  },

  // Production optimizations
  compress: true,
  poweredByHeader: false,
  
  // Webpack optimizations
  webpack: (config, { isServer, dev }) => {
    // Production optimizations only
    if (!dev && !isServer) {
      // Optimize bundle size
      config.optimization = {
        ...config.optimization,
        usedExports: true,
        sideEffects: true,
        moduleIds: "deterministic",
      };
    }
    return config;
  },
};

export default nextConfig;
