"use client";

import { Search } from "lucide-react";
import type { Table } from "@tanstack/react-table";
import type {
	ChartAccount,
	FlattenedChartAccount,
} from "@/app/src/types/modules/maintenance/financial-management/charts-of-accounts/ChartsOfAccountsTypes";
import { ModuleTable } from "@/app/src/ui/shared/module/module-table/ModuleTable";
import { ChartsOfAccountsTableRow } from "@/app/src/ui/modules/maintenance/financial-management/charts-of-accounts/ChartsOfAccountsTableRow";

type ChartsOfAccountsTableProps = {
	expandedIds: Set<string>;
	isLoading: boolean;
	table: Table<FlattenedChartAccount>;
	onDelete: (account: ChartAccount) => void;
	onEdit: (account: ChartAccount) => void;
	onToggleExpanded: (accountId: string) => void;
};

export function ChartsOfAccountsTable(props: ChartsOfAccountsTableProps) {
	return (
		<ModuleTable
			emptyDescription="Adjust the filters or add a new ledger account."
			emptyIcon={<Search className="h-5 w-5" aria-hidden="true" />}
			emptyTitle="No accounts found"
			isLoading={props.isLoading}
			paginationLabel="accounts"
			table={props.table}
			renderRow={({ id, original }) => (
				<ChartsOfAccountsTableRow
					key={id}
					account={original.account}
					expandedIds={props.expandedIds}
					level={original.level}
					onDelete={props.onDelete}
					onEdit={props.onEdit}
					onToggleExpanded={props.onToggleExpanded}
				/>
			)}
		/>
	);
}
