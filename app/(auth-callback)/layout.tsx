import type { ReactNode } from "react";

export default function AuthCallbackLayout({
	children,
}: {
	children: ReactNode;
}) {
	return (
		<div className="h-dvh overflow-hidden bg-white">
			{children}
		</div>
	);
}
