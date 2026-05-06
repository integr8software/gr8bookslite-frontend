import { KeyRound } from "lucide-react";
import type { ReactNode } from "react";

type ForgotPasswordShellProps = {
	children: ReactNode;
};

export function ForgotPasswordShell({ children }: ForgotPasswordShellProps) {
	return (
		<main className="flex min-h-screen items-center justify-center bg-white px-4 py-8 text-darknavy sm:px-6">
			<section className="w-full max-w-140 rounded-md bg-white px-6 py-6 shadow-[0_18px_60px_rgba(33,39,56,0.14)] ring-1 ring-darknavy/8 sm:px-8">
				<div className="mb-4 flex justify-center">
					<div className="flex h-14 w-14 items-center justify-center rounded-full bg-darknavy text-offwhite">
						<KeyRound size={27} strokeWidth={2.5} aria-hidden="true" />
					</div>
				</div>

				<div className="mb-6 text-center">
					<h1 className="text-3xl font-semibold tracking-tight text-darknavy">
						Forgot Password?
					</h1>
					<p className="mt-3 text-sm leading-6 text-darknavy/80">
						No worries, we&apos;ll send you reset instructions
					</p>
				</div>

				{children}
			</section>
		</main>
	);
}
