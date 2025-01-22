import path from "path";

import dotenv from "dotenv";
import type { NextConfig } from "next";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: process.env.AWS_CLOUDFRONT_DOMAIN || "example.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
