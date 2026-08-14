"use client";

import { X } from "lucide-react";
import {
	formatWorkspaceBillingTransactionAmount,
	formatWorkspaceBillingTransactionCategory,
	formatWorkspaceBillingTransactionDate,
} from "@/app/src/data/workspace/billing-and-transactions/WorkspaceBillingTransactionsData";
import type { WorkspaceBillingTransactionRecord } from "@/app/src/types/workspace/billing-and-transactions/WorkspaceBillingTransactionsTypes";
import { ModuleDrawer } from "@/app/src/ui/shared/module/ModuleDrawer";
import { ModuleStatusBadge } from "@/app/src/ui/shared/module/ModuleStatusBadge";
import { moduleHeaderActionClassNames } from "@/app/src/ui/shared/module/ModuleHeader";

type WorkspaceBillingTransactionDetailDrawerProps = {
	onClose: () => void;
	record: WorkspaceBillingTransactionRecord | null;
};

export function WorkspaceBillingTransactionDetailDrawer({
	onClose,
	record,
}: WorkspaceBillingTransactionDetailDrawerProps) {
	return (
		<ModuleDrawer
			isOpen={Boolean(record)}
			onClose={onClose}
			title={record?.invoiceNo ?? "Billing Transaction"}
			eyebrow="Transaction detail"
			description={record?.description}
			maxWidthClassName="max-w-xl"
			footer={
				<button
					type="button"
					onClick={onClose}
					className={moduleHeaderActionClassNames.secondary}
				>
					<X className="h-4 w-4" aria-hidden="true" />
					Close
				</button>
			}
		>
			{record ? (
				<div className="grid gap-4">
					<div className="rounded-lg border border-darknavy/10 bg-offwhite p-4">
						<div className="flex items-start justify-between gap-3">
							<div>
								<p className="text-xs font-semibold uppercase tracking-[0.12em] text-darknavy/45">
									Amount
								</p>
								<p className="mt-1 text-2xl font-semibold text-darknavy">
									{formatWorkspaceBillingTransactionAmount(
										record.amount,
										record.currencyCode,
									)}
								</p>
							</div>
							<ModuleStatusBadge status={record.status} />
						</div>
					</div>
					<div className="grid gap-3 sm:grid-cols-2">
						<Detail label="Company" value={record.companyName} />
						<Detail label="Invoice Number" value={record.invoiceNo} />
						<Detail
							label="Description"
							value={record.description}
							className="sm:col-span-2"
						/>
						<Detail
							label="Billing Period"
							value={`${formatWorkspaceBillingTransactionDate(
								record.billingPeriodStart,
							)} - ${formatWorkspaceBillingTransactionDate(
								record.billingPeriodEnd,
							)}`}
						/>
						<Detail label="Billing Mode" value={record.billingMode} />
						<Detail
							label="Category"
							value={formatWorkspaceBillingTransactionCategory(record.category)}
						/>
						<Detail label="Status" value={record.status} />
						<Detail
							label="Payment Method"
							value={record.paymentMethod ?? "-"}
						/>
						<Detail
							label="Provider Reference"
							value={
								record.providerReference
									? `${record.providerName ?? "Provider"} · ${
											record.providerReference
										}`
									: "-"
							}
						/>
						<Detail
							label="Issued Date"
							value={formatWorkspaceBillingTransactionDate(record.issuedDate)}
						/>
						<Detail
							label="Paid Date"
							value={formatWorkspaceBillingTransactionDate(record.paidDate)}
						/>
					</div>
				</div>
			) : null}
		</ModuleDrawer>
	);
}

function Detail({
	className,
	label,
	value,
}: {
	className?: string;
	label: string;
	value: string;
}) {
	return (
		<div className={className}>
			<p className="text-xs font-semibold uppercase tracking-[0.12em] text-darknavy/45">
				{label}
			</p>
			<p className="mt-1 text-sm font-medium leading-6 text-darknavy">
				{value}
			</p>
		</div>
	);
}
