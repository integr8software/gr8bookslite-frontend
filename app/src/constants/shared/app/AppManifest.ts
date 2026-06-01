import type { MetadataRoute } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";

export const AppManifest: MetadataRoute.Manifest = {
	name: AppName,
	short_name: AppName,
	description: `${AppName} frontend`,
	start_url: "/",
	display: "standalone",
	background_color: "#ecf2ef",
	theme_color: "#212738",
	icons: [
		{
			src: "/favicon.ico?v=robot-large-20260601",
			sizes: "16x16 32x32 48x48 64x64 128x128",
			type: "image/x-icon",
		},
		{
			src: "/logo/logo-192x192.png?v=robot-large-20260601",
			sizes: "192x192",
			type: "image/png",
		},
		{
			src: "/logo/logo-512x512.png?v=robot-large-20260601",
			sizes: "512x512",
			type: "image/png",
		},
	],
};
