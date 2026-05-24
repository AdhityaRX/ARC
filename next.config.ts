import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standalone output keeps the Docker image small; harmless on Vercel.
  output: "standalone",
  serverExternalPackages: ["bcryptjs", "@prisma/client"],
};

export default nextConfig;
