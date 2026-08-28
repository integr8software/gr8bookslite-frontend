import { cookies } from "next/headers";
import { AppToaster } from "@/app/src/ui/shared/app/AppToaster";
import { AppProviders } from "@/app/src/ui/shared/app/AppProviders";
import { InitialAppTheme } from "@/app/src/ui/shared/app/InitialAppTheme";
import { AppMetadata } from "@/app/src/constants/shared/app/AppMetadata";
import { AccountThemeCookieName } from "@/app/src/constants/shared/account/AccountThemeRoutes";
import type { AccountTheme } from "@/app/src/types/shared/account/AccountTypes";
import "./globals.css";

export const metadata = AppMetadata;

function ResolveInitialTheme(theme: string | undefined): AccountTheme {
	return theme === "midnight-dark" ? "midnight-dark" : "classic-light";
}

export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const cookieStore = await cookies();
	const initialTheme = ResolveInitialTheme(
		cookieStore.get(AccountThemeCookieName)?.value,
	);

	return (
		<html
			lang="en"
			className="h-full antialiased"
			data-app-theme={initialTheme}
			data-scroll-behavior="smooth"
			suppressHydrationWarning
		>
			<body className="min-h-full flex flex-col">
				<InitialAppTheme />
				<AppProviders>
					{children}
					<AppToaster position="top-center" reverseOrder={false} />
				</AppProviders>
			</body>
		</html>
	);
}
