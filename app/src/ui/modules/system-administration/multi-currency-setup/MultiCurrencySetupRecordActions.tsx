import { Pencil, RefreshCcw, Trash2 } from "lucide-react";
import type { MultiCurrencySetupTableRecord } from "@/app/src/types/modules/system-administration/multi-currency-setup/MultiCurrencySetupTypes";
import { ModuleActionMenu } from "@/app/src/ui/shared/module/ModuleActionMenu";

type MultiCurrencySetupRecordActionsProps = {
	record: MultiCurrencySetupTableRecord;
	onConfigureRecord: (record: MultiCurrencySetupTableRecord) => void;
	onDeleteRecord: (record: MultiCurrencySetupTableRecord) => void;
	onUpdateRecordRate: (record: MultiCurrencySetupTableRecord) => void;
};

export function MultiCurrencySetupRecordActions({
	onConfigureRecord,
	record,
	onDeleteRecord,
	onUpdateRecordRate,
}: MultiCurrencySetupRecordActionsProps) {
	const label = `${record.baseCurrencyCode} to ${record.targetCurrencyCode}`;

	return (
		<ModuleActionMenu
			label={`Open ${label} actions`}
			items={[
				{
					icon: Pencil,
					label: "Configure",
					onSelect: () => onConfigureRecord(record),
					type: "button",
				},
				{
					icon: RefreshCcw,
					label: "Use API rate",
					onSelect: () => onUpdateRecordRate(record),
					type: "button",
				},
				{
					icon: Trash2,
					label: "Delete",
					onSelect: () => onDeleteRecord(record),
					tone: "danger",
					type: "button",
				},
			]}
		/>
	);
}
