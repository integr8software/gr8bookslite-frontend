import Link from "next/link";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";

const FaqItems = [
	{
		question: `What is ${AppName}?`,
		answer:
			`${AppName} is a cloud-based accounting and inventory workspace for managing transactions, stock, approvals, reports, and company records in one place.`,
	},
	{
		question: "Who can use the system?",
		answer:
			"Business owners, accounting teams, inventory staff, approvers, and administrators can use the system depending on the roles and permissions assigned in their workspace.",
	},
	{
		question: "Can I manage multiple branches or companies?",
		answer:
			"Yes. Workspaces can be configured for company records, branches, users, and access controls so teams can manage operations with clear ownership.",
	},
	{
		question: "Does it support accounting and inventory together?",
		answer:
			"Yes. The platform includes workflows for accounting, purchasing, sales, inventory, cash receipts, cash disbursements, maintenance records, and reporting.",
	},
	{
		question: "Can user access be controlled?",
		answer:
			"Yes. Administrators can manage users, roles, approvals, and audit-related settings to help keep transactions and records accountable.",
	},
	{
		question: "Where can I get help with my account?",
		answer:
			"For account, billing, or workspace concerns, contact support through your workspace support channels or reach out to the team managing your subscription.",
	},
] as const;

export function FAQPage() {
	return (
		<main className="min-h-screen bg-offwhite text-darknavy">
			<header className="border-b border-darknavy/10 bg-white">
				<div className="mx-auto max-w-5xl px-6 py-14">
					<p className="text-sm font-bold uppercase text-skyblue">
						Help center
					</p>
					<h1 className="mt-3 text-4xl font-bold tracking-normal text-darknavy sm:text-5xl">
						Frequently Asked Questions
					</h1>
					<p className="mt-4 max-w-2xl text-sm leading-6 text-darknavy/65 sm:text-base">
						Quick answers about using {AppName}, managing records,
						and working with your accounting and inventory workspace.
					</p>
				</div>
			</header>

			<section className="mx-auto grid max-w-5xl gap-4 px-6 py-10">
				{FaqItems.map((item) => (
					<article
						key={item.question}
						className="rounded-lg border border-darknavy/10 bg-white p-5 shadow-sm shadow-darknavy/5"
					>
						<h2 className="text-base font-semibold text-darknavy">
							{item.question}
						</h2>
						<p className="mt-2 text-sm leading-6 text-darknavy/65">
							{item.answer}
						</p>
					</article>
				))}
			</section>

			<section className="mx-auto max-w-5xl px-6 pb-12">
				<div className="rounded-lg border border-darknavy/10 bg-white p-5 shadow-sm shadow-darknavy/5">
					<h2 className="text-base font-semibold text-darknavy">
						Still need help?
					</h2>
					<p className="mt-2 text-sm leading-6 text-darknavy/65">
						Visit your workspace support area or review the legal
						pages for service, privacy, and usage details.
					</p>
					<div className="mt-4 flex flex-wrap gap-2">
						<Link
							href="/terms-of-service"
							className="inline-flex h-10 items-center rounded-md border border-darknavy/10 bg-white px-4 text-sm font-semibold text-darknavy transition hover:bg-darknavy/5"
						>
							Terms of Service
						</Link>
						<Link
							href="/privacy-policy"
							className="inline-flex h-10 items-center rounded-md bg-skyblue px-4 text-sm font-semibold text-white transition hover:bg-skyblue/85"
						>
							Privacy Policy
						</Link>
					</div>
				</div>
			</section>
		</main>
	);
}
