import Link from "next/link";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import {
	ArrowLeft,
	Home,
	KeyRound,
	RefreshCw,
	ServerCrash,
	ShieldAlert,
	type LucideIcon,
} from "lucide-react";

export type StatusErrorPageVariant = "401" | "403" | "500";

type StatusErrorPageContent = {
	accentClassName: string;
	eyebrow: string;
	helper: string;
	icon: LucideIcon;
	primaryHref: string;
	primaryIcon: LucideIcon;
	primaryLabel: string;
	secondaryHref: string;
	secondaryIcon: LucideIcon;
	secondaryLabel: string;
	status: string;
	summary: string;
	title: string;
};

const statusErrorPageContent: Record<
	StatusErrorPageVariant,
	StatusErrorPageContent
> = {
	"401": {
		accentClassName: "bg-skyblue",
		eyebrow: "Unauthorized access",
		helper: "Your sign-in may have expired, or this page needs a valid session before it can open.",
		icon: KeyRound,
		primaryHref: "/login",
		primaryIcon: KeyRound,
		primaryLabel: "Sign in again",
		secondaryHref: "/",
		secondaryIcon: Home,
		secondaryLabel: "Return home",
		status: "401",
		summary: "We could not verify your access to this workspace.",
		title: "Please sign in to continue.",
	},
	"403": {
		accentClassName: "bg-citron",
		eyebrow: "Forbidden",
		helper: "If this should be available to you, ask an administrator to review your role or branch access.",
		icon: ShieldAlert,
		primaryHref: "/dashboard",
		primaryIcon: ArrowLeft,
		primaryLabel: "Back to dashboard",
		secondaryHref: "mailto:legal@gr8booklite.com",
		secondaryIcon: ShieldAlert,
		secondaryLabel: "Request access",
		status: "403",
		summary:
			"Your account is signed in, but it does not have permission for this area.",
		title: "This page is outside your access.",
	},
	"500": {
		accentClassName: "bg-coralpink",
		eyebrow: "Server error",
		helper: `The request reached ${AppName}, but something failed while preparing the page.`,
		icon: ServerCrash,
		primaryHref: "/dashboard",
		primaryIcon: RefreshCw,
		primaryLabel: "Try from dashboard",
		secondaryHref: "mailto:legal@gr8booklite.com",
		secondaryIcon: ShieldAlert,
		secondaryLabel: "Contact us",
		status: "500",
		summary: "Something went wrong on our side.",
		title: "We hit a server problem.",
	},
};

export type StatusErrorPageProps = {
	variant: StatusErrorPageVariant;
};

export function StatusErrorPage({ variant }: StatusErrorPageProps) {
	const content = statusErrorPageContent[variant];
	const Icon = content.icon;
	const PrimaryIcon = content.primaryIcon;
	const SecondaryIcon = content.secondaryIcon;

	return (
		<main className="flex min-h-dvh items-center justify-center overflow-hidden bg-offwhite px-5 py-10 text-darknavy sm:px-8">
			<section className="relative flex w-full max-w-5xl flex-col items-center gap-9 text-center lg:grid lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:text-left">
				<div className="relative flex aspect-square w-full max-w-82.5 items-center justify-center sm:max-w-97.5 lg:mx-auto">
					<div className="absolute inset-7 rounded-full border border-darknavy/10 bg-white/70 shadow-[0_24px_70px_rgba(33,39,56,0.12)]" />
					<div className="absolute left-[17%] top-[22%] h-[33%] w-[52%] rotate-[-10deg] rounded-md border border-darknavy/10 bg-white shadow-[0_16px_40px_rgba(33,39,56,0.12)]" />
					<div className="absolute bottom-[24%] right-[15%] h-[35%] w-[52%] rotate-[8deg] rounded-md border border-darknavy/10 bg-white shadow-[0_16px_40px_rgba(33,39,56,0.10)]" />
					<div className="relative z-10 flex h-[48%] w-[48%] items-center justify-center rounded-full border border-darknavy/10 bg-white shadow-[0_18px_45px_rgba(33,39,56,0.14)]">
						<div
							className={`absolute -right-2 top-3 h-6 w-6 rounded-full ${content.accentClassName}`}
						/>
						<Icon
							className="h-[42%] w-[42%] text-darknavy"
							strokeWidth={1.8}
							aria-hidden="true"
						/>
					</div>
					<div
						className={`absolute bottom-[18%] left-[18%] h-3 w-[44%] rounded-full ${content.accentClassName}`}
					/>
					<div className="absolute bottom-[13%] left-[27%] h-2 w-[38%] rounded-full bg-darknavy/10" />
				</div>

				<div className="w-full max-w-xl">
					<p className="text-xs font-bold uppercase tracking-[0.28em] text-darknavy/55">
						{content.eyebrow}
					</p>
					<div className="mt-4 flex flex-col items-center gap-4 lg:items-start">
						<span className="text-[clamp(4.75rem,16vw,8rem)] font-black leading-none text-darknavy">
							{content.status}
						</span>
						<div>
							<h1 className="text-[clamp(2rem,5vw,4.25rem)] font-black leading-[0.95] tracking-normal">
								{content.title}
							</h1>
							<p className="mt-5 text-base font-semibold leading-7 text-darknavy/75 sm:text-lg">
								{content.summary}
							</p>
							<p className="mt-3 text-sm leading-6 text-darknavy/55 sm:text-base">
								{content.helper}
							</p>
						</div>
					</div>

					<div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
						<Link
							href={content.primaryHref}
							className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-darknavy px-5 py-3 text-sm font-bold text-white shadow-[0_16px_35px_rgba(33,39,56,0.20)] transition hover:-translate-y-0.5 hover:bg-darknavy/90 focus:outline-none focus:ring-2 focus:ring-skyblue focus:ring-offset-2 focus:ring-offset-offwhite"
						>
							<PrimaryIcon
								className="h-4 w-4"
								aria-hidden="true"
							/>
							{content.primaryLabel}
						</Link>
						<Link
							href={content.secondaryHref}
							className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-darknavy/15 bg-white px-5 py-3 text-sm font-bold text-darknavy shadow-[0_10px_24px_rgba(33,39,56,0.08)] transition hover:-translate-y-0.5 hover:border-darknavy/25 focus:outline-none focus:ring-2 focus:ring-skyblue focus:ring-offset-2 focus:ring-offset-offwhite"
						>
							<SecondaryIcon
								className="h-4 w-4"
								aria-hidden="true"
							/>
							{content.secondaryLabel}
						</Link>
					</div>
				</div>
			</section>
		</main>
	);
}
