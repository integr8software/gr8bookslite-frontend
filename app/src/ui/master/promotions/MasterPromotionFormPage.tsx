"use client";

import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import {
	MasterPromotionDiscountKindOptions,
	MasterPromotionStatusOptions,
	MasterPromotionTargetOptions,
	MasterPromotionTypeOptions,
	MasterPromotionsHref,
} from "@/app/src/constants/master/promotions/MasterPromotionConstants";
import { useMasterPromotionFormPage } from "@/app/src/hooks/master/promotions/useMasterPromotionFormPage";
import type {
	MasterPromotionDiscountKind,
	MasterPromotionFormErrors,
	MasterPromotionFormValues,
	MasterPromotionStatus,
	MasterPromotionType,
} from "@/app/src/types/master/promotions/MasterPromotionTypes";
import {
	ModuleHeader,
	moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";
import { ModuleNotFound } from "@/app/src/ui/shared/module/ModuleNotFound";
import { AppAdvancedDropdown } from "@/app/src/ui/shared/advanced-dropdown/AppAdvancedDropdown";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";

const ControlClassName =
	"h-11 w-full rounded-lg border border-darknavy/10 bg-white px-3 text-sm font-semibold text-darknavy shadow-sm transition placeholder:text-darknavy/35 focus:border-skyblue focus:outline-none focus:ring-4 focus:ring-skyblue/15";
const FieldLabelClassName = "grid gap-1.5 text-sm font-semibold text-darknavy/58";

type MasterPromotionFormPageProps = {
	mode: "add" | "edit";
	recordId?: string;
};

export function MasterPromotionFormPage({
	mode,
	recordId,
}: MasterPromotionFormPageProps) {
	const page = useMasterPromotionFormPage({ mode, recordId });

	if (page.isMissingRecord) {
		return (
			<ModuleNotFound
				title="Promotion not found"
				description="The selected promotion record is not available in the promotions list."
				actionHref={MasterPromotionsHref}
				actionLabel="Back to promotions"
			/>
		);
	}

	return (
		<section className="grid gap-5">
			<ModuleHeader
				variant="card"
				titleAs="h1"
				eyebrow="Discounts"
				title={mode === "edit" ? "Edit Promotion" : "Add Promotion"}
				description="Set the campaign identity, target, value, expiry date, and status."
				actions={
					<>
						<Link
							href={MasterPromotionsHref}
							className={moduleHeaderActionClassNames.secondary}
						>
							<ArrowLeft className="h-4 w-4" aria-hidden="true" />
							Back
						</Link>
						<button
							type="button"
							onClick={page.saveRecord}
							className={moduleHeaderActionClassNames.primary}
						>
							<Save className="h-4 w-4" aria-hidden="true" />
							Save
						</button>
					</>
				}
			/>
			<MasterPromotionForm
				errors={page.errors}
				values={page.values}
				onSave={page.saveRecord}
				onUpdate={page.updateValues}
			/>
		</section>
	);
}

function MasterPromotionForm({
	errors,
	values,
	onSave,
	onUpdate,
}: {
	errors: MasterPromotionFormErrors;
	values: MasterPromotionFormValues;
	onSave: () => void;
	onUpdate: (values: Partial<MasterPromotionFormValues>) => void;
}) {
	return (
		<div className="overflow-hidden rounded-lg border border-darknavy/10 bg-white shadow-sm">
			<div className="grid gap-5 p-5 xl:grid-cols-2">
				<div className="grid content-start gap-4">
					<div className="grid gap-4 md:grid-cols-2">
						<TextField
							error={errors.name}
							label="Name"
							value={values.name}
							onChange={(name) => onUpdate({ name })}
						/>
						<TextField
							error={errors.code}
							label="Code"
							value={values.code}
							onChange={(code) => onUpdate({ code: code.toUpperCase() })}
						/>
					</div>
					<label className={FieldLabelClassName}>
						Description
						<textarea
							value={values.description}
							onChange={(event) =>
								onUpdate({ description: event.target.value })
							}
							rows={5}
							className="min-h-32 rounded-lg border border-darknavy/10 bg-white px-3 py-3 text-sm font-medium leading-6 text-darknavy shadow-sm transition placeholder:text-darknavy/35 focus:border-skyblue focus:outline-none focus:ring-4 focus:ring-skyblue/15"
						/>
						<FieldError message={errors.description} />
					</label>
					<SelectField
						label="Status"
						value={values.status}
						options={MasterPromotionStatusOptions}
						onChange={(status) =>
							onUpdate({ status: status as MasterPromotionStatus })
						}
					/>
				</div>
				<div className="grid content-start gap-4">
					<div className="grid gap-4 md:grid-cols-2">
						<SelectField
							label="Type"
							value={values.type}
							options={MasterPromotionTypeOptions}
							onChange={(type) =>
								onUpdate({ type: type as MasterPromotionType })
							}
						/>
						<label className={FieldLabelClassName}>
							Target plan
							<AppAdvancedDropdown
								menuPortal
								options={MasterPromotionTargetOptions}
								placeholder="Select target plan"
								searchPlaceholder="Search plans"
								showSelectedDetails
								value={values.target}
								onChange={(target) =>
									onUpdate({
										target: Array.isArray(target)
											? target[0] ?? ""
											: target,
									})
								}
							/>
							<FieldError message={errors.target} />
						</label>
					</div>
					<div className="grid gap-4 md:grid-cols-2">
						<SelectField
							label="Discount"
							value={values.discountKind}
							options={MasterPromotionDiscountKindOptions}
							onChange={(discountKind) =>
								onUpdate({
									discountKind:
										discountKind as MasterPromotionDiscountKind,
								})
							}
						/>
						<NumberField
							error={errors.value}
							label="Value"
							value={values.value}
							onChange={(value) => onUpdate({ value })}
						/>
					</div>
					<label className={FieldLabelClassName}>
						Expires
						<input
							type="date"
							value={values.expiresAt}
							onChange={(event) =>
								onUpdate({ expiresAt: event.target.value })
							}
							className={ControlClassName}
						/>
						<FieldError message={errors.expiresAt} />
					</label>
					<div className="flex justify-end">
						<button
							type="button"
							onClick={onSave}
							className={moduleHeaderActionClassNames.primary}
						>
							<Save className="h-4 w-4" aria-hidden="true" />
							Save
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}

function TextField({
	error,
	label,
	value,
	onChange,
}: {
	error?: string;
	label: string;
	value: string;
	onChange: (value: string) => void;
}) {
	return (
		<label className={FieldLabelClassName}>
			{label}
			<input
				value={value}
				onChange={(event) => onChange(event.target.value)}
				className={ControlClassName}
			/>
			<FieldError message={error} />
		</label>
	);
}

function NumberField({
	error,
	label,
	value,
	onChange,
}: {
	error?: string;
	label: string;
	value: number;
	onChange: (value: number) => void;
}) {
	return (
		<label className={FieldLabelClassName}>
			{label}
			<input
				type="number"
				min={0}
				value={value}
				onChange={(event) => onChange(toNumber(event.target.value))}
				className={ControlClassName}
			/>
			<FieldError message={error} />
		</label>
	);
}

function SelectField<TOption extends string>({
	label,
	options,
	value,
	onChange,
}: {
	label: string;
	options: readonly TOption[];
	value: string;
	onChange: (value: string) => void;
}) {
	return (
		<label className={FieldLabelClassName}>
			{label}
			<select
				value={value}
				onChange={(event) => onChange(event.target.value)}
				className={joinClasses(ControlClassName, "app-select-control")}
			>
				{options.map((option) => (
					<option key={option} value={option}>
						{option}
					</option>
				))}
			</select>
		</label>
	);
}

function FieldError({ message }: { message?: string }) {
	if (!message) {
		return null;
	}

	return <span className="text-xs font-semibold text-coralpink">{message}</span>;
}

function toNumber(value: string) {
	const parsedValue = Number(value);

	return Number.isFinite(parsedValue) ? parsedValue : 0;
}
