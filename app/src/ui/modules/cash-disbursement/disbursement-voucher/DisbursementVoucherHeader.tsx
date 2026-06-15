import {
	CheckCircle2,
	Clock3,
	PackageCheck,
	ReceiptText,
	XCircle,
} from "lucide-react";
import { getDisbursementVoucherDisplayStatus } from "@/app/src/data/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherData";
import type { DisbursementVoucherPreviewRow } from "@/app/src/types/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherTypes";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";

export function DisbursementVoucherMetrics({
	previewRows,
}: {
	previewRows: DisbursementVoucherPreviewRow[];
}) {
	const approvedCount = previewRows.filter(
		(row) =>
			getDisbursementVoucherDisplayStatus(
				row.voucher?.status ?? row.transaction.status,
			) === "Approved",
	).length;
	const disapprovedCount = previewRows.filter(
		(row) =>
			getDisbursementVoucherDisplayStatus(
				row.voucher?.status ?? row.transaction.status,
			) === "Disapproved",
	).length;
	const pendingCount = previewRows.filter(
		(row) =>
			getDisbursementVoucherDisplayStatus(
				row.voucher?.status ?? row.transaction.status,
			) === "Pending",
	).length;
	const completedCount = previewRows.filter(
		(row) =>
			getDisbursementVoucherDisplayStatus(
				row.voucher?.status ?? row.transaction.status,
			) === "Completed",
	).length;
	const cards = [
		{
			label: "Total Vouchers",
			value: previewRows.length,
			summary: "All time",
			icon: ReceiptText,
			iconClassName: "bg-skyblue/20 text-skyblue",
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
			label: "Completed",
			value: completedCount,
			summary: formatPercentage(completedCount, previewRows.length),
			icon: PackageCheck,
			iconClassName: "bg-skyblue/15 text-skyblue",
		},
	];

	return (
		<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
			{cards.map((card) => {
				const Icon = card.icon;

				return (
					<div
						key={card.label}
						className="rounded-lg border border-darknavy/10 bg-white p-5 shadow-sm shadow-darknavy/5"
					>
						<div className="flex items-center justify-between gap-4">
							<div>
								<p className="text-sm font-semibold text-darknavy">
									{card.label}
								</p>
								<p className="mt-3 text-3xl font-semibold leading-none text-darknavy">
									{card.value}
								</p>
								<p className="mt-2 text-xs font-medium text-darknavy/60">
									{card.summary}
								</p>
							</div>
							<span
								className={joinClasses(
									"inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-full",
									card.iconClassName,
								)}
							>
								<Icon className="h-6 w-6" aria-hidden="true" />
							</span>
						</div>
					</div>
				);
			})}
		</div>
	);
}

function formatPercentage(value: number, total: number) {
	if (total === 0) {
		return "0.00% of total";
	}

	return `${((value / total) * 100).toFixed(2)}% of total`;
}
