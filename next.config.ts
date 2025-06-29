import type { NextConfig } from "next";


const nextConfig: NextConfig = {
  /* config options here */
  env: {
    NEXT_PUBLIC_APP_URL: process.env.CODESPACE_NAME ? `https://${process.env.CODESPACE_NAME}-3000.app.github.dev` : process.env.VERCEL_URL,
  }
};

// console.log(`Next Config: \n${JSON.stringify(nextConfig, null, 2)}`);

export default nextConfig;
