import Link from "next/link";
import type { ReactNode } from "react";

type AuthShellProps = {
	title: string;
	subtitle: string;
	children: ReactNode;
	footer: {
		label: string;
		href: string;
		action: string;
	};
};

export function AuthShell({
	title,
	subtitle,
	children,
	footer,
}: AuthShellProps) {
	return (
		<main className="flex min-h-screen items-center justify-center bg-offwhite px-5 py-10 text-darknavy">
			<section className="grid w-full max-w-5xl overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-darknavy/10 md:grid-cols-[0.9fr_1.1fr]">
				<div className="flex min-h-80 flex-col justify-between bg-darknavy p-8 text-offwhite">
					<div>
						<p className="text-sm font-semibold uppercase tracking-[0.18em] text-skyblue">
							GR8BooksLite
						</p>
						<h1 className="mt-8 max-w-sm text-3xl font-semibold leading-tight"></h1>
					</div>
					<div className="flex gap-2" aria-hidden="true">
						<span className="h-3 w-10 rounded-full bg-coralpink" />
						<span className="h-3 w-10 rounded-full bg-citron" />
						<span className="h-3 w-10 rounded-full bg-skyblue" />
					</div>
				</div>

				<div className="p-6 sm:p-10">
					<div className="mb-8">
						<h2 className="text-2xl font-semibold text-darknavy">
							{title}
						</h2>
						<p className="mt-2 text-sm leading-6 text-darknavy/70">
							{subtitle}
						</p>
					</div>

					{children}

					<p className="mt-8 text-sm text-darknavy/70">
						{footer.label}{" "}
						<Link
							href={footer.href}
							className="font-semibold text-darknavy underline decoration-skyblue decoration-2 underline-offset-4 hover:text-skyblue"
						>
							{footer.action}
						</Link>
					</p>
				</div>
			</section>
		</main>
	);
}
