import { formatTransactionNumber } from "@/app/src/services/modules/system-administration/transaction-number-setup/TransactionNumberGenerationService";
import { formatBranchScopeLabel } from "@/app/src/services/modules/system-administration/transaction-number-setup/TransactionNumberSetupFormatters";
import type { TransactionNumberSetupRecord } from "@/app/src/types/modules/system-administration/transaction-number-setup/TransactionNumberSetupTypes";
import { TransactionNumberSetupRecordActions } from "@/app/src/ui/modules/system-administration/transaction-number-setup/TransactionNumberSetupRecordActions";

type TransactionNumberSetupTableRowProps = {
	branchNameById: Map<string, string>;
	setup: TransactionNumberSetupRecord;
};

export function TransactionNumberSetupTableRow({
	branchNameById,
	setup,
}: TransactionNumberSetupTableRowProps) {
	return (
		<tr className="module-table-row border-b border-darknavy/8 last:border-b-0">
			<td className="px-4 py-4">
				<div className="font-semibold text-darknavy">{setup.moduleName}</div>
			</td>
			<td className="px-4 py-4">
				<span className="inline-flex rounded-full bg-darknavy/8 px-3 py-1 text-xs font-semibold text-darknavy">
					{setup.inputMode}
				</span>
			</td>
			<td className="px-4 py-4">
				<span className="inline-flex rounded-full bg-skyblue/12 px-3 py-1 text-xs font-semibold text-darknavy">
					{setup.scope === "all"
						? "All branches"
						: setup.scope === "branch"
							? "Per branch"
							: "Shared"}
				</span>
			</td>
			<td className="px-4 py-4 text-xs font-medium">
				{formatBranchScopeLabel(setup, branchNameById)}
			</td>
			<td className="px-4 py-4 font-mono text-xs">{setup.prefix}</td>
			<td className="px-4 py-4 text-right font-mono text-xs">
				{setup.currentNumber}
			</td>
			<td className="px-4 py-4">
				<div className="font-mono text-xs font-semibold text-darknavy">
					{formatTransactionNumber(setup)}
				</div>
				<div className="text-xs text-darknavy/45">
					Pad {setup.padding} digits
				</div>
			</td>
			<td className="px-4 py-4">
				<span
					className={
						setup.status === "Active"
							? "inline-flex rounded-full bg-citron/30 px-3 py-1 text-xs font-semibold text-darknavy"
							: "inline-flex rounded-full bg-darknavy/8 px-3 py-1 text-xs font-semibold text-darknavy/55"
					}
				>
					{setup.status}
				</span>
			</td>
			<td className="px-4 py-4">
				<TransactionNumberSetupRecordActions setup={setup} />
			</td>
		</tr>
	);
}
