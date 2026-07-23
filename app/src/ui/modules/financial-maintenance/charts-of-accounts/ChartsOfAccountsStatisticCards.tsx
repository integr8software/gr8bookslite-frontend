"use client";

import { useMemo } from "react";
import {
	CheckCircle2,
	CirclePause,
	Layers3,
	ListTree,
	Network,
	ReceiptText,
} from "lucide-react";
import { getAccountPercentage } from "@/app/src/data/modules/financial-maintenance/charts-of-accounts/ChartsOfAccountsData";
import type { ChartsOfAccountsStatisticCardsProps } from "@/app/src/types/modules/financial-maintenance/charts-of-accounts/ChartsOfAccountsTypes";
import {
	ModuleStatisticCards,
	type ModuleStatisticCardItem,
} from "@/app/src/ui/shared/module/ModuleStatisticCards";

export function ChartsOfAccountsStatisticCards({
	flatAccounts,
	isLoading,
}: ChartsOfAccountsStatisticCardsProps) {
	const displayStatistics = useMemo(() => {
		const totalAccounts = flatAccounts.length;
		const activeAccounts = flatAccounts.filter(
			({ account }) => account.status === "Active",
		).length;
		const inactiveAccounts = totalAccounts - activeAccounts;
		const withSubmodules = flatAccounts.filter(({ account }) =>
			Boolean(account.children?.length),
		).length;
		const withoutSubmodules = totalAccounts - withSubmodules;
		const postingAccounts = flatAccounts.filter(
			({ account }) => account.isPostingAccount,
		).length;

		return {
			activeAccounts,
			inactiveAccounts,
			postingAccounts,
			totalAccounts,
			withSubmodules,
			withoutSubmodules,
		};
	}, [flatAccounts]);
	const statisticCards = useMemo<ModuleStatisticCardItem[]>(
		() => [
			{
				helper: "All accounts",
				icon: Layers3,
				label: "Total Accounts",
				value: displayStatistics.totalAccounts,
			},
			{
				helper: `${getAccountPercentage(displayStatistics.activeAccounts, displayStatistics.totalAccounts)}% of total`,
				icon: CheckCircle2,
				label: "Active Accounts",
				tone: "emerald",
				value: displayStatistics.activeAccounts,
			},
			{
				helper: `${getAccountPercentage(displayStatistics.inactiveAccounts, displayStatistics.totalAccounts)}% of total`,
				icon: CirclePause,
				label: "Inactive Accounts",
				tone: "amber",
				value: displayStatistics.inactiveAccounts,
			},
			{
				helper: `${getAccountPercentage(displayStatistics.withSubmodules, displayStatistics.totalAccounts)}% of total`,
				icon: Network,
				label: "With Submodules",
				tone: "violet",
				value: displayStatistics.withSubmodules,
			},
			{
				helper: `${getAccountPercentage(displayStatistics.withoutSubmodules, displayStatistics.totalAccounts)}% of total`,
				icon: ListTree,
				label: "Without Submodules",
				tone: "cyan",
				value: displayStatistics.withoutSubmodules,
			},
			{
				helper: `${getAccountPercentage(displayStatistics.postingAccounts, displayStatistics.totalAccounts)}% of total`,
				icon: ReceiptText,
				label: "Posting Account",
				tone: "slate",
				value: displayStatistics.postingAccounts,
			},
		],
		[displayStatistics],
	);

	return (
		<ModuleStatisticCards
			items={statisticCards}
			isLoading={isLoading}
			className="xl:grid-cols-6"
		/>
	);
}
