import type { Metadata } from "next";
import { AppToaster } from "@/app/src/ui/shared/app/AppToaster";
import { AppProviders } from "@/app/src/ui/shared/app/AppProviders";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import "./globals.css";

export const metadata: Metadata = {
	title: AppName,
	description: `${AppName} frontend`,
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" className="h-full antialiased">
			<body className="min-h-full flex flex-col">
				<AppProviders>
					{children}
					<AppToaster position="top-center" reverseOrder={false} />
				</AppProviders>
			</body>
		</html>
	);
}
