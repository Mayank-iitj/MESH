import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['@prisma/composer-prisma-cloud', '@prisma/composer'],
};

export default nextConfig;
