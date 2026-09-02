import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@prisma/client", "prisma"],
  poweredByHeader: false,
  compress: true,
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "framer-motion",
      "recharts",
      "@radix-ui/react-avatar",
      "@radix-ui/react-dialog",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-select",
      "@radix-ui/react-tabs",
    ],
  },
  turbopack: {
    root: path.resolve(__dirname),
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "cdn.sofifa.net", pathname: "/**" },
      { protocol: "https", hostname: "ratings-images-prod.pulse.ea.com", pathname: "/**" },
      { protocol: "https", hostname: "drop-assets.ea.com", pathname: "/**" },
      { protocol: "https", hostname: "**.fifaindex.com", pathname: "/**" },
      { protocol: "https", hostname: "**.supabase.co", pathname: "/**" },
      { protocol: "https", hostname: "r2.thesportsdb.com", pathname: "/**" },
      { protocol: "https", hostname: "www.thesportsdb.com", pathname: "/**" },
      { protocol: "https", hostname: "d37kf7rs4g1hyv.cloudfront.net", pathname: "/**" },
      { protocol: "https", hostname: "www.scorebat.com", pathname: "/**" },
    ],
  },
};

export default nextConfig;
