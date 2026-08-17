import type { ColumnDef } from "@tanstack/react-table";
import type { ApprovalTransactionApiRecord } from "@/app/src/services/modules/approval-management/ApprovalManagementApi";
import type { AppAdvancedDropdownOption } from "@/app/src/ui/shared/advanced-dropdown/AppAdvancedDropdown";
import {
	AllApproversFilter,
	AllModulesFilter,
	AllRulesFilter,
	ApprovedStatus,
	DisapprovedStatus,
	DoneStatus,
} from "@/app/src/constants/modules/approval-management/ApprovalTransactionConstants";
import type {
	ApprovalTransactionApprover,
	ApprovalTransactionFilters,
	ApprovalTransactionRow,
} from "@/app/src/types/modules/approval-management/ApprovalTransactionTypes";

export const ApprovalTransactionColumns: ColumnDef<ApprovalTransactionRow>[] = [
	{ accessorKey: "referenceNo", header: "Reference", meta: { className: "min-w-[12rem]" } },
	{ accessorKey: "moduleName", header: "Module", meta: { className: "min-w-[13rem]" } },
	{ accessorKey: "ruleName", header: "Rule", meta: { className: "min-w-[12rem]" } },
	{ accessorKey: "currentApproverName", header: "Current Approver", meta: { className: "min-w-[13rem]" } },
	{ accessorKey: "approvalPath", header: "Approval Path", meta: { className: "min-w-[18rem]" } },
	{ accessorKey: "amount", header: "Amount", meta: { className: "min-w-[10rem]" } },
	{ accessorKey: "statusLabel", header: "Status", meta: { className: "min-w-[11rem]" } },
	{ id: "actions", header: "Actions", meta: { className: "min-w-[6rem] text-center" } },
];

export function mapApprovalTransactionRow(
	transaction: ApprovalTransactionApiRecord,
): ApprovalTransactionRow {
	const sortedApprovers = transaction.approvers
		.slice()
		.sort((first, second) => first.sequence - second.sequence);
	const currentApprover = getCurrentApprover(transaction, sortedApprovers);
	const isDone =
		transaction.status === ApprovedStatus ||
		transaction.status === DisapprovedStatus ||
		!currentApprover;

	return {
		amount: formatBackendTransactionAmount(transaction.amount),
		approvalPath: sortedApprovers.map((approver) => approver.name).join(" -> "),
		canAct: transaction.canUpdateStatus && !isDone,
		currentApproverName: currentApprover?.name ?? "Completed",
		id: transaction.id,
		moduleName: transaction.moduleName || transaction.moduleScope,
		moduleScope: transaction.moduleScope,
		referenceNo: transaction.referenceNo,
		requestedAt: formatTransactionDate(transaction.requestedAt),
		ruleId: transaction.ruleId,
		ruleName: transaction.ruleName || "Approval rule",
		statusLabel: isDone
			? DoneStatus
			: transaction.isSequential
				? `Waiting for ${currentApprover?.name ?? transaction.blockerName ?? "approver"}`
				: "Waiting for anyone",
		transaction,
	};
}

export function createModuleOptions(
	rows: ApprovalTransactionRow[],
	modules: Array<{ code: string; name: string }>,
): AppAdvancedDropdownOption[] {
	const names = new Map(modules.map((module) => [module.code, module.name]));
	rows.forEach((row) => names.set(row.moduleScope, row.moduleName));

	return [
		{ name: "All modules", value: AllModulesFilter },
		...Array.from(names.entries())
			.sort((first, second) => first[1].localeCompare(second[1]))
			.map(([value, name]) => ({ name, value })),
	];
}

export function createRuleOptions(
	rows: ApprovalTransactionRow[],
	moduleCode: string,
): AppAdvancedDropdownOption[] {
	const names = new Map<string, string>();
	rows.forEach((row) => {
		if (moduleCode === AllModulesFilter || row.moduleScope === moduleCode) {
			names.set(row.ruleId, row.ruleName);
		}
	});

	return [
		{ name: "All rules", value: AllRulesFilter },
		...Array.from(names.entries())
			.sort((first, second) => first[1].localeCompare(second[1]))
			.map(([value, name]) => ({ name, value })),
	];
}

export function createApproverOptions(
	rows: ApprovalTransactionRow[],
	moduleCode: string,
	ruleId: string,
): AppAdvancedDropdownOption[] {
	const names = new Map<string, string>();
	rows.forEach((row) => {
		if (moduleCode !== AllModulesFilter && row.moduleScope !== moduleCode) return;
		if (ruleId !== AllRulesFilter && row.ruleId !== ruleId) return;
		row.transaction.approvers.forEach((approver) =>
			names.set(String(approver.userId), approver.name),
		);
	});

	return [
		{ name: "All approvers", value: AllApproversFilter },
		...Array.from(names.entries())
			.sort((first, second) => first[1].localeCompare(second[1]))
			.map(([value, name]) => ({ name, value })),
	];
}

export function matchesTransactionFilters(
	row: ApprovalTransactionRow,
	filters: ApprovalTransactionFilters,
) {
	if (filters.moduleCode !== AllModulesFilter && row.moduleScope !== filters.moduleCode) return false;
	if (filters.ruleId !== AllRulesFilter && row.ruleId !== filters.ruleId) return false;
	if (
		filters.approverId !== AllApproversFilter &&
		!row.transaction.approvers.some(
			(approver) => String(approver.userId) === filters.approverId,
		)
	) return false;

	const query = filters.query.trim().toLowerCase();
	if (!query) return true;

	return [
		row.referenceNo,
		row.moduleName,
		row.moduleScope,
		row.ruleName,
		row.currentApproverName,
		row.approvalPath,
		row.statusLabel,
	].some((value) => value.toLowerCase().includes(query));
}

export function formatApproverStatus(approver: ApprovalTransactionApprover) {
	if (approver.status === ApprovedStatus && approver.approvedAt) {
		return `Approved ${formatTransactionDate(approver.approvedAt)}`;
	}
	if (approver.status === DisapprovedStatus && approver.approvedAt) {
		return `Disapproved ${formatTransactionDate(approver.approvedAt)}`;
	}
	return approver.status;
}

function getCurrentApprover(
	transaction: ApprovalTransactionApiRecord,
	approvers: ApprovalTransactionApprover[],
) {
	return approvers.find((approver) => approver.userId === transaction.currentApproverId)
		?? approvers.find((approver) => approver.status !== ApprovedStatus)
		?? null;
}

function formatBackendTransactionAmount(value: string) {
	return new Intl.NumberFormat("en-PH", {
		currency: "PHP",
		maximumFractionDigits: 2,
		minimumFractionDigits: 2,
		style: "currency",
	}).format(Number(value));
}

function formatTransactionDate(value: string) {
	return new Intl.DateTimeFormat("en-US", {
		day: "2-digit",
		month: "short",
		year: "numeric",
	}).format(new Date(value));
}
