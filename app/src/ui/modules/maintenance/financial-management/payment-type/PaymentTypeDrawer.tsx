"use client";

import { PaymentTypeOptions } from "@/app/src/data/modules/maintenance/financial-management/payment-type/PaymentTypeData";
import { usePaymentTypeActionPage } from "@/app/src/hooks/modules/maintenance/financial-management/payment-type/usePaymentTypeActionPage";
import type {
	PaymentTypeActionMode,
	PaymentTypeClassification,
	PaymentTypeRecord,
	PaymentTypeStatus,
} from "@/app/src/types/modules/maintenance/financial-management/payment-type/PaymentTypeTypes";
import { AppLimitedTextarea } from "@/app/src/ui/shared/app/AppLimitedTextarea";
import { MaintenanceFormDrawer } from "@/app/src/ui/modules/maintenance/shared/MaintenanceFormDrawer";

const formId = "payment-type-drawer-form";

const PaymentTypeActionCopy = {
	add: {
		description:
			"Create a payment type and classify how the voucher should collect payment details.",
		title: "Add Payment Type",
	},
	edit: {
		description:
			"Update the payment type name, classification, and active status.",
		title: "Edit Payment Type",
	},
	view: {
		description: "Review the payment type setup.",
		title: "View Payment Type",
	},
} satisfies Record<
	PaymentTypeActionMode,
	{ description: string; title: string }
>;

export function PaymentTypeDrawer({
	isOpen,
	mode,
	onClose,
	paymentType,
}: {
	isOpen: boolean;
	mode: PaymentTypeActionMode;
	onClose: () => void;
	paymentType?: PaymentTypeRecord;
}) {
	return (
		<PaymentTypeDrawerPanel
			key={`${mode}-${paymentType?.id ?? "new"}`}
			isOpen={isOpen}
			mode={mode}
			onClose={onClose}
			paymentType={paymentType}
		/>
	);
}

function PaymentTypeDrawerPanel({
	isOpen,
	mode,
	onClose,
	paymentType,
}: {
	isOpen: boolean;
	mode: PaymentTypeActionMode;
	onClose: () => void;
	paymentType?: PaymentTypeRecord;
}) {
	const page = usePaymentTypeActionPage({
		existingPaymentType: paymentType,
		mode,
		onSaved: onClose,
	});
	const copy = PaymentTypeActionCopy[mode];

	return (
		<MaintenanceFormDrawer
			description={copy.description}
			eyebrow="Accounting master data"
			formId={formId}
			isOpen={isOpen}
			isReadonly={page.isReadonly}
			isSaving={page.isMutating}
			onClose={onClose}
			title={copy.title}
		>
			<form id={formId} onSubmit={page.handleSubmit} className="grid gap-5 px-6 py-5">
				<label className="grid gap-2">
					<span className="text-sm font-semibold text-darknavy">
						Name <span className="text-coralpink">*</span>
					</span>
					<input
						value={page.values.paymentType}
						readOnly={page.isReadonly}
						onChange={(event) =>
							page.handleInputChange("paymentType", event.target.value)
						}
						className={fieldClassName}
					/>
					{page.errors.paymentType ? (
						<span className="text-xs font-semibold text-coralpink">
							{page.errors.paymentType}
						</span>
					) : null}
				</label>

				<label className="grid gap-2">
					<span className="text-sm font-semibold text-darknavy">Description</span>
					<AppLimitedTextarea
						value={page.values.description}
						readOnly={page.isReadonly}
						onChange={(event) =>
							page.handleInputChange("description", event.target.value)
						}
						className={`${fieldClassName} min-h-24 py-3`}
						counterMode="used"
					/>
					{page.errors.description ? (
						<span className="text-xs font-semibold text-coralpink">
							{page.errors.description}
						</span>
					) : null}
				</label>

				<div className="grid gap-4 sm:grid-cols-2">
					<label className="grid gap-2">
						<span className="text-sm font-semibold text-darknavy">
							Type <span className="text-coralpink">*</span>
						</span>
						<select
							value={page.values.type}
							disabled={page.isReadonly}
							onChange={(event) =>
								page.handleInputChange(
									"type",
									event.target.value as PaymentTypeClassification,
								)
							}
							className={fieldClassName}
						>
							<option value="">Select type</option>
							{PaymentTypeOptions.map((typeOption) => (
								<option key={typeOption} value={typeOption}>
									{typeOption}
								</option>
							))}
						</select>
						{page.errors.type ? (
							<span className="text-xs font-semibold text-coralpink">
								{page.errors.type}
							</span>
						) : null}
					</label>

					<label className="grid gap-2">
						<span className="text-sm font-semibold text-darknavy">
							Status <span className="text-coralpink">*</span>
						</span>
						<select
							value={page.values.status}
							disabled={page.isReadonly}
							onChange={(event) =>
								page.handleInputChange(
									"status",
									event.target.value as PaymentTypeStatus,
								)
							}
							className={fieldClassName}
						>
							<option value="Active">Active</option>
							<option value="Inactive">Inactive</option>
						</select>
						{page.errors.status ? (
							<span className="text-xs font-semibold text-coralpink">
								{page.errors.status}
							</span>
						) : null}
					</label>
				</div>
			</form>
		</MaintenanceFormDrawer>
	);
}

const fieldClassName =
	"h-11 w-full rounded-lg border border-darknavy/12 bg-white px-3 text-sm font-medium text-darknavy outline-none transition focus:border-skyblue/45 focus:ring-4 focus:ring-skyblue/15 disabled:bg-darknavy/5 read-only:bg-darknavy/5";
