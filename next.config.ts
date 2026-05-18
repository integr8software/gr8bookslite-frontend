import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	allowedDevOrigins: ["192.168.18.190"],
	experimental: {
		viewTransition: true,
	},
};

export default nextConfig;
