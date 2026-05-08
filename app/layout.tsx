import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AppToaster } from "@/app/src/ui/shared/AppToaster";
import { AppProviders } from "@/app/src/ui/shared/AppProviders";
import "./globals.css";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "GR8BooksLite",
	description: "GR8BooksLite frontend",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html
			lang="en"
			className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
		>
			<body className="min-h-full flex flex-col">
				<AppProviders>
					{children}
					<AppToaster position="top-right" reverseOrder={false} />
				</AppProviders>
			</body>
		</html>
	);
}
