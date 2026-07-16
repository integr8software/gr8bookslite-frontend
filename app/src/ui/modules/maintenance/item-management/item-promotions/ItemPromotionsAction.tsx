"use client";

import { formatCurrency } from "@/app/src/utils/currency.util";
import Link from "next/link";
import { useParams, usePathname, useRouter } from "next/navigation";
import { ArrowLeft, BadgePercent, Save } from "lucide-react";
import {
	useEffect,
	useMemo,
	useState,
	type FormEvent,
	type KeyboardEvent,
	type ReactNode,
} from "react";
import { useItemManagementStore } from "@/app/src/hooks/modules/maintenance/item-management/useItemManagement";
import { useDiscountManagementStore } from "@/app/src/hooks/modules/maintenance/discount-management/useDiscountManagement";
import { getMaintenanceSavePendingLabel } from "@/app/src/ui/modules/maintenance/shared/MaintenanceLoadingLabels";
import {
	AppAdvancedDropdown,
	type AppAdvancedDropdownOption,
} from "@/app/src/ui/shared/advanced-dropdown/AppAdvancedDropdown";
import {
	ModuleHeader,
	moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";
import { AppDialog } from "@/app/src/ui/shared/app/AppDialog";
import { useAppDialogFormSubmit } from "@/app/src/hooks/shared/app/useAppDialogFormSubmit";

const ItemPromotionsHref = "/maintenance/item-management/item-promotions";
const ItemPromotionsFormId = "item-promotions-form";

type PromotionMode = "add" | "edit" | "view";
type PromotionType =
	| "Buy 1 Take 1"
	| "Bundle Discount"
	| "Fixed Discount"
	| "Percentage Discount";

type PromotionFormValues = {
	code: string;
	name: string;
	type: PromotionType;
	itemId: string;
	bundleId: string;
	discountId: string;
	freeItemId: string;
	value: number;
	startDate: string;
	endDate: string;
	minimumQuantity: number;
	status: "Active" | "Inactive";
};

const SamplePromotions: Array<PromotionFormValues & { id: string }> = [
	{
		id: "promo-buy-one",
		code: "PROMO-001",
		name: "Buy 1 Take 1 Receipt Roll",
		type: "Buy 1 Take 1",
		itemId: "item-thermal-roll",
		bundleId: "",
		discountId: "d_002",
		freeItemId: "item-thermal-roll",
		value: 0,
		startDate: "2026-06-01",
		endDate: "2026-06-30",
		minimumQuantity: 1,
		status: "Active",
	},
	{
		id: "promo-bundle",
		code: "PROMO-002",
		name: "Starter Bundle Discount",
		type: "Bundle Discount",
		itemId: "item-starter-bundle",
		bundleId: "bundle-office-starter",
		discountId: "d_004",
		freeItemId: "",
		value: 250,
		startDate: "2026-06-01",
		endDate: "2026-07-15",
		minimumQuantity: 1,
		status: "Active",
	},
	{
		id: "promo-vip",
		code: "PROMO-003",
		name: "VIP Paper Discount",
		type: "Percentage Discount",
		itemId: "item-paper-a4",
		bundleId: "",
		discountId: "d_003",
		freeItemId: "",
		value: 10,
		startDate: "2026-05-01",
		endDate: "2026-05-31",
		minimumQuantity: 1,
		status: "Inactive",
	},
];

export function ItemPromotionsAction() {
	const router = useRouter();
	const pathname = usePathname();
	const params = useParams<{ recordId?: string }>();
	const { itemBundles, items } = useItemManagementStore();
	const { discounts } = useDiscountManagementStore();
	const mode = getMode(pathname);
	const isReadonly = mode === "view";
	const existingPromotion = SamplePromotions.find(
		(promotion) => promotion.id === params.recordId,
	);
	const itemOptions = useMemo(
		() =>
			items
				.filter((item) => item.status === "Active")
				.map<AppAdvancedDropdownOption>((item) => ({
					description: item.code,
					name: item.name,
					value: item.id,
				})),
		[items],
	);
	const bundleOptions = useMemo(
		() =>
			itemBundles
				.filter((bundle) => bundle.status === "Active")
				.map<AppAdvancedDropdownOption>((bundle) => ({
					description: `${bundle.code} | ${formatCurrency(bundle.bundlePrice)}`,
					name: bundle.name,
					value: bundle.id,
				})),
		[itemBundles],
	);
	const discountOptions = useMemo(
		() =>
			discounts
				.filter((discount) => discount.status === "Active")
				.map<AppAdvancedDropdownOption>((discount) => ({
					description: `${discount.discountType} | ${formatCurrency(discount.amount)} | ${discount.accountTitle ?? "No account"}`,
					name: discount.name,
					value: discount.id,
				})),
		[discounts],
	);
	const [values, setValues] = useState<PromotionFormValues>(() =>
		existingPromotion
			? { ...existingPromotion }
			: {
					code: `PROMO-${Date.now().toString().slice(-3)}`,
					bundleId: "",
					discountId: "",
					endDate: "",
					freeItemId: "",
					itemId: "",
					minimumQuantity: 1,
					name: "",
					startDate: "",
					status: "Active",
					type: "Percentage Discount",
					value: 0,
				},
	);
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
	const selectedItem = items.find((item) => item.id === values.itemId);
	const freeItem = items.find((item) => item.id === values.freeItemId);
	const selectedDiscount = discounts.find(
		(discount) => discount.id === values.discountId,
	);
	const selectedBundle = itemBundles.find(
		(bundle) => bundle.id === values.bundleId,
	);
	const sellingPrice = selectedItem?.sellingPrice ?? 0;
	const effectivePrice = getEffectivePrice(values.type, sellingPrice, values.value);

	function updateField<TKey extends keyof PromotionFormValues>(
		field: TKey,
		value: PromotionFormValues[TKey],
	) {
		if (isReadonly) {
			return;
		}

		setValues((current) => ({ ...current, [field]: value }));
	}

	function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();

		if (!isReadonly) {
			router.push(ItemPromotionsHref);
		}
	}

	return (
		<form
			id={ItemPromotionsFormId}
			onSubmit={handleSubmit}
			className="grid gap-5"
		>
			<ModuleHeader
				variant="panel"
				titleAs="h1"
				title={isReadonly ? values.name || "Item Promotion" : "Item Promotion"}
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
						{!isReadonly ? (
							<button
								type="button"
								onClick={() => setIsSaveDialogOpen(true)}
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
					mode === "edit"
						? "This will update the selected item promotion with your latest changes."
						: "This will create a new item promotion using the details you entered."
				}
				iconTone="question"
				isOpen={isSaveDialogOpen}
				isPending={isConfirmSubmitPending}
				pendingLabel={getMaintenanceSavePendingLabel(mode)}
				title={
					mode === "edit"
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
					<Field label="Promotion Code">
						<input
							value={values.code}
							readOnly={isReadonly}
							onChange={(event) => updateField("code", event.target.value)}
							className={fieldClassName}
							placeholder="PROMO-004"
						/>
					</Field>
					<Field label="Promotion Name">
						<input
							value={values.name}
							readOnly={isReadonly}
							onChange={(event) => updateField("name", event.target.value)}
							className={fieldClassName}
							placeholder="Dealer Item Discount"
						/>
					</Field>
					<Field label="Status">
						<select
							value={values.status}
							disabled={isReadonly}
							onChange={(event) =>
								updateField("status", event.target.value as PromotionFormValues["status"])
							}
							className={fieldClassName}
						>
							<option>Active</option>
							<option>Inactive</option>
						</select>
					</Field>
					<Field label="Promotion Type">
						<select
							value={values.type}
							disabled={isReadonly}
							onChange={(event) =>
								updateField("type", event.target.value as PromotionType)
							}
							className={fieldClassName}
						>
							<option>Percentage Discount</option>
							<option>Fixed Discount</option>
							<option>Bundle Discount</option>
							<option>Buy 1 Take 1</option>
						</select>
					</Field>
					<Field label="Discount Management Rule">
						<AppAdvancedDropdown
							menuPortal
							options={discountOptions}
							placeholder="Select accounting discount rule"
							readOnly={isReadonly}
							value={values.discountId}
							onChange={(value) => updateField("discountId", String(value))}
							onSelectOption={(option) => updateField("discountId", option.value)}
						/>
					</Field>
					<Field label="Minimum Quantity">
						<DecimalInput
							value={values.minimumQuantity}
							readOnly={isReadonly}
							onChange={(value) => updateField("minimumQuantity", value)}
						/>
					</Field>
					<Field label={values.type === "Percentage Discount" ? "Discount Percent" : "Discount Amount"}>
						<DecimalInput
							value={values.value}
							readOnly={isReadonly || values.type === "Buy 1 Take 1"}
							onChange={(value) => updateField("value", value)}
						/>
					</Field>
					<Field label="Item">
						<AppAdvancedDropdown
							menuPortal
							options={itemOptions}
							placeholder="Select item"
							readOnly={isReadonly}
							value={values.itemId}
							onChange={(value) => updateField("itemId", String(value))}
							onSelectOption={(option) => updateField("itemId", option.value)}
						/>
					</Field>
					{values.type === "Bundle Discount" ? (
						<Field label="Bundle">
							<AppAdvancedDropdown
								menuPortal
								options={bundleOptions}
								placeholder="Select bundle"
								readOnly={isReadonly}
								value={values.bundleId}
								onChange={(value) => updateField("bundleId", String(value))}
								onSelectOption={(option) => updateField("bundleId", option.value)}
							/>
						</Field>
					) : null}
					{values.type === "Buy 1 Take 1" ? (
						<Field label="Free Item">
							<AppAdvancedDropdown
								menuPortal
								options={itemOptions}
								placeholder="Select free item"
								readOnly={isReadonly}
								value={values.freeItemId}
								onChange={(value) => updateField("freeItemId", String(value))}
								onSelectOption={(option) => updateField("freeItemId", option.value)}
							/>
						</Field>
					) : null}
					<Field label="Start Date">
						<input
							type="date"
							value={values.startDate}
							readOnly={isReadonly}
							onChange={(event) => updateField("startDate", event.target.value)}
							className={fieldClassName}
						/>
					</Field>
					<Field label="End Date">
						<input
							type="date"
							value={values.endDate}
							readOnly={isReadonly}
							onChange={(event) => updateField("endDate", event.target.value)}
							className={fieldClassName}
						/>
					</Field>
				</div>
			</section>
			<section className="grid gap-3 rounded-lg border border-darknavy/10 bg-white p-5 shadow-sm sm:grid-cols-4">
				<SummaryTile label="Original Price" value={formatCurrency(sellingPrice)} />
				<SummaryTile
					label="Promo Price"
					value={
						values.type === "Buy 1 Take 1"
							? "Free item"
							: formatCurrency(effectivePrice)
					}
				/>
				<SummaryTile
					label="Customer Saves"
					value={
						values.type === "Buy 1 Take 1"
							? formatCurrency(freeItem?.sellingPrice ?? sellingPrice)
							: formatCurrency(Math.max(sellingPrice - effectivePrice, 0))
					}
				/>
				<SummaryTile
					label="Coverage"
					value={
						values.startDate && values.endDate
							? `${values.startDate} to ${values.endDate}`
							: "No date range"
					}
				/>
				<SummaryTile
					label="Accounting Rule"
					value={
						selectedDiscount
							? `${selectedDiscount.name} -> ${selectedDiscount.accountTitle ?? "No account"}`
							: "No discount rule"
					}
				/>
				<SummaryTile
					label="Bundle Link"
					value={selectedBundle ? selectedBundle.name : "No bundle link"}
				/>
			</section>
		</form>
	);
}

function Field({ children, label }: { children: ReactNode; label: string }) {
	return (
		<label>
			<span className="mb-2 block text-sm font-semibold text-darknavy">{label}</span>
			{children}
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

function getEffectivePrice(type: PromotionType, sellingPrice: number, value: number) {
	if (type === "Percentage Discount") {
		return Math.max(sellingPrice - sellingPrice * (value / 100), 0);
	}

	if (type === "Fixed Discount" || type === "Bundle Discount") {
		return Math.max(sellingPrice - value, 0);
	}

	return sellingPrice;
}

function getMode(pathname: string): PromotionMode {
	if (pathname.includes("/view/")) {
		return "view";
	}

	if (pathname.includes("/edit/")) {
		return "edit";
	}

	return "add";
}

const fieldClassName =
	"min-h-11 w-full rounded-md border border-darknavy/15 bg-white px-3 text-sm font-medium text-darknavy outline-none transition placeholder:text-darknavy/35 focus:border-skyblue focus:ring-2 focus:ring-skyblue/20 read-only:bg-offwhite/65 disabled:cursor-default disabled:bg-offwhite/65";
