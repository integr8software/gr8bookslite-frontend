import type { NextConfig } from "next";
import { PHASE_PRODUCTION_BUILD } from "next/constants";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  allowedDevOrigins: ["192.168.18.190"],
  serverExternalPackages: [
    "@jsreport/jsreport-chrome-pdf",
    "@jsreport/jsreport-core",
    "@jsreport/jsreport-handlebars",
    "puppeteer",
    "puppeteer-core",
  ],
  turbopack: {
    root: process.cwd(),
  },
  experimental: {
    staleTimes: {
      dynamic: 30,
      static: 300,
    },
    serverActions: {
      allowedOrigins: ["staging.gr8booksneo.integr8.com.ph"],
    },
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: ["Perm", "issions-Policy"].join(""),
            value: "camera=(), microphone=(self), geolocation=(self)",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
        ],
      },
    ];
  },
};

export default function config(phase: string): NextConfig {
  return {
    ...nextConfig,
    typescript: {
      tsconfigPath:
        phase === PHASE_PRODUCTION_BUILD ? "tsconfig.build.json" : "tsconfig.json",
    },
  };
}
