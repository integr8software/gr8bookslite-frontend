import type { ReactNode } from "react";
import { ViewTransition } from "react";

export default function RootTemplate({ children }: Readonly<{ children: ReactNode }>) {
	return (
		<ViewTransition
			enter={{
				"auth-forward": "auth-forward",
				"auth-back": "auth-back",
				default: "none",
			}}
			exit={{
				"auth-forward": "auth-forward",
				"auth-back": "auth-back",
				default: "none",
			}}
			default="none"
		>
			{children}
		</ViewTransition>
	);
}
