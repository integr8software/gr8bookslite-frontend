"use client";

import {
	AlertTriangle,
	Building2,
	Clock3,
	CircleDollarSign,
	Star,
} from "lucide-react";
import { formatMasterSubscriptionCurrency } from "@/app/src/data/master/subscriptions/MasterSubscriptionData";
import { useMasterSubscriptionsPage } from "@/app/src/hooks/master/subscriptions/useMasterSubscriptionsPage";
import {
	ModuleHeader,
} from "@/app/src/ui/shared/module/ModuleHeader";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";
import { MasterSubscriptionCompanyTable } from "@/app/src/ui/master/subscriptions/MasterSubscriptionCompanyTable";

export function MasterSubscriptionsPage() {
	const page = useMasterSubscriptionsPage();

	return (
		<section className="grid gap-5">
			<ModuleHeader
				variant="card"
				titleAs="h1"
				title="Subscription"
				description="Review each company subscription rating, duration, renewal timing, computed charges, and current billing status."
				eyebrow={
					<>
						<CircleDollarSign className="h-3.5 w-3.5" aria-hidden="true" />
						Subscriber Billing
					</>
				}
			/>

			<MasterSubscriptionSummaryCards summary={page.summary} />

			<MasterSubscriptionCompanyTable
				plansById={page.plansById}
				query={page.query}
				resetSubscriptionFilters={page.resetSubscriptionFilters}
				setQuery={page.setQuery}
				subscriptionQuotes={page.subscriptionQuotes}
				table={page.table}
			/>
		</section>
	);
}

function MasterSubscriptionSummaryCards({
	summary,
}: {
	summary: {
		activeSubscriptions: number;
		atRiskSubscriptions: number;
		averageDurationMonths: number;
		monthlyRevenue: number;
		subscribedCompanies: number;
	};
}) {
	const metrics = [
		{
			icon: Building2,
			label: "Subscribed Companies",
			tone: "bg-skyblue/12 text-darknavy",
			value: summary.subscribedCompanies,
		},
		{
			icon: Star,
			label: "Active Subscribers",
			tone: "bg-citron/35 text-darknavy",
			value: summary.activeSubscriptions,
		},
		{
			icon: Clock3,
			label: "Avg. Duration",
			tone: "bg-offwhite text-darknavy",
			value: `${summary.averageDurationMonths} mo.`,
		},
		{
			icon: AlertTriangle,
			label: "At Risk",
			tone: "bg-coralpink/12 text-coralpink",
			value: summary.atRiskSubscriptions,
		},
	];

	return (
		<div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
			{metrics.map((metric) => {
				const Icon = metric.icon;

				return (
					<article
						key={metric.label}
						className="rounded-lg border border-darknavy/10 bg-white p-4 shadow-sm"
					>
						<div className="flex items-center justify-between gap-3">
							<p className="text-sm font-medium text-darknavy/58">
								{metric.label}
							</p>
							<span
								className={joinClasses(
									"flex h-9 w-9 items-center justify-center rounded-lg",
									metric.tone,
								)}
							>
								<Icon className="h-4 w-4" aria-hidden="true" />
							</span>
						</div>
						<p className="mt-3 text-2xl font-semibold text-darknavy">
							{metric.value}
						</p>
					</article>
				);
			})}
			<article className="rounded-lg border border-darknavy/10 bg-darknavy p-4 text-white shadow-sm md:col-span-2 xl:col-span-4">
				<p className="text-sm font-semibold text-white/65">
					Computed Monthly Revenue
				</p>
				<p className="mt-2 text-2xl font-semibold">
					{formatMasterSubscriptionCurrency(summary.monthlyRevenue)}
				</p>
			</article>
		</div>
	);
}
