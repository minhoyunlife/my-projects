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
        hostname: "example.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: process.env.AWS_CLOUDFRONT_DOMAIN!,
        port: "",
        pathname: "/**",
      },
    ],
  }, // TODO: 실제 이미지 표시를 하는 시점에 코드를 수정할 것.
};

export default nextConfig;
