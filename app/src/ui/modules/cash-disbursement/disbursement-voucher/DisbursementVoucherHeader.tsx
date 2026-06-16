import {
	CheckCircle2,
	Clock3,
	PackageCheck,
	ReceiptText,
	XCircle,
} from "lucide-react";
import {
	getDisbursementVoucherDisplayStatus,
	isDisbursementVoucherActiveStatus,
} from "@/app/src/data/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherData";
import type { DisbursementVoucherPreviewRow } from "@/app/src/types/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherTypes";
import { ModuleStatisticCards } from "@/app/src/ui/shared/module/ModuleStatisticCards";

export function DisbursementVoucherMetrics({
	previewRows,
}: {
	previewRows: DisbursementVoucherPreviewRow[];
}) {
	const activeCount = previewRows.filter((row) =>
		isDisbursementVoucherActiveStatus(
			row.voucher?.status ?? row.transaction.status,
		),
	).length;
	const approvedCount = countPreviewRowsByStatus(previewRows, "Approved");
	const disapprovedCount = countPreviewRowsByStatus(previewRows, "Disapproved");
	const pendingCount = countPreviewRowsByStatus(previewRows, "Pending");
	const closedCount = countPreviewRowsByStatus(previewRows, "Closed");
	const cards = [
		{
			label: "Total Vouchers",
			value: previewRows.length,
			summary: "All time",
			icon: ReceiptText,
			iconClassName: "bg-skyblue/20 text-skyblue",
		},
		{
			label: "Active",
			value: activeCount,
			summary: formatPercentage(activeCount, previewRows.length),
			icon: CheckCircle2,
			iconClassName: "bg-emerald-50 text-emerald-700",
		},
		{
			label: "Pending",
			value: pendingCount,
			summary: formatPercentage(pendingCount, previewRows.length),
			icon: Clock3,
			iconClassName: "bg-offwhite text-darknavy",
		},
		{
			label: "Approved",
			value: approvedCount,
			summary: formatPercentage(approvedCount, previewRows.length),
			icon: CheckCircle2,
			iconClassName: "bg-citron/25 text-darknavy",
		},
		{
			label: "Disapproved",
			value: disapprovedCount,
			summary: formatPercentage(disapprovedCount, previewRows.length),
			icon: XCircle,
			iconClassName: "bg-coralpink/15 text-coralpink",
		},
		{
			label: "Closed",
			value: closedCount,
			summary: formatPercentage(closedCount, previewRows.length),
			icon: PackageCheck,
			iconClassName: "bg-skyblue/15 text-skyblue",
		},
	];

	return (
		<ModuleStatisticCards items={cards} className="2xl:grid-cols-6" />
	);
}

function countPreviewRowsByStatus(
	previewRows: DisbursementVoucherPreviewRow[],
	status: ReturnType<typeof getDisbursementVoucherDisplayStatus>,
) {
	return previewRows.filter(
		(row) =>
			getDisbursementVoucherDisplayStatus(
				row.voucher?.status ?? row.transaction.status,
			) === status,
	).length;
}

function formatPercentage(value: number, total: number) {
	if (total === 0) {
		return "0.00% of total";
	}

	return `${((value / total) * 100).toFixed(2)}% of total`;
}
