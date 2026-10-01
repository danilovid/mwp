import type { NextConfig } from "next";
import { TILDA_PLAN } from "./src/lib/tilda-plan";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  serverExternalPackages: ["sharp", "better-sqlite3", "@prisma/adapter-better-sqlite3"],
  async redirects() {
    // Старые адреса товаров на Tilda: /tproduct/749532643922-shlem-hokkenii → /catalog/shlem
    return Object.entries(TILDA_PLAN).map(([uid, plan]) => ({
      source: `/tproduct/:path(${uid}-.*)`,
      destination: `/catalog/${plan.slug}`,
      permanent: true,
    }));
  },
};

export default nextConfig;
