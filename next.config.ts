import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  // Hides the "N" dev badge; compile and runtime errors still show.
  devIndicators: false,
};

export default nextConfig;
