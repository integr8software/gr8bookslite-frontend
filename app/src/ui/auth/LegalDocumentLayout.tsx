import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, CalendarDays, FileText } from "lucide-react";

export function LegalDocumentLayout({
	eyebrow,
	title,
	description,
	headerIcon,
	meta,
	ctaTitle = "Need clarification?",
	ctaText = "Our support team can help with questions about these policies.",
	ctaHref = "/contact-support",
	ctaLabel = "Contact support",
	children,
}: Readonly<{
	eyebrow: string;
	title: string;
	description: string;
	headerIcon?: ReactNode;
	meta?: ReactNode;
	ctaTitle?: string;
	ctaText?: string;
	ctaHref?: string;
	ctaLabel?: string;
	children: ReactNode;
}>) {
	const ctaClassName =
		"inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-lg bg-white px-5 text-sm font-semibold text-darknavy transition hover:bg-sky-50";
	const ctaContent = (
		<>
			{ctaLabel}
			<ArrowRight className="h-4 w-4" />
		</>
	);

	return (
		<main className="min-h-[calc(100vh-4.5rem)] bg-offwhite text-darknavy">
			<header className="relative overflow-hidden border-b border-darknavy/10 bg-white">
				<div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_78%_18%,rgba(87,196,229,0.18),transparent_30%),radial-gradient(circle_at_10%_70%,rgba(209,214,70,0.10),transparent_25%)]" />
				<div className="pointer-events-none absolute inset-0 opacity-40 [background-image:radial-gradient(rgba(33,39,56,0.12)_1px,transparent_1px)] [background-size:24px_24px]" />
				<div className="relative mx-auto max-w-5xl px-6 py-16 sm:py-20">
					<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-skyblue/10 text-sky-700">
						{headerIcon ?? <FileText className="h-6 w-6" />}
					</div>
					<p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-sky-700">
						{eyebrow}
					</p>
					<h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-[-0.045em] text-darknavy sm:text-5xl">
						{title}
					</h1>
					<p className="mt-5 max-w-2xl text-sm leading-7 text-darknavy/60 sm:text-base">
						{description}
					</p>
					<div className="mt-6 inline-flex items-center gap-2 rounded-full border border-darknavy/10 bg-white/85 px-4 py-2 text-xs font-semibold text-darknavy/60 shadow-sm">
						{meta ?? (
							<>
								<CalendarDays className="h-4 w-4 text-sky-700" />
								Effective May 6, 2025 · Updated May 6, 2025
							</>
						)}
					</div>
				</div>
			</header>

			<section className="mx-auto max-w-5xl px-6 py-12 sm:py-16">
				<div className="mx-auto max-w-3xl space-y-4">{children}</div>

				<div className="mx-auto mt-10 flex max-w-3xl flex-col gap-4 rounded-2xl bg-darknavy p-6 text-white shadow-[0_20px_60px_rgba(33,39,56,0.18)] sm:flex-row sm:items-center sm:justify-between sm:p-8">
					<div>
						<h2 className="text-lg font-semibold">{ctaTitle}</h2>
						<p className="mt-2 text-sm leading-6 text-white/65">
							{ctaText}
						</p>
					</div>
					{ctaHref.startsWith("mailto:") ? (
						<a href={ctaHref} className={ctaClassName}>
							{ctaContent}
						</a>
					) : (
						<Link href={ctaHref} className={ctaClassName}>
							{ctaContent}
						</Link>
					)}
				</div>
			</section>
		</main>
	);
}

export function LegalSection({
	number,
	title,
	children,
}: Readonly<{
	number: string;
	title: string;
	children: ReactNode;
}>) {
	return (
		<article className="rounded-2xl border border-darknavy/10 bg-white p-5 shadow-[0_10px_32px_rgba(33,39,56,0.05)] sm:p-7">
			<div className="flex items-start gap-4">
				<span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-skyblue/10 text-xs font-bold text-sky-700">
					{number}
				</span>
				<div className="min-w-0 flex-1">
					<h2 className="text-lg font-bold text-darknavy">{title}</h2>
					<div className="mt-3 space-y-3 text-sm leading-7 text-darknavy/62">
						{children}
					</div>
				</div>
			</div>
		</article>
	);
}

export function LegalList({ children }: Readonly<{ children: ReactNode }>) {
	return (
		<ul className="space-y-2 pl-1">
			{children}
		</ul>
	);
}

export function LegalListItem({ children }: Readonly<{ children: ReactNode }>) {
	return (
		<li className="flex gap-3">
			<span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-skyblue" />
			<span>{children}</span>
		</li>
	);
}
