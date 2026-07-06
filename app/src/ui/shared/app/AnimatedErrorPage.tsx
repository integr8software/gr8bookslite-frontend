"use client";

import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { Home, RefreshCw, ShieldAlert } from "lucide-react";
import Link from "next/link";
import type { ComponentType } from "react";

export type AnimatedErrorPageVariant = "403" | "404" | "500";

type AnimatedErrorPageIcon = ComponentType<{
	className?: string;
	"aria-hidden"?: true;
}>;

type AnimatedErrorPageContent = {
	animationLabel: string;
	code: string;
	helper: string;
	primaryHref: string;
	primaryIcon: AnimatedErrorPageIcon;
	primaryLabel: string;
	secondaryHref?: string;
	secondaryIcon?: AnimatedErrorPageIcon;
	secondaryLabel?: string;
	title: string;
};

const errorAnimationSrc =
	"https://lottie.host/9d83f996-c688-41ba-88e4-43a6da080b99/n24TDsEob8.lottie";

const animatedErrorPageContent: Record<
	AnimatedErrorPageVariant,
	AnimatedErrorPageContent
> = {
	"403": {
		animationLabel: "403 forbidden access animation",
		code: "403",
		helper:
			"Your account is signed in, but it does not have permission for this area. Ask an administrator to review your role or branch access.",
		primaryHref: "/dashboard",
		primaryIcon: Home,
		primaryLabel: "Back to Dashboard",
		secondaryHref: "mailto:legal@gr8booklite.com",
		secondaryIcon: ShieldAlert,
		secondaryLabel: "Request Access",
		title: "This page is outside your access.",
	},
	"404": {
		animationLabel: "404 page not found animation",
		code: "404",
		helper:
			"The route you opened does not exist, or it may have moved while the workspace was updating.",
		primaryHref: "/",
		primaryIcon: Home,
		primaryLabel: "Return Home",
		title: "This page needs a quick repair.",
	},
	"500": {
		animationLabel: "500 server error animation",
		code: "500",
		helper:
			"The request reached the app, but something failed while preparing the page. Try again from the dashboard or contact support.",
		primaryHref: "/dashboard",
		primaryIcon: RefreshCw,
		primaryLabel: "Try from Dashboard",
		secondaryHref: "mailto:legal@gr8booklite.com",
		secondaryIcon: ShieldAlert,
		secondaryLabel: "Contact Support",
		title: "We hit a server problem.",
	},
};

export type AnimatedErrorPageProps = {
	variant: AnimatedErrorPageVariant;
};

export function AnimatedErrorPage({ variant }: AnimatedErrorPageProps) {
	const content = animatedErrorPageContent[variant];
	const PrimaryIcon = content.primaryIcon;
	const SecondaryIcon = content.secondaryIcon;

	return (
		<main className="fixed inset-0 isolate flex h-dvh w-screen items-center justify-center overflow-hidden bg-[#f7fbff] px-6 py-8 text-[#132d35]">
			<div className="absolute inset-0 -z-20 bg-[linear-gradient(rgba(0,124,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(0,124,255,0.06)_1px,transparent_1px)] bg-size-[44px_44px]" />
			<div className="absolute inset-x-0 top-0 -z-10 h-44 bg-[linear-gradient(180deg,rgba(0,124,255,0.13),rgba(247,251,255,0))]" />
			<div className="absolute -left-20 top-16 -z-10 h-48 w-48 rotate-12 border-28 border-[#007CFF]/10" />
			<div className="absolute -right-16 bottom-10 -z-10 h-56 w-56 -rotate-12 border-32 border-[#13b981]/10" />
			<div className="absolute left-8 top-8 hidden h-18 w-18 border-l-4 border-t-4 border-[#007CFF]/35 md:block" />
			<div className="absolute bottom-8 right-8 hidden h-18 w-18 border-b-4 border-r-4 border-[#ffb400]/45 md:block" />

			<section className="flex w-full max-w-5xl flex-col items-center text-center">
				<p
					className="error-code-glitch text-[clamp(3.75rem,13vw,8.5rem)] font-black leading-none text-[#132d35] drop-shadow-[0_18px_34px_rgba(19,45,53,0.12)]"
					data-code={content.code}
				>
					{content.code}
				</p>

				<div
					aria-label={content.animationLabel}
					className="h-[min(42dvh,430px)] w-[min(84vw,540px)] drop-shadow-[0_22px_45px_rgba(19,45,53,0.12)]"
				>
					<DotLottieReact
						src={errorAnimationSrc}
						loop
						autoplay
						className="h-full w-full"
					/>
				</div>

				<h1 className="text-3xl font-bold text-[#132d35] sm:text-4xl">
					{content.title}
				</h1>

				<p className="mt-3 max-w-xl text-sm leading-6 text-[#51656b] sm:text-base">
					{content.helper}
				</p>

				<div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
					<Link
						href={content.primaryHref}
						className="group relative inline-flex items-center gap-2.5 rounded-xl bg-[#007CFF] px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:bg-[#0066dd] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#007CFF] focus:ring-offset-2 active:translate-y-0"
					>
						<span className="pointer-events-none absolute -left-4 -top-4 -z-10 opacity-30 transition-opacity group-hover:opacity-60">
							<svg
								viewBox="0 0 24 24"
								fill="#007CFF"
								className="h-8 w-8 animate-spin [animation-duration:4s]"
								aria-hidden
							>
								<path d="M19.14 12.94c.04-.3.06-.61.06-.94s-.02-.64-.07-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.49.49 0 0 0-.59-.22l-2.39.96a7 7 0 0 0-1.62-.94l-.36-2.54a.48.48 0 0 0-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54a7.4 7.4 0 0 0-1.62.94l-2.39-.96a.48.48 0 0 0-.59.22L2.74 8.87a.47.47 0 0 0 .12.61l2.03 1.58c-.05.3-.07.62-.07.94s.02.64.07.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.36 1.04.67 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54a7.4 7.4 0 0 0 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32a.47.47 0 0 0-.12-.61l-2.01-1.58zM12 15.6A3.6 3.6 0 1 1 12 8.4a3.6 3.6 0 0 1 0 7.2z" />
							</svg>
						</span>
						<span className="pointer-events-none absolute -bottom-4 -right-5 -z-10 opacity-20 transition-opacity group-hover:opacity-50">
							<svg
								viewBox="0 0 24 24"
								fill="#007CFF"
								className="h-10 w-10 animate-spin [animation-duration:6s] [animation-direction:reverse]"
								aria-hidden
							>
								<path d="M19.14 12.94c.04-.3.06-.61.06-.94s-.02-.64-.07-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.49.49 0 0 0-.59-.22l-2.39.96a7 7 0 0 0-1.62-.94l-.36-2.54a.48.48 0 0 0-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54a7.4 7.4 0 0 0-1.62.94l-2.39-.96a.48.48 0 0 0-.59.22L2.74 8.87a.47.47 0 0 0 .12.61l2.03 1.58c-.05.3-.07.62-.07.94s.02.64.07.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.36 1.04.67 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54a7.4 7.4 0 0 0 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32a.47.47 0 0 0-.12-.61l-2.01-1.58zM12 15.6A3.6 3.6 0 1 1 12 8.4a3.6 3.6 0 0 1 0 7.2z" />
							</svg>
						</span>
						<PrimaryIcon className="h-4 w-4 shrink-0" aria-hidden />
						{content.primaryLabel}
					</Link>

					{content.secondaryHref && SecondaryIcon ? (
						<Link
							href={content.secondaryHref}
							className="inline-flex items-center gap-2.5 rounded-xl border border-[#132d35]/10 bg-white px-6 py-3 text-sm font-semibold text-[#132d35] shadow-md transition hover:-translate-y-0.5 hover:border-[#132d35]/20 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#007CFF] focus:ring-offset-2 active:translate-y-0"
						>
							<SecondaryIcon
								className="h-4 w-4 shrink-0"
								aria-hidden
							/>
							{content.secondaryLabel}
						</Link>
					) : null}
				</div>
			</section>
		</main>
	);
}
