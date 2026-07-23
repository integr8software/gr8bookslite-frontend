"use client";

import { useMemo } from "react";
import { CheckCircle2, CirclePause, Landmark, ReceiptText } from "lucide-react";
import type { TaxMaintenanceStatisticCardsProps } from "@/app/src/types/modules/financial-maintenance/tax-maintenance/TaxMaintenanceTypes";
import {
	ModuleStatisticCards,
	type ModuleStatisticCardItem,
} from "@/app/src/ui/shared/module/ModuleStatisticCards";

export function TaxMaintenanceStatisticCards({
	isLoading,
	statistics,
	taxes,
}: TaxMaintenanceStatisticCardsProps) {
	const accountLinkCount = useMemo(
		() =>
			taxes.reduce(
				(total, tax) =>
					total +
					[
						tax.inputVatAccountId,
						tax.outputVatAccountId,
						tax.deferredVatAccountId,
						tax.expandedWithholdingTaxAccountId,
						tax.creditableWithholdingTaxAccountId,
						tax.withholdingVatableTaxAccountId,
						tax.finalWithholdingTaxAccountId,
					].filter(Boolean).length,
				0,
			),
		[taxes],
	);
	const statisticCards = useMemo<ModuleStatisticCardItem[]>(
		() => [
			{
				icon: ReceiptText,
				iconClassName: "bg-skyblue/20 text-skyblue",
				label: "Total Taxes",
				summary: "All VAT registration types",
				value: statistics.totalTaxes,
			},
			{
				icon: CheckCircle2,
				iconClassName: "bg-emerald-50 text-emerald-700",
				label: "Active Taxes",
				summary: "Available for party setup",
				value: statistics.activeTaxes,
			},
			{
				icon: CirclePause,
				iconClassName: "bg-amber-50 text-amber-700",
				label: "Inactive Taxes",
				summary: "Currently inactive",
				value: statistics.inactiveTaxes,
			},
			{
				icon: Landmark,
				iconClassName: "bg-cyan-50 text-cyan-700",
				label: "Account Links",
				summary: "Configured COA links",
				value: accountLinkCount,
			},
		],
		[accountLinkCount, statistics],
	);

	return (
		<ModuleStatisticCards
			items={statisticCards}
			isLoading={isLoading}
			className="xl:grid-cols-4"
		/>
	);
}
