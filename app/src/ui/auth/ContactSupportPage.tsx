import {
	BookOpenCheck,
	Clock3,
	LifeBuoy,
	Mail,
	MessageSquareText,
	ShieldCheck,
} from "lucide-react";
import { AppName } from "@/app/src/constants/shared/app/AppConstants";
import {
	LegalDocumentLayout,
	LegalList,
	LegalListItem,
	LegalSection,
} from "@/app/src/ui/auth/LegalDocumentLayout";

const SupportEmail = "support@gr8booklite.com";

const SupportTopics = [
	{
		icon: BookOpenCheck,
		title: "Workspace help",
		text: "Questions about setup, company records, users, roles, or daily workflows.",
	},
	{
		icon: ShieldCheck,
		title: "Account and access",
		text: "Help with signing in, account recovery, permissions, or security concerns.",
	},
	{
		icon: MessageSquareText,
		title: "Billing and subscriptions",
		text: "Questions about plans, payments, invoices, trials, or subscription changes.",
	},
] as const;

export function ContactSupportPage() {
	return (
		<LegalDocumentLayout
			eyebrow="Support"
			title="How can we help?"
			description={`Tell us what’s happening and the ${AppName} support team will point you toward the right solution.`}
			headerIcon={<LifeBuoy className="h-6 w-6" />}
			meta={
				<>
					<Clock3 className="h-4 w-4 text-sky-700" />
					Typical response within one business day
				</>
			}
			ctaTitle="Ready to contact us?"
			ctaText="Include your account email, company name, and a short description. Screenshots are helpful too."
			ctaHref={`mailto:${SupportEmail}?subject=Gr8Books%20Neo%20Support%20Request`}
			ctaLabel="Send an email"
		>
			{SupportTopics.map((topic, index) => (
				<LegalSection
					key={topic.title}
					number={String(index + 1).padStart(2, "0")}
					title={topic.title}
				>
					<div className="flex gap-3">
						<div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-skyblue/10 text-sky-700">
							<topic.icon className="h-4 w-4" />
						</div>
						<p>{topic.text}</p>
					</div>
				</LegalSection>
			))}

			<LegalSection number="04" title="What to include in your request">
				<LegalList>
					<LegalListItem>Your account email and company or workspace name.</LegalListItem>
					<LegalListItem>A short description of what happened.</LegalListItem>
					<LegalListItem>The page or feature where you encountered the issue.</LegalListItem>
					<LegalListItem>Screenshots or error messages, when available.</LegalListItem>
				</LegalList>
			</LegalSection>

			<LegalSection number="05" title="Support email">
				<div className="flex items-center gap-3 rounded-xl bg-skyblue/10 p-4">
					<Mail className="h-5 w-5 shrink-0 text-sky-700" />
					<a
						href={`mailto:${SupportEmail}`}
						className="break-all font-bold text-sky-700 hover:underline"
					>
						{SupportEmail}
					</a>
				</div>
			</LegalSection>
		</LegalDocumentLayout>
	);
}
