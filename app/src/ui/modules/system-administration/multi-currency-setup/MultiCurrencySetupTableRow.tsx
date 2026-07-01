import type { MultiCurrencySetupTableRecord } from "@/app/src/types/modules/system-administration/multi-currency-setup/MultiCurrencySetupTypes";
import { MultiCurrencySetupRecordActions } from "@/app/src/ui/modules/system-administration/multi-currency-setup/MultiCurrencySetupRecordActions";

type MultiCurrencySetupTableRowProps = {
	record: MultiCurrencySetupTableRecord;
	onConfigureRecord: (record: MultiCurrencySetupTableRecord) => void;
	onDeleteRecord: (record: MultiCurrencySetupTableRecord) => void;
	onUpdateRecordRate: (record: MultiCurrencySetupTableRecord) => void;
};

export function MultiCurrencySetupTableRow({
	onConfigureRecord,
	record,
	onDeleteRecord,
	onUpdateRecordRate,
}: MultiCurrencySetupTableRowProps) {
	return (
		<tr className="module-table-row">
			<td className="px-4 py-4">
				<div className="font-semibold text-darknavy">
					{record.targetCurrencyLabel}
				</div>
				<div className="mt-1 text-xs text-darknavy/55">
					1 {record.baseCurrencyCode} to {record.targetCurrencyCode}
				</div>
			</td>
			<td className="px-4 py-4">
				<div className="text-sm text-darknavy">
					{record.currentExchangeRateDisplay}
				</div>
				<div className="mt-1 text-xs text-darknavy/50">
					As of {record.rateAsOf}
				</div>
			</td>
			<td className="px-4 py-4">
				<div className="text-sm font-semibold text-darknavy">
					{record.originalExchangeRateDisplay}
				</div>
				<div className="mt-1 text-xs text-darknavy/50">
					{record.source === "Manual"
						? "Manual override"
						: "API synced"}
				</div>
			</td>
			<td className="px-4 py-4">
				<span
					className={
						record.variancePercent >= 0
							? "font-semibold text-emerald-600"
							: "font-semibold text-coralpink"
					}
				>
					{record.varianceDisplay}
				</span>
			</td>
			<td className="px-4 py-4">
				<span
					className={
						record.status === "Active"
							? "inline-flex rounded-md bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700"
							: "inline-flex rounded-md bg-darknavy/5 px-2 py-1 text-xs font-semibold text-darknavy/55"
					}
				>
					{record.status}
				</span>
			</td>
			<td className="px-4 py-4">
				<MultiCurrencySetupRecordActions
					record={record}
					onConfigureRecord={onConfigureRecord}
					onDeleteRecord={onDeleteRecord}
					onUpdateRecordRate={onUpdateRecordRate}
				/>
			</td>
		</tr>
	);
}
