"use client";

import { Search } from "lucide-react";
import type { ReactNode } from "react";
import { MultiCurrencySetupTablePaginationStorageKey } from "@/app/src/constants/modules/system-administration/multi-currency-setup/MultiCurrencySetupConstants";
import { useMultiCurrencySetupTable } from "@/app/src/hooks/modules/system-administration/multi-currency-setup/useMultiCurrencySetupTable";
import type { MultiCurrencySetupTableRecord } from "@/app/src/types/modules/system-administration/multi-currency-setup/MultiCurrencySetupTypes";
import { ModuleTable } from "@/app/src/ui/shared/module/module-table/ModuleTable";
import { MultiCurrencySetupTableRow } from "@/app/src/ui/modules/system-administration/multi-currency-setup/MultiCurrencySetupTableRow";

type MultiCurrencySetupTableProps = {
	isLoading: boolean;
	lastSyncedAt?: number | string | Date | null;
	records: MultiCurrencySetupTableRecord[];
	toolbar?: ReactNode;
	onConfigureRecord: (record: MultiCurrencySetupTableRecord) => void;
	onDeleteRecord: (record: MultiCurrencySetupTableRecord) => void;
	onUpdateRecordRate: (record: MultiCurrencySetupTableRecord) => void;
};

export function MultiCurrencySetupTable({
	isLoading,
	lastSyncedAt,
	onConfigureRecord,
	records,
	toolbar,
	onDeleteRecord,
	onUpdateRecordRate,
}: MultiCurrencySetupTableProps) {
	const table = useMultiCurrencySetupTable(records);

	return (
		<ModuleTable
			emptyDescription="Add a wanted currency for the selected base currency."
			emptyIcon={<Search className="h-5 w-5" aria-hidden="true" />}
			emptyTitle="No currency setups found"
			isLoading={isLoading}
			lastSyncedAt={lastSyncedAt}
			minWidthClassName="min-w-[76rem]"
			paginationStorageKey={MultiCurrencySetupTablePaginationStorageKey}
			table={table}
			tableTitle="Currencies and daily exchange rates"
			toolbar={toolbar}
			renderRow={({ id, original }) => (
				<MultiCurrencySetupTableRow
					key={id}
					record={original}
					onConfigureRecord={onConfigureRecord}
					onDeleteRecord={onDeleteRecord}
					onUpdateRecordRate={onUpdateRecordRate}
				/>
			)}
		/>
	);
}
