"use client";

import { useMemo } from "react";
import {
	Banknote,
	CheckCircle2,
	CirclePause,
	CreditCard,
	Landmark,
	ReceiptText,
	WalletCards,
} from "lucide-react";
import type { PaymentTypeStatisticCardsProps } from "@/app/src/types/modules/financial-maintenance/payment-type/PaymentTypeTypes";
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
			{
				helper: "Cash payment types",
				icon: Banknote,
				label: "Cash",
				tone: "cyan",
				value: statistics.cashPaymentTypes,
			},
			{
				helper: "Bank transfer types",
				icon: Landmark,
				label: "Bank Transfer",
				tone: "violet",
				value: statistics.bankTransferPaymentTypes,
			},
			{
				helper: "Check payment types",
				icon: ReceiptText,
				label: "Check",
				tone: "slate",
				value: statistics.checkPaymentTypes,
			},
			{
				helper: "Digital wallet types",
				icon: WalletCards,
				label: "Digital Wallet",
				tone: "cyan",
				value: statistics.digitalWalletPaymentTypes,
			},
			{
				helper: "Non-cash settlement types",
				icon: CreditCard,
				label: "Non-Cash",
				tone: "violet",
				value: statistics.nonCashSettlementPaymentTypes,
			},
		],
		[statistics],
	);

	return (
		<ModuleStatisticCards
			items={statisticCards}
			isLoading={isLoading}
			className="xl:grid-cols-4"
		/>
	);
}
