import { CircleHelp, HelpCircle } from "lucide-react";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import {
	LegalDocumentLayout,
	LegalSection,
} from "@/app/src/ui/auth/LegalDocumentLayout";

const FaqItems = [
	{
		question: `What is ${AppName}?`,
		answer: `${AppName} is a cloud-based accounting and inventory workspace for managing transactions, stock, approvals, reports, and company records in one place.`,
	},
	{
		question: "Who can use the system?",
		answer: "Business owners, accounting teams, inventory staff, approvers, and administrators can use the system depending on the roles and permissions assigned in their workspace.",
	},
	{
		question: "Can I manage multiple branches or companies?",
		answer: "Yes. Workspaces can be configured for company records, branches, users, and access controls so teams can manage operations with clear ownership.",
	},
	{
		question: "Does it support accounting and inventory together?",
		answer: "Yes. The platform includes workflows for accounting, purchasing, sales, inventory, cash receipts, cash disbursements, maintenance records, and reporting.",
	},
	{
		question: "Can user access be controlled?",
		answer: "Yes. Administrators can manage users, roles, approvals, and audit-related settings to help keep transactions and records accountable.",
	},
	{
		question: "Where can I get help with my account?",
		answer: "For account, billing, or workspace concerns, visit the Contact Support page and send the details to our support team.",
	},
] as const;

export function FAQPage() {
	return (
		<LegalDocumentLayout
			eyebrow="Help center"
			title="Frequently Asked Questions"
			description={`Quick answers about using ${AppName}, managing records, and working with your accounting and inventory workspace.`}
			headerIcon={<CircleHelp className="h-6 w-6" />}
			meta={
				<>
					<HelpCircle className="h-4 w-4 text-sky-700" />
					{FaqItems.length} common questions
				</>
			}
			ctaTitle="Still need help?"
			ctaText="Send our support team the details and we’ll help with your account, billing, or workspace concern."
			ctaLabel="Contact support"
		>
			{FaqItems.map((item, index) => (
				<LegalSection
					key={item.question}
					number={String(index + 1).padStart(2, "0")}
					title={item.question}
				>
					<p>{item.answer}</p>
				</LegalSection>
			))}
		</LegalDocumentLayout>
	);
}
