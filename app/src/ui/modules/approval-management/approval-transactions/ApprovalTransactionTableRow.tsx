import { Eye, UserCheck } from "lucide-react";
import { DoneStatus } from "@/app/src/constants/modules/approval-management/ApprovalTransactionConstants";
import type { ApprovalTransactionRow } from "@/app/src/types/modules/approval-management/ApprovalTransactionTypes";
import { ModuleStatusBadge } from "@/app/src/ui/shared/module/ModuleStatusBadge";
import { ModuleTooltip } from "@/app/src/ui/shared/module/ModuleTooltip";
import { ModuleTableActionButton, ModuleTableActions } from "@/app/src/ui/shared/module/module-table/ModuleTableActions";
import { joinClasses, moduleAccentClassNames } from "@/app/src/ui/shared/module/module-table/utils";

export function ApprovalTransactionTableRow({ onPreview, record }: {
	onPreview: (record: ApprovalTransactionRow) => void;
	record: ApprovalTransactionRow;
}) {
	return (
		<tr className="module-table-row">
			<td className="align-middle"><div className="font-semibold text-darknavy">{record.referenceNo}</div><div className="mt-1 text-xs font-medium text-darknavy/45">{record.requestedAt}</div></td>
			<td className="align-middle"><div className="font-medium text-darknavy">{record.moduleName}</div><div className="mt-1 text-xs font-medium text-darknavy/45">{record.moduleScope}</div></td>
			<td className="align-middle font-medium text-darknavy">{record.ruleName}</td>
			<td className="align-middle"><span className="inline-flex items-center gap-2 font-medium text-darknavy"><UserCheck className={joinClasses("h-4 w-4", moduleAccentClassNames.iconText)} aria-hidden="true" />{record.currentApproverName}</span></td>
			<td className="align-middle"><span className="line-clamp-2 text-sm font-medium text-darknavy/70">{record.approvalPath}</span></td>
			<td className="align-middle font-semibold text-darknavy">{record.amount}</td>
			<td className="align-middle"><ModuleStatusBadge status={record.statusLabel} className={record.statusLabel === DoneStatus ? "border-emerald-300 bg-emerald-50 text-emerald-700" : "border-amber-200 bg-amber-50 text-amber-700"} /></td>
			<td className="align-middle"><ModuleTableActions className="justify-center"><ModuleTooltip align="end" position="top" title="Preview"><ModuleTableActionButton icon={Eye} label={`Preview ${record.referenceNo}`} variant="view" onClick={() => onPreview(record)} /></ModuleTooltip></ModuleTableActions></td>
		</tr>
	);
}
