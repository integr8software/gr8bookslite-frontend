import type { MetadataRoute } from "next";

const PublicRoutes = [
	"",
	"/pricing",
	"/faq",
	"/contact-us",
	"/privacy-policy",
	"/terms-of-service",
	"/return-and-refund-policy",
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
	const baseUrl = new URL(
		process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
	);

	return PublicRoutes.map((route, index) => ({
		url: new URL(route || "/", baseUrl).toString(),
		changeFrequency: index === 0 ? "weekly" : "monthly",
		priority: index === 0 ? 1 : route === "/pricing" ? 0.8 : 0.6,
	}));
}
