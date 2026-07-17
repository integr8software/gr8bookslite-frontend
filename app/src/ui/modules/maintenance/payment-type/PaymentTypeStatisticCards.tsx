"use client";

import { useMemo } from "react";
import { CheckCircle2, CirclePause, CreditCard } from "lucide-react";
import type { PaymentTypeStatisticCardsProps } from "@/app/src/types/modules/maintenance/payment-type/PaymentTypeTypes";
import {
	ModuleStatisticCards,
	type ModuleStatisticCardItem,
} from "@/app/src/ui/shared/module/ModuleStatisticCards";

export function PaymentTypeStatisticCards({
	isLoading,
	statistics,
}: PaymentTypeStatisticCardsProps) {
	const statisticCards = useMemo<ModuleStatisticCardItem[]>(
		() => [
			{
				helper: "All payment types",
				icon: CreditCard,
				label: "Total Types",
				value: statistics.totalPaymentTypes,
			},
			{
				helper: "Available for vouchers",
				icon: CheckCircle2,
				label: "Active Types",
				tone: "emerald",
				value: statistics.activePaymentTypes,
			},
			{
				helper: "Currently inactive",
				icon: CirclePause,
				label: "Inactive Types",
				tone: "amber",
				value: statistics.inactivePaymentTypes,
			},
		],
		[statistics],
	);

	return <ModuleStatisticCards items={statisticCards} isLoading={isLoading} />;
}
