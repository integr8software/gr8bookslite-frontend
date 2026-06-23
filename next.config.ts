import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	poweredByHeader: false,
	allowedDevOrigins: ["192.168.18.190"],
	turbopack: {
		root: process.cwd(),
	},
	experimental: {
		viewTransition: true,
		staleTimes: {
			dynamic: 30,
			static: 300,
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
						key: "Permissions-Policy",
						value: "camera=(), microphone=(self), geolocation=()",
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

export default nextConfig;
