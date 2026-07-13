import type { MultiCurrencySetupTableRecord } from "@/app/src/types/modules/system-administration/multi-currency-setup/MultiCurrencySetupTypes";

type MultiCurrencySetupTableRowProps = {
	record: MultiCurrencySetupTableRecord;
};

export function MultiCurrencySetupTableRow({
	record,
}: MultiCurrencySetupTableRowProps) {
	return (
		<tr className="module-table-row">
			<td className="px-4 py-4">
				<span className="font-semibold text-darknavy">
					{record.currencyCode}
				</span>
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
					1 {record.currencyCode} = {record.dailyExchangeRateDisplay}{" "}
					{record.baseCurrencyCode}
				</div>
			</td>
			<td className="px-4 py-4 text-sm text-darknavy">
				{record.rateAsOf}
			</td>
		</tr>
	);
}
