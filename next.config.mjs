/** @type {import('next').NextConfig} */
const nextConfig = {
  images:{
    remotePatterns:[{
      protocol: "https",
      hostname: "randomuser.me",
    },
    ],
  },
  reactCompiler: true,
  serverExternalPackages: [
    "arcjet",
    "@arcjet/next",
    "@arcjet/analyze",
    "@arcjet/analyze-wasm",
    "@google/generative-ai",
  ],
};

export default nextConfig;
