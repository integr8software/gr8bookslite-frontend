import type { ReactNode } from "react";
import { AuthFormTransition } from "@/app/src/ui/auth/AuthFormTransition";

export function AuthPageShell({ children }: Readonly<{ children: ReactNode }>) {
	return (
		<main className="relative min-h-[calc(100vh-5rem)] overflow-hidden bg-offwhite text-darknavy">
			<div
				className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_12%,rgba(209,214,70,0.10),transparent_24%),radial-gradient(circle_at_86%_18%,rgba(87,196,229,0.16),transparent_28%)]"
				aria-hidden="true"
			/>
			<div
				className="pointer-events-none absolute inset-0 opacity-35 bg-[radial-gradient(rgba(33,39,56,0.12)_1px,transparent_1px)] bg-size-[24px_24px]"
				aria-hidden="true"
			/>
			<section className="relative flex min-h-[calc(100vh-5rem)] items-center justify-center px-5 py-10 sm:px-8">
				<AuthFormTransition>{children}</AuthFormTransition>
			</section>
		</main>
	);
}
