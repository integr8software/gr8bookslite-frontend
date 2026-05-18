import type { Metadata } from "next";
import { AppToaster } from "@/app/src/ui/shared/AppToaster";
import { AppProviders } from "@/app/src/ui/shared/AppProviders";
import "./globals.css";

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
			className="h-full antialiased"
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
