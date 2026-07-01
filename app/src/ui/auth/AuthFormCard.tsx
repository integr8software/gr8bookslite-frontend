import type { ReactNode } from "react";

export function AuthFormCard({
	title,
	description,
	children,
	wide = false,
}: Readonly<{
	title: string;
	description: string;
	children: ReactNode;
	wide?: boolean;
}>) {
	return (
		<div
			className={`w-full rounded-2xl border border-darknavy/10 bg-white p-6 shadow-[0_20px_60px_rgba(33,39,56,0.09)] sm:p-9 ${wide ? "max-w-2xl" : "max-w-lg"}`}
		>
			<div>
				<h1 className="text-3xl font-semibold tracking-[-0.035em] text-darknavy sm:text-4xl">
					{title}
				</h1>
				<p className="mt-3 text-sm leading-6 text-darknavy/60 sm:text-base">
					{description}
				</p>
			</div>
			{children}
		</div>
	);
}
