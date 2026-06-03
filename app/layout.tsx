import { AppToaster } from "@/app/src/ui/shared/app/AppToaster";
import { AppProviders } from "@/app/src/ui/shared/app/AppProviders";
import { AppMetadata } from "@/app/src/constants/shared/app/AppMetadata";
import "./globals.css";

export const metadata = AppMetadata;

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
