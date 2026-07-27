"use client";

import { useEffect, useState, type KeyboardEvent, type ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, BadgePercent, Save } from "lucide-react";
import { formatCurrency } from "@/app/src/utils/currency.util";
import {
	ItemPromotionsFormId,
	ItemPromotionsHref,
	ItemPromotionTypeOptions,
} from "@/app/src/constants/modules/item-management/item-promotions/ItemPromotionsConstants";
import { useItemPromotionsFormPage } from "@/app/src/hooks/modules/item-management/item-promotions/useItemPromotionsFormPage";
import type { ItemPromotionType } from "@/app/src/types/modules/item-management/item-promotions/ItemPromotionsTypes";
import { getModuleSavePendingLabel } from "@/app/src/ui/shared/module/ModuleDrawer";
import { AppAdvancedDropdown } from "@/app/src/ui/shared/advanced-dropdown/AppAdvancedDropdown";
import {
	ModuleHeader,
	moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";
import { AppDialog } from "@/app/src/ui/shared/app/AppDialog";
import { useAppDialogFormSubmit } from "@/app/src/hooks/shared/app/useAppDialogFormSubmit";

export function ItemPromotionsFormPage() {
	const page = useItemPromotionsFormPage();
	const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
	const {
		closeDialog: closeSaveDialog,
		isConfirmSubmitPending,
		submitFromDialog,
	} = useAppDialogFormSubmit({
		formId: ItemPromotionsFormId,
		isDialogOpen: isSaveDialogOpen,
		isSubmitting: false,
		onDialogOpenChange: setIsSaveDialogOpen,
	});

	return (
		<form
			id={ItemPromotionsFormId}
			onSubmit={page.handleSubmit}
			className="grid gap-5"
		>
			<ModuleHeader
				variant="panel"
				titleAs="h1"
				title={page.isReadonly ? page.values.name || "Item Promotion" : "Item Promotion"}
				description="Create or update item-level promotions with selected items, date coverage, quantity trigger, and computed price impact."
				eyebrow={
					<>
						<BadgePercent className="h-3.5 w-3.5" aria-hidden="true" />
						Item management
					</>
				}
				actions={
					<>
						<Link href={ItemPromotionsHref} className={moduleHeaderActionClassNames.secondary}>
							<ArrowLeft className="h-4 w-4" aria-hidden="true" />
							Back
						</Link>
						{!page.isReadonly ? (
							<button
								type="button"
								onClick={() => {
									if (page.validateBeforeSubmit()) {
										setIsSaveDialogOpen(true);
									}
								}}
								className={moduleHeaderActionClassNames.primary}
							>
								<Save className="h-4 w-4" aria-hidden="true" />
								Save Promotion
							</button>
						) : null}
					</>
				}
			/>
			<AppDialog
				confirmLabel="Confirm"
				description={
					page.mode === "edit"
						? "This will update the selected item promotion with your latest changes."
						: "This will create a new item promotion using the details you entered."
				}
				iconTone="question"
				isOpen={isSaveDialogOpen}
				isPending={isConfirmSubmitPending}
				pendingLabel={getModuleSavePendingLabel(page.mode)}
				title={
					page.mode === "edit"
						? "Save item promotion changes?"
						: "Save this item promotion?"
				}
				tone="success"
				onCancel={closeSaveDialog}
				onConfirm={submitFromDialog}
			/>
			<section className="rounded-lg border border-darknavy/10 bg-white p-5 shadow-sm">
				<h2 className="text-base font-semibold text-darknavy">Promotion Details</h2>
				<div className="mt-4 grid gap-4 md:grid-cols-3">
					<Field label="Promotion Code" error={page.errors.code} required>
						<input
							value={page.values.code}
							readOnly={page.isReadonly}
							onChange={(event) => page.updateField("code", event.target.value)}
							className={fieldClassName}
							placeholder="PROMO-004"
						/>
					</Field>
					<Field label="Promotion Name" error={page.errors.name} required>
						<input
							value={page.values.name}
							readOnly={page.isReadonly}
							onChange={(event) => page.updateField("name", event.target.value)}
							className={fieldClassName}
							placeholder="Dealer Item Discount"
						/>
					</Field>
					<Field label="Status" required>
						<select
							value={page.values.status}
							disabled={page.isReadonly}
							onChange={(event) =>
								page.updateField("status", event.target.value as typeof page.values.status)
							}
							className={fieldClassName}
						>
							<option>Active</option>
							<option>Inactive</option>
						</select>
					</Field>
					<Field label="Promotion Type" required>
						<select
							value={page.values.type}
							disabled={page.isReadonly}
							onChange={(event) =>
								page.updateField("type", event.target.value as ItemPromotionType)
							}
							className={fieldClassName}
						>
							{ItemPromotionTypeOptions.map((type) => (
								<option key={type}>{type}</option>
							))}
						</select>
					</Field>
					<Field label="Discount Maintenance Rule">
						<AppAdvancedDropdown
							menuPortal
							options={page.discountOptions}
							placeholder="--Select Accounting Discount Rule--"
							readOnly={page.isReadonly}
							value={page.values.discountId}
							onChange={(value) => page.updateField("discountId", String(value))}
							onSelectOption={(option) => page.updateField("discountId", option.value)}
						/>
					</Field>
					<Field label="Minimum Quantity" error={page.errors.minimumQuantity} required>
						<DecimalInput
							value={page.values.minimumQuantity}
							readOnly={page.isReadonly}
							onChange={(value) => page.updateField("minimumQuantity", value)}
						/>
					</Field>
					<Field
						label={page.values.type === "Percentage Discount" ? "Discount Percent" : "Discount Amount"}
						error={page.errors.value}
						required={page.values.type !== "Buy 1 Take 1"}
					>
						<DecimalInput
							value={page.values.value}
							readOnly={page.isReadonly || page.values.type === "Buy 1 Take 1"}
							onChange={(value) => page.updateField("value", value)}
						/>
					</Field>
					<Field label="Item" error={page.errors.itemId} required>
						<AppAdvancedDropdown
							menuPortal
							options={page.itemOptions}
							placeholder="--Select Item--"
							readOnly={page.isReadonly}
							value={page.values.itemId}
							onChange={(value) => page.updateField("itemId", String(value))}
							onSelectOption={(option) => page.updateField("itemId", option.value)}
						/>
					</Field>
					{page.values.type === "Bundle Discount" ? (
						<Field label="Bundle" error={page.errors.bundleId} required>
							<AppAdvancedDropdown
								menuPortal
								options={page.bundleOptions}
								placeholder="--Select Bundle--"
								readOnly={page.isReadonly}
								value={page.values.bundleId}
								onChange={(value) => page.updateField("bundleId", String(value))}
								onSelectOption={(option) => page.updateField("bundleId", option.value)}
							/>
						</Field>
					) : null}
					{page.values.type === "Buy 1 Take 1" ? (
						<Field label="Free Item" error={page.errors.freeItemId} required>
							<AppAdvancedDropdown
								menuPortal
								options={page.itemOptions}
								placeholder="--Select Free Item--"
								readOnly={page.isReadonly}
								value={page.values.freeItemId}
								onChange={(value) => page.updateField("freeItemId", String(value))}
								onSelectOption={(option) => page.updateField("freeItemId", option.value)}
							/>
						</Field>
					) : null}
					<Field label="Start Date">
						<input
							type="date"
							value={page.values.startDate}
							readOnly={page.isReadonly}
							onChange={(event) => page.updateField("startDate", event.target.value)}
							className={fieldClassName}
						/>
					</Field>
					<Field label="End Date" error={page.errors.endDate}>
						<input
							type="date"
							value={page.values.endDate}
							readOnly={page.isReadonly}
							onChange={(event) => page.updateField("endDate", event.target.value)}
							className={fieldClassName}
						/>
					</Field>
				</div>
			</section>
			<section className="grid gap-3 rounded-lg border border-darknavy/10 bg-white p-5 shadow-sm sm:grid-cols-4">
				<SummaryTile label="Original Price" value={formatCurrency(page.sellingPrice)} />
				<SummaryTile
					label="Promo Price"
					value={
						page.values.type === "Buy 1 Take 1"
							? "Free item"
							: formatCurrency(page.effectivePrice)
					}
				/>
				<SummaryTile
					label="Customer Saves"
					value={
						page.values.type === "Buy 1 Take 1"
							? formatCurrency(page.freeItem?.sellingPrice ?? page.sellingPrice)
							: formatCurrency(Math.max(page.sellingPrice - page.effectivePrice, 0))
					}
				/>
				<SummaryTile
					label="Coverage"
					value={
						page.values.startDate && page.values.endDate
							? `${page.values.startDate} to ${page.values.endDate}`
							: "No date range"
					}
				/>
				<SummaryTile
					label="Accounting Rule"
					value={
						page.selectedDiscount
							? `${page.selectedDiscount.name} -> ${page.selectedDiscount.accountTitle ?? "No account"}`
							: "No discount rule"
					}
				/>
				<SummaryTile
					label="Bundle Link"
					value={page.selectedBundle ? page.selectedBundle.name : "No bundle link"}
				/>
			</section>
		</form>
	);
}

function Field({
	children,
	error,
	label,
	required,
}: {
	children: ReactNode;
	error?: string;
	label: string;
	required?: boolean;
}) {
	return (
		<label>
			<span className="mb-2 block text-sm font-semibold text-darknavy">
				{label}
				{required ? <span className="text-coralpink"> *</span> : null}
			</span>
			{children}
			{error ? (
				<span className="mt-1 block text-xs font-medium text-coralpink">
					{error}
				</span>
			) : null}
		</label>
	);
}

function DecimalInput({
	readOnly,
	value,
	onChange,
}: {
	readOnly: boolean;
	value: number;
	onChange: (value: number) => void;
}) {
	const [draftValue, setDraftValue] = useState(String(value));

	useEffect(() => {
		// eslint-disable-next-line react-hooks/set-state-in-effect -- Keep the editable draft synchronized when parent numeric value changes.
		setDraftValue(String(value));
	}, [value]);

	function handleChange(nextValue: string) {
		if (/[eE+-]/.test(nextValue)) {
			return;
		}

		setDraftValue(nextValue);

		if (!nextValue.trim()) {
			return;
		}

		const parsedValue = Number(nextValue);

		if (Number.isFinite(parsedValue) && parsedValue >= 0) {
			onChange(parsedValue);
		}
	}

	function handleBlur() {
		if (!draftValue.trim()) {
			onChange(0);
			setDraftValue("0");
		}
	}

	function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
		if (["e", "E", "+", "-"].includes(event.key)) {
			event.preventDefault();
		}
	}

	return (
		<input
			type="number"
			min={0}
			step="any"
			inputMode="decimal"
			value={draftValue}
			readOnly={readOnly}
			onBlur={handleBlur}
			onChange={(event) => handleChange(event.target.value)}
			onKeyDown={handleKeyDown}
			className={`${fieldClassName} text-right`}
		/>
	);
}

function SummaryTile({ label, value }: { label: string; value: string }) {
	return (
		<div className="rounded-md border border-darknavy/10 bg-offwhite/45 p-4">
			<div className="text-xs font-semibold uppercase tracking-wide text-darknavy/45">{label}</div>
			<div className="mt-2 text-base font-semibold text-darknavy">{value}</div>
		</div>
	);
}

const fieldClassName =
	"min-h-11 w-full rounded-md border border-darknavy/15 bg-white px-3 text-sm font-medium text-darknavy outline-none transition placeholder:text-darknavy/35 focus:border-skyblue focus:ring-2 focus:ring-skyblue/20 read-only:bg-offwhite/65 disabled:cursor-default disabled:bg-offwhite/65";
