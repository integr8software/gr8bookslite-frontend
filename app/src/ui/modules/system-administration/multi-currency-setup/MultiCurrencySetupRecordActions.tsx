import { Pencil, RefreshCcw, Trash2 } from "lucide-react";
import type { MultiCurrencySetupTableRecord } from "@/app/src/types/modules/system-administration/multi-currency-setup/MultiCurrencySetupTypes";
import { ModuleTooltip } from "@/app/src/ui/shared/module/ModuleTooltip";
import {
	ModuleTableActionButton,
	ModuleTableActions,
} from "@/app/src/ui/shared/module/module-table/ModuleTableActions";

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

	if (record.isBaseCurrency) {
		return (
			<span className="text-xs font-semibold text-darknavy/50">
				Base currency
			</span>
		);
	}

	return (
		<ModuleTableActions>
			<ModuleTooltip align="end" position="top" title="Configure">
				<ModuleTableActionButton
					icon={Pencil}
					label={`Configure ${label}`}
					variant="edit"
					onClick={() => onConfigureRecord(record)}
				/>
			</ModuleTooltip>
			<ModuleTooltip align="end" position="top" title="Refresh rate">
				<ModuleTableActionButton
					icon={RefreshCcw}
					label={`Refresh ${label} from BSP`}
					onClick={() => onUpdateRecordRate(record)}
				/>
			</ModuleTooltip>
			<ModuleTooltip align="end" position="top" title="Delete">
				<ModuleTableActionButton
					icon={Trash2}
					label={`Delete ${label}`}
					variant="delete"
					onClick={() => onDeleteRecord(record)}
				/>
			</ModuleTooltip>
		</ModuleTableActions>
	);
}
