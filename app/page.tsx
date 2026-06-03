import type { Metadata } from "next";
import Link from "next/link";
import {
	ArrowRight,
	BadgeCheck,
	BarChart3,
	Building2,
	Check,
	ClipboardCheck,
	FileText,
	PackageCheck,
	ReceiptText,
	ShieldCheck,
	Warehouse,
} from "lucide-react";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { LogoText } from "@/app/src/ui/shared/layout/LogoText";

export const metadata: Metadata = {
	title: `${AppName} | Accounting and Inventory SaaS`,
	description:
		"Accounting, inventory, purchasing, sales, approvals, and reporting in one clean SaaS workspace.",
};

const Benefits = [
	"Accounting and inventory in one operating view",
	"Approvals, audit trails, and role-based workspace control",
	"Reports that stay connected to day-to-day transactions",
] as const;

const Modules = [
	{ icon: ReceiptText, label: "Accounting" },
	{ icon: Warehouse, label: "Inventory" },
	{ icon: FileText, label: "Sales" },
	{ icon: ClipboardCheck, label: "Purchasing" },
	{ icon: BadgeCheck, label: "Approvals" },
	{ icon: BarChart3, label: "Reports" },
] as const;

const Highlights = [
	{
		icon: PackageCheck,
		title: "Inventory-aware books",
		text: "Stock movement, receiving, delivery, and valuation stay close to the financial records.",
	},
	{
		icon: ShieldCheck,
		title: "Controlled operations",
		text: "Users, branches, approvals, and audit trails help keep work accountable as the company grows.",
	},
	{
		icon: Building2,
		title: "Built for teams",
		text: "One SaaS workspace for companies that need practical accounting workflows without scattered files.",
	},
] as const;

const FooterGroups = [
	{
		title: "Product",
		links: [
			{ label: "Modules", href: "#modules" },
			{ label: "Why Gr8Books", href: "#why" },
			{ label: "Pricing", href: "/pricing" },
		],
	},
	{
		title: "Account",
		links: [
			{ label: "Log in", href: "/login" },
			{ label: "Create workspace", href: "/signup" },
			{ label: "Forgot password", href: "/forgot-password" },
		],
	},
	{
		title: "Legal",
		links: [
			{ label: "Privacy Policy", href: "/privacy-policy" },
			{ label: "Terms of Service", href: "/terms-of-service" },
		],
	},
] as const;

export default function Home() {
	return (
		<main className="min-h-screen bg-[#f6f9fc] text-slate-950">
			<header className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8 lg:px-10">
				<Link href="/" className="text-xl font-semibold">
					<LogoText brandSuffixClassName="text-sm" />
				</Link>
				<nav className="hidden items-center gap-7 text-sm font-semibold text-slate-600 md:flex">
					<a
						href="#modules"
						className="transition hover:text-sky-700"
					>
						Modules
					</a>
					<a href="#why" className="transition hover:text-sky-700">
						Why Gr8Books
					</a>
					<Link
						href="/pricing"
						className="transition hover:text-sky-700"
					>
						Pricing
					</Link>
				</nav>
				<div className="flex items-center gap-2">
					<Link
						href="/login"
						className="hidden rounded-md px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-white sm:inline-flex"
					>
						Log in
					</Link>
					<Link
						href="/signup"
						className="inline-flex min-h-10 items-center justify-center rounded-md bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-sky-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-200"
					>
						Start free
					</Link>
				</div>
			</header>

			<section className="relative overflow-hidden border-b border-slate-200">
				<HeroBackground />
				<div className="relative z-10 mx-auto max-w-7xl px-5 pb-20 pt-12 sm:px-8 lg:px-10 lg:pb-28 lg:pt-20">
					<p className="text-sm font-bold uppercase text-sky-700">
						Accounting + inventory SaaS
					</p>
					<h1 className="mt-5 max-w-4xl text-5xl font-semibold leading-[1.02] tracking-normal text-slate-950 sm:text-6xl lg:text-7xl">
						Clear books. Controlled stock. One workspace.
					</h1>
					<p className="mt-6 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
						Gr8Books Neo connects accounting, inventory, sales,
						purchasing, approvals, and reporting so your team can
						work from clean records instead of separate
						spreadsheets.
					</p>
					<ul className="mt-8 space-y-3 text-sm font-medium text-slate-700">
						{Benefits.map((benefit) => (
							<li
								key={benefit}
								className="flex items-center gap-3"
							>
								<Check
									className="h-5 w-5 text-sky-700"
									aria-hidden="true"
								/>
								{benefit}
							</li>
						))}
					</ul>
					<div className="mt-9 flex flex-col gap-3 sm:flex-row">
						<Link
							href="/signup"
							className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-slate-950 px-6 text-sm font-semibold text-white transition hover:bg-sky-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-200"
						>
							Create workspace
							<ArrowRight
								className="h-4 w-4"
								aria-hidden="true"
							/>
						</Link>
						<Link
							href="/pricing"
							className="inline-flex min-h-12 items-center justify-center rounded-md border border-slate-300 bg-white px-6 text-sm font-semibold text-slate-800 transition hover:border-sky-300 hover:text-sky-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-100"
						>
							See pricing
						</Link>
					</div>
				</div>
			</section>

			<section
				id="modules"
				className="border-y border-slate-200 bg-white px-5 py-16 sm:px-8 lg:px-10"
			>
				<div className="mx-auto max-w-7xl">
					<div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
						<div>
							<p className="text-sm font-bold uppercase text-sky-700">
								Core modules
							</p>
							<h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-normal text-slate-950 sm:text-4xl">
								The daily back-office work, connected.
							</h2>
						</div>
						<p className="max-w-2xl text-sm leading-6 text-slate-600 lg:justify-self-end">
							Use the accounting package alone, or add inventory
							when your operations need item, warehouse, and stock
							movement control.
						</p>
					</div>
					<div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
						{Modules.map((module) => (
							<article
								key={module.label}
								className="group rounded-lg border border-slate-200 bg-white p-6 transition hover:border-sky-200 hover:bg-sky-50"
							>
								<div className="flex h-11 w-11 items-center justify-center rounded-md bg-sky-50 text-sky-700 transition group-hover:bg-white">
									<module.icon
										className="h-5 w-5"
										aria-hidden="true"
									/>
								</div>
								<h3 className="mt-5 text-lg font-semibold text-slate-950">
									{module.label}
								</h3>
							</article>
						))}
					</div>
				</div>
			</section>

			<section id="why" className="px-5 py-16 sm:px-8 lg:px-10">
				<div className="mx-auto grid max-w-7xl gap-4 lg:grid-cols-3">
					{Highlights.map((item) => (
						<article
							key={item.title}
							className="rounded-lg bg-white p-7 ring-1 ring-slate-200"
						>
							<div className="flex h-11 w-11 items-center justify-center rounded-md bg-sky-50 text-sky-700">
								<item.icon
									className="h-5 w-5"
									aria-hidden="true"
								/>
							</div>
							<h3 className="mt-5 text-xl font-semibold text-slate-950">
								{item.title}
							</h3>
							<p className="mt-3 text-sm leading-6 text-slate-600">
								{item.text}
							</p>
						</article>
					))}
				</div>
			</section>

			<section className="px-5 pb-20 sm:px-8 lg:px-10">
				<div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 rounded-lg bg-white p-8 text-slate-950 ring-1 ring-slate-200 sm:p-10 lg:flex-row lg:items-center">
					<div>
						<h2 className="text-3xl font-semibold tracking-normal">
							Ready to organize your books and inventory?
						</h2>
						<p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
							Start with a clean workspace and choose the package
							that fits your company.
						</p>
					</div>
					<Link
						href="/signup"
						className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-slate-950 px-6 text-sm font-semibold text-white transition hover:bg-sky-700"
					>
						Get started
						<ArrowRight className="h-4 w-4" aria-hidden="true" />
					</Link>
				</div>
			</section>

			<footer className="border-t border-slate-200 bg-white px-5 py-12 sm:px-8 lg:px-10">
				<div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.2fr_1.8fr]">
					<div>
						<Link
							href="/"
							className="inline-flex text-xl font-semibold"
						>
							<LogoText brandSuffixClassName="text-sm" />
						</Link>
						<p className="mt-4 max-w-sm text-sm leading-6 text-slate-600">
							Accounting and inventory software for teams that
							need clean books, controlled stock, and practical
							reporting in one workspace.
						</p>
					</div>

					<div className="grid gap-8 sm:grid-cols-3">
						{FooterGroups.map((group) => (
							<div key={group.title}>
								<h2 className="text-sm font-semibold text-slate-950">
									{group.title}
								</h2>
								<ul className="mt-4 space-y-3 text-sm text-slate-600">
									{group.links.map((link) => (
										<li key={link.label}>
											<Link
												href={link.href}
												className="transition hover:text-sky-700"
											>
												{link.label}
											</Link>
										</li>
									))}
								</ul>
							</div>
						))}
					</div>
				</div>

				<div className="mx-auto mt-10 flex max-w-7xl flex-col gap-3 border-t border-slate-200 pt-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
					<p>
						&copy; {new Date().getFullYear()} Gr8Books Neo. All
						rights reserved.
					</p>
					<p>
						Built for accounting, inventory, and growing operations.
					</p>
				</div>
			</footer>
		</main>
	);
}

function HeroBackground() {
	return (
		<div className="pointer-events-none absolute inset-0" aria-hidden="true">
			<div className="absolute inset-0 bg-[radial-gradient(circle_at_74%_24%,rgba(14,165,233,0.16),transparent_28%),radial-gradient(circle_at_90%_72%,rgba(34,211,238,0.12),transparent_25%)]" />
			<div className="landing-hero-grid absolute inset-0" />
			<div className="landing-3d-stage absolute right-[8%] top-[13%] hidden h-[30rem] w-[34rem] lg:block">
				<div className="landing-3d-plane landing-3d-plane-a" />
				<div className="landing-3d-plane landing-3d-plane-b" />
				<div className="landing-3d-plane landing-3d-plane-c" />
				<div className="landing-3d-cube landing-3d-cube-a" />
				<div className="landing-3d-cube landing-3d-cube-b" />
				<div className="landing-3d-cube landing-3d-cube-c" />
			</div>
		</div>
	);
}
