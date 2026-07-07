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
				<div className="flex items-center gap-2">
					<span className="font-semibold text-darknavy">
						{record.currencyCode}
					</span>
					{record.isBaseCurrency ? (
						<span className="rounded-md bg-skyblue/10 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide text-skyblue">
							Base
						</span>
					) : null}
				</div>
			</td>
			<td className="px-4 py-4">
				<div className="text-sm font-medium text-darknavy">
					{record.currencyDescription}
				</div>
			</td>
			<td className="px-4 py-4">
				<div className="text-sm font-semibold text-darknavy">
					{record.currencySymbol}
				</div>
			</td>
			<td className="px-4 py-4">
				<div className="font-semibold tabular-nums text-darknavy">
					{record.dailyExchangeRateDisplay}
				</div>
				<div className="mt-1 text-xs text-darknavy/50">
					{record.isBaseCurrency
						? "Company base currency"
						: `1 ${record.currencyCode} = ${record.dailyExchangeRateDisplay} ${record.baseCurrencyCode}`}
				</div>
			</td>
			<td className="px-4 py-4 text-sm text-darknavy">
				{record.isBaseCurrency ? "—" : record.rateAsOf}
			</td>
			<td className="px-4 py-4">
				<span className="text-sm font-medium text-darknavy">
					{record.isBaseCurrency
						? "—"
						: record.source === "Manual"
							? "Manual"
							: "Automatic"}
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
					{record.status === "Active" ? "Enabled" : "Disabled"}
				</span>
			</td>
			<td className="px-4 py-4 text-right">
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
