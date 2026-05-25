import { Edit3 } from "lucide-react";
import {
	MasterSubscriptionUnitShortLabels,
} from "@/app/src/constants/master/subscriptions/MasterSubscriptionConstants";
import {
	formatMasterSubscriptionCurrency,
	formatMasterSubscriptionDate,
} from "@/app/src/data/master/subscriptions/MasterSubscriptionData";
import type {
	MasterSubscriptionCompanyRecord,
	MasterSubscriptionCompanyStatus,
	MasterSubscriptionPlanRecord,
	MasterSubscriptionQuote,
} from "@/app/src/types/master/subscriptions/MasterSubscriptionTypes";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";

type MasterSubscriptionTableRowProps = {
	plan: MasterSubscriptionPlanRecord | undefined;
	quote: MasterSubscriptionQuote | undefined;
	subscription: MasterSubscriptionCompanyRecord;
};

export function MasterSubscriptionTableRow({
	plan,
	quote,
	subscription,
}: MasterSubscriptionTableRowProps) {
	return (
		<tr className="module-table-row">
			<td className="px-4 py-4">
				<div className="min-w-0">
					<p className="truncate text-sm font-semibold text-darknavy">
						{subscription.name}
					</p>
					<p className="mt-1 truncate text-sm text-darknavy/50">
						{subscription.ownerName}
					</p>
				</div>
			</td>
			<td className="px-4 py-4">
				<MasterSubscriptionStatusBadge status={subscription.status} />
			</td>
			<td className="px-4 py-4">
				<div className="min-w-0">
					<p className="truncate text-sm font-semibold text-darknavy">
						{plan?.name ?? "Unassigned"}
					</p>
					<p className="mt-1 text-xs font-semibold uppercase tracking-wide text-darknavy/42">
						{plan?.code ?? "No plan"}
					</p>
				</div>
			</td>
			<td className="px-4 py-4">
				<span className="rounded-md bg-offwhite px-2.5 py-1 text-xs font-semibold text-darknavy/65 ring-1 ring-darknavy/10">
					{subscription.billingCycle}
				</span>
			</td>
			<td className="px-4 py-4 text-sm font-semibold text-darknavy">
				{subscription.companyCount}
			</td>
			<td className="px-4 py-4 text-sm font-semibold text-darknavy">
				{subscription.branchCount}
			</td>
			<td className="px-4 py-4 text-sm font-semibold text-darknavy">
				{subscription.userCount}
			</td>
			<td className="px-4 py-4">
				<div className="min-w-0">
					<p className="text-sm font-semibold text-darknavy">
						{formatMasterSubscriptionCurrency(quote?.total ?? 0)}
					</p>
					<p className="mt-1 text-xs text-darknavy/45">
						{quote?.unitQuotes
							.filter((unitQuote) => unitQuote.extraCount > 0)
							.map(
								(unitQuote) =>
									`${unitQuote.extraCount} ${MasterSubscriptionUnitShortLabels[unitQuote.unit].toLowerCase()}`,
							)
							.join(", ") || "No overage"}
					</p>
				</div>
			</td>
			<td className="px-4 py-4 text-sm text-darknavy/65">
				{formatMasterSubscriptionDate(subscription.renewalDate)}
			</td>
			<td className="px-4 py-4">
				<div className="flex items-center justify-center">
					<button
						type="button"
						aria-label={`Edit ${subscription.name} subscription`}
						className="flex h-10 w-10 items-center justify-center rounded-lg text-darknavy/65 transition hover:bg-skyblue/10 hover:text-darknavy focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-skyblue/15"
					>
						<Edit3 className="h-4 w-4" aria-hidden="true" />
					</button>
				</div>
			</td>
		</tr>
	);
}

function MasterSubscriptionStatusBadge({
	status,
}: {
	status: MasterSubscriptionCompanyStatus;
}) {
	const classes = {
		Active: "bg-citron/30 text-darknavy ring-citron/45",
		"Past Due": "bg-coralpink/12 text-coralpink ring-coralpink/20",
		Scheduled: "bg-skyblue/12 text-darknavy ring-skyblue/22",
		Trial: "bg-offwhite text-darknavy/70 ring-darknavy/10",
	} satisfies Record<MasterSubscriptionCompanyStatus, string>;

	return (
		<span
			className={joinClasses(
				"inline-flex rounded-md px-2.5 py-1 text-xs font-semibold ring-1",
				classes[status],
			)}
		>
			{status}
		</span>
	);
}
