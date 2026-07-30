import type { NextConfig } from "next";

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
	viewTransition: true,
	staleTimes: {
		dynamic: 30,
		static: 300,
	},
	serverActions: {
		allowedOrigins: ["staging.gr8booksneo.integr8.com.ph"],
	},
},	async headers() {
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
