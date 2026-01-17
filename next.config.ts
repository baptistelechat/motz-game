import withPWAInit from "@ducanh2912/next-pwa";
import type { NextConfig } from "next";

const withPWA = withPWAInit({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  swcMinify: true,
  disable: false,
  workboxOptions: {
    disableDevLogs: true,
  },
});

const config: NextConfig = {
  cacheComponents: true,
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        ...config.watchOptions,
        ignored: [
          "**/public/sw.js",
          "**/public/workbox-*.js",
          "**/public/swe-worker-*.js",
          "**/public/worker-*.js",
          "**/public/sw.js.map",
          "**/public/workbox-*.js.map",
          "**/public/swe-worker-*.js.map",
          "**/public/worker-*.js.map",
        ],
      };
    }
    return config;
  },
};

export default withPWA(config);
