import type { Metadata } from "next";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";

const AppMetadataBase = new URL(
	process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
);

const AppDescription = `${AppName} frontend`;
const AppMetaLogoPath = "/logo.png";
const AppIconVersion = "robot-large-20260601";

export const AppMetadata: Metadata = {
	metadataBase: AppMetadataBase,
	title: AppName,
	description: AppDescription,
	manifest: "/manifest.webmanifest",
	icons: {
		icon: [
			{
				url: `/favicon.ico?v=${AppIconVersion}`,
				sizes: "16x16 32x32 48x48 64x64 128x128",
				type: "image/x-icon",
			},
			{
				url: `/favicon-16x16.png?v=${AppIconVersion}`,
				sizes: "16x16",
				type: "image/png",
			},
			{
				url: `/favicon-32x32.png?v=${AppIconVersion}`,
				sizes: "32x32",
				type: "image/png",
			},
			{
				url: `/favicon-48x48.png?v=${AppIconVersion}`,
				sizes: "48x48",
				type: "image/png",
			},
			{
				url: `/favicon-64x64.png?v=${AppIconVersion}`,
				sizes: "64x64",
				type: "image/png",
			},
			{
				url: `/favicon-128x128.png?v=${AppIconVersion}`,
				sizes: "128x128",
				type: "image/png",
			},
		],
		apple: [
			{
				url: `/apple-touch-icon.png?v=${AppIconVersion}`,
				sizes: "180x180",
				type: "image/png",
			},
		],
	},
	openGraph: {
		title: AppName,
		description: AppDescription,
		images: [
			{
				url: AppMetaLogoPath,
				width: 928,
				height: 474,
				alt: `${AppName} logo`,
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		title: AppName,
		description: AppDescription,
		images: [AppMetaLogoPath],
	},
	other: {
		"msapplication-TileColor": "#ecf2ef",
		"msapplication-TileImage": "/logo/logo-150x150.png",
	},
};
