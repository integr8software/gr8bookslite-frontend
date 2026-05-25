import { Building2, CalendarClock, Users, WalletCards } from "lucide-react";
import { formatMasterCompanyCurrency } from "@/app/src/data/master/company-management/MasterCompanyManagementData";

type MasterCompanyManagementSummaryCardsProps = {
	activeUsers: number;
	monthlyRecurringRevenue: number;
	renewalRisks: number;
	subscribedCompanies: number;
	totalCompanies: number;
};

export function MasterCompanyManagementSummaryCards({
	activeUsers,
	monthlyRecurringRevenue,
	renewalRisks,
	subscribedCompanies,
	totalCompanies,
}: MasterCompanyManagementSummaryCardsProps) {
	const cards = [
		{
			icon: Building2,
			label: "Subscribed Companies",
			supportingText: `${subscribedCompanies} currently subscribed`,
			value: totalCompanies,
		},
		{
			icon: WalletCards,
			label: "Monthly Revenue",
			supportingText: "Active and trial subscriptions",
			value: formatMasterCompanyCurrency(monthlyRecurringRevenue),
		},
		{
			icon: Users,
			label: "Active Users",
			supportingText: "Across subscribed companies",
			value: activeUsers,
		},
		{
			icon: CalendarClock,
			label: "Renewal Watch",
			supportingText: "Trial or past-due companies",
			value: renewalRisks,
		},
	];

	return (
		<section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
			{cards.map((card) => {
				const Icon = card.icon;

				return (
					<article
						key={card.label}
						className="rounded-lg border border-darknavy/10 bg-white p-5 shadow-sm"
					>
						<div className="flex items-center justify-between gap-3">
							<span className="flex h-11 w-11 items-center justify-center rounded-lg bg-skyblue/15 text-darknavy">
								<Icon className="h-5 w-5" aria-hidden="true" />
							</span>
							<span className="rounded-md bg-darknavy/5 px-3 py-1.5 text-sm font-semibold text-darknavy/55">
								Master
							</span>
						</div>
						<p className="mt-4 text-sm font-medium text-darknavy/55">
							{card.label}
						</p>
						<p className="mt-1 text-2xl font-semibold text-darknavy">
							{card.value}
						</p>
						<p className="mt-2 text-sm text-darknavy/55">
							{card.supportingText}
						</p>
					</article>
				);
			})}
		</section>
	);
}
