import { FileText, Paperclip } from "lucide-react";
import type { PettyCashVoucherFormValues } from "@/app/src/types/modules/cash-disbursement/petty-cash-voucher/PettyCashVoucherTypes";
import {
	Field,
	inputClassName,
	secondaryButtonClassName,
	type PettyCashVoucherFormPageState,
} from "@/app/src/ui/modules/cash-disbursement/petty-cash-voucher/PettyCashVoucherFormControls";

export function PettyCashVoucherDetailsFields({
	page,
}: {
	page: PettyCashVoucherFormPageState;
}) {
	return (
		<div className="rounded-xl border border-darknavy/10 bg-white p-6 shadow-sm">
			<div className="mb-5 flex items-center gap-3 rounded-2xl bg-skyblue/10 p-4 text-sm font-semibold text-darknavy">
				<FileText className="h-5 w-5 text-skyblue" />
				Voucher details
			</div>

			<div className="grid gap-5 sm:grid-cols-2">
				<TextField
					page={page}
					field="vceCode"
					label="VCE Code *"
					placeholder="Enter VCE code"
				/>
				<TextField
					page={page}
					field="transactionNo"
					label="Transaction No. *"
					placeholder="Enter transaction number"
				/>
				<TextField
					page={page}
					field="vceName"
					label="VCE Name *"
					placeholder="Enter VCE name"
				/>
				<TextField
					page={page}
					field="documentDate"
					label="Document Date"
					type="date"
				/>
				<TextField
					page={page}
					field="accountCode"
					label="Account Code *"
					placeholder="Enter account code"
				/>
				<Field label="Status" error={page.errors.status}>
					<select
						value={page.values.status}
						disabled={page.isReadonly}
						onChange={(event) =>
							page.updateField(
								"status",
								event.target.value as PettyCashVoucherFormValues["status"],
							)
						}
						className={`${inputClassName} app-select-control`}
					>
						<option>Pending</option>
						<option>Approved</option>
						<option>Cancelled</option>
					</select>
				</Field>
				<TextField
					page={page}
					field="accountTitle"
					label="Account Title *"
					placeholder="Enter account title"
				/>
				<TextField
					page={page}
					field="amount"
					label="Amount"
					placeholder="0.00"
				/>
				<TextField
					page={page}
					field="costCenter"
					label="Cost Center"
					placeholder="Select cost center"
				/>
				<Field label="Vatable" error={page.errors.vatable}>
					<select
						value={page.values.vatable}
						disabled={page.isReadonly}
						onChange={(event) =>
							page.updateField(
								"vatable",
								event.target.value as PettyCashVoucherFormValues["vatable"],
							)
						}
						className={`${inputClassName} app-select-control`}
					>
						<option>False</option>
						<option>True</option>
					</select>
				</Field>
				<TextField
					page={page}
					field="vatAmount"
					label="Vat Amount"
					placeholder="0.00"
				/>
				<TextField
					page={page}
					field="netAmount"
					label="Net Amount"
					placeholder="0.00"
				/>
			</div>

			<div className="mt-5">
				<Field label="Remarks" error={page.errors.remarks}>
					<textarea
						value={page.values.remarks}
						readOnly={page.isReadonly}
						onChange={(event) =>
							page.updateField("remarks", event.target.value)
						}
						className={`${inputClassName} min-h-32 resize-none py-3`}
						placeholder="Optional remarks"
					/>
				</Field>
			</div>
		</div>
	);
}

export function PettyCashVoucherSidePanel() {
	return (
		<aside className="space-y-4">
			<div className="rounded-xl border border-darknavy/10 bg-white p-6 shadow-sm">
				<div className="flex items-center gap-3 text-sm font-semibold text-darknavy/80">
					<Paperclip
						className="h-4 w-4 text-darknavy/50"
						aria-hidden="true"
					/>
					File attachments
				</div>
				<p className="mt-3 text-sm text-darknavy/65">
					Attach supporting documents to keep the voucher audit-ready.
				</p>
				<div className="mt-4 grid gap-3">
					<button className={secondaryButtonClassName}>Add attachment</button>
				</div>
			</div>
		</aside>
	);
}

function TextField({
	field,
	label,
	page,
	placeholder,
	type = "text",
}: {
	field: keyof PettyCashVoucherFormValues;
	label: string;
	page: PettyCashVoucherFormPageState;
	placeholder?: string;
	type?: string;
}) {
	return (
		<Field label={label} error={page.errors[field]}>
			<input
				type={type}
				value={page.values[field]}
				readOnly={page.isReadonly}
				onChange={(event) => page.updateField(field, event.target.value)}
				className={inputClassName}
				placeholder={placeholder}
			/>
		</Field>
	);
}
