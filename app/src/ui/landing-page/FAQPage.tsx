import type { ReactNode } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import { LandingDocumentHeader } from "@/app/src/ui/shared/layout/DocumentHeader";

const FAQPage = () => {
	return (
		<main className="bg-white min-h-screen">
			<LandingDocumentHeader
				title="Frequently Asked Questions"
				lastUpdated="May 6, 2025"
			/>

			{/* Content */}
			<section className="mx-auto max-w-7xl bg-white px-5 py-10 text-black sm:px-8 lg:px-10">
				<p className="mb-6">
					Find quick answers to common questions about {AppName},
					account access, workspace management, accounting, inventory,
					and support.
				</p>

				<div className="divide-y divide-slate-200 rounded-xl border border-slate-200">
					<FAQItem question={`What is ${AppName}?`} open>
						{AppName} is a cloud-based accounting and inventory
						workspace that helps businesses manage transactions,
						stock, approvals, reports, and company records in one
						place.
					</FAQItem>

					<FAQItem question={`Who can use ${AppName}?`}>
						Business owners, accountants, inventory teams,
						approvers, and administrators can use the system.
						Available pages and actions depend on each user’s
						assigned role and permissions.
					</FAQItem>

					<FAQItem question="Can I manage accounting and inventory together?">
						Yes. {AppName} supports connected workflows for
						accounting, purchasing, sales, inventory, cash receipts,
						cash disbursements, maintenance records, and reporting.
					</FAQItem>

					<FAQItem question="Can I manage multiple companies or branches?">
						Yes. A workspace can be configured with company records,
						branches, users, and access controls so teams can manage
						different areas of the business with clear ownership.
					</FAQItem>

					<FAQItem question="Can administrators control user access?">
						Yes. Administrators can manage users, roles, branch
						access, approvals, and other permissions to help protect
						sensitive records and keep responsibilities organized.
					</FAQItem>

					<FAQItem question="Is my business information secure?">
						{AppName} uses account authentication, role-based
						access, and secure connections to help protect your
						information. You should also keep your password private
						and review user access regularly.
					</FAQItem>

					<FAQItem question="Can I change or cancel my subscription?">
						Subscription options depend on your current plan.
						Contact our team for help with upgrades, billing
						questions, payment records, or cancellation requests.
					</FAQItem>

					<FAQItem question="Where can I get additional help?">
						Visit our{" "}
						<Link
							href="/contact-us"
							className="font-medium text-blue-600 hover:underline"
						>
							Contact Us page
						</Link>{" "}
						or email{" "}
						<a
							href="mailto:support@gr8booklite.com"
							className="font-medium text-blue-600 hover:underline"
						>
							support@gr8booklite.com
						</a>
						. Include your account email, workspace name, and a
						clear description of your question or issue.
					</FAQItem>
				</div>
			</section>
		</main>
	);
};

function FAQItem({
	question,
	children,
	open = false,
}: Readonly<{
	question: string;
	children: ReactNode;
	open?: boolean;
}>) {
	return (
		<details
			className="group bg-white first:rounded-t-xl last:rounded-b-xl"
			open={open}
		>
			<summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-5 text-left font-semibold text-slate-950 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500 sm:px-6 [&::-webkit-details-marker]:hidden">
				<span>{question}</span>
				<ChevronDown
					className="h-5 w-5 shrink-0 text-slate-500 transition-transform duration-200 group-open:rotate-180"
					aria-hidden="true"
				/>
			</summary>
			<div className="px-5 pb-5 text-sm leading-7 text-slate-600 sm:px-6 sm:text-base">
				{children}
			</div>
		</details>
	);
}

export default FAQPage;
