"use client";

import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import {
	MasterPlanAndPackagePricingKindOptions,
	MasterPlanAndPackagesHref,
	MasterPlanAndPackageStatusOptions,
	MasterPlanAndPackageUserLimitKindOptions,
} from "@/app/src/constants/master/plan-and-packages/MasterPlanAndPackageConstants";
import { useMasterPlanAndPackageFormPage } from "@/app/src/hooks/master/plan-and-packages/useMasterPlanAndPackageFormPage";
import type {
	MasterPlanAndPackageFormErrors,
	MasterPlanAndPackageFormValues,
	MasterPlanAndPackagePricingKind,
	MasterPlanAndPackageStatus,
	MasterPlanAndPackageUserLimitKind,
} from "@/app/src/types/master/plan-and-packages/MasterPlanAndPackageTypes";
import {
	ModuleHeader,
	moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";
import { ModuleNotFound } from "@/app/src/ui/shared/module/ModuleNotFound";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";

const ControlClassName =
	"h-11 w-full rounded-lg border border-darknavy/10 bg-white px-3 text-sm font-semibold text-darknavy shadow-sm transition placeholder:text-darknavy/35 focus:border-skyblue focus:outline-none focus:ring-4 focus:ring-skyblue/15";
const FieldLabelClassName = "grid gap-1.5 text-sm font-semibold text-darknavy/58";

type MasterPlanAndPackageFormPageProps = {
	mode: "add" | "edit";
	recordId?: string;
};

export function MasterPlanAndPackageFormPage({
	mode,
	recordId,
}: MasterPlanAndPackageFormPageProps) {
	const page = useMasterPlanAndPackageFormPage({ mode, recordId });

	if (page.isMissingRecord) {
		return (
			<ModuleNotFound
				title="Plan not found"
				description="The selected plan record is not available in the master plan list."
				actionHref={MasterPlanAndPackagesHref}
				actionLabel="Back to plans"
			/>
		);
	}

	return (
		<section className="grid gap-5">
			<ModuleHeader
				variant="card"
				titleAs="h1"
				eyebrow="Subscription & Billing"
				title={mode === "edit" ? "Edit Plan" : "Add Plan"}
				description="Set the plan identity, billing model, user allowance, and feature notes."
				actions={
					<>
						<Link
							href={MasterPlanAndPackagesHref}
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
			<MasterPlanAndPackageForm
				errors={page.errors}
				values={page.values}
				onSave={page.saveRecord}
				onUpdate={page.updateValues}
			/>
		</section>
	);
}

function MasterPlanAndPackageForm({
	errors,
	values,
	onSave,
	onUpdate,
}: {
	errors: MasterPlanAndPackageFormErrors;
	values: MasterPlanAndPackageFormValues;
	onSave: () => void;
	onUpdate: (values: Partial<MasterPlanAndPackageFormValues>) => void;
}) {
	const usesStandardAmount = values.pricingKind !== "Percent Off";

	return (
		<div className="overflow-hidden rounded-lg border border-darknavy/10 bg-white shadow-sm">
			<div className="grid gap-5 p-5 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
				<div className="grid content-start gap-4">
					<div className="grid gap-4 md:grid-cols-2">
						<TextField
							error={errors.name}
							label="Plan name"
							value={values.name}
							onChange={(name) => onUpdate({ name })}
						/>
						<TextField
							error={errors.code}
							label="Plan code"
							value={values.code}
							onChange={(code) => onUpdate({ code: code.toUpperCase() })}
						/>
					</div>
					<SelectField
						label="Status"
						value={values.status}
						options={MasterPlanAndPackageStatusOptions}
						onChange={(status) =>
							onUpdate({ status: status as MasterPlanAndPackageStatus })
						}
					/>
					<label className={FieldLabelClassName}>
						Description
						<textarea
							value={values.description}
							onChange={(event) =>
								onUpdate({ description: event.target.value })
							}
							rows={4}
							className="min-h-28 rounded-lg border border-darknavy/10 bg-white px-3 py-3 text-sm font-medium leading-6 text-darknavy shadow-sm transition placeholder:text-darknavy/35 focus:border-skyblue focus:outline-none focus:ring-4 focus:ring-skyblue/15"
						/>
						<FieldError message={errors.description} />
					</label>
					<label className={FieldLabelClassName}>
						Features
						<textarea
							value={values.features}
							onChange={(event) => onUpdate({ features: event.target.value })}
							rows={4}
							className="min-h-28 rounded-lg border border-darknavy/10 bg-white px-3 py-3 text-sm font-medium leading-6 text-darknavy shadow-sm transition placeholder:text-darknavy/35 focus:border-skyblue focus:outline-none focus:ring-4 focus:ring-skyblue/15"
						/>
						<FieldError message={errors.features} />
					</label>
				</div>

				<div className="grid content-start gap-4">
					<section className="grid gap-4 rounded-lg border border-darknavy/10 bg-offwhite/35 p-4">
						<div>
							<h2 className="text-base font-semibold text-darknavy">
								Pricing
							</h2>
							<p className="mt-1 text-sm text-darknavy/55">
								Supports monthly, interval, yearly, transactional, and percent-off pricing.
							</p>
						</div>
						<SelectField
							label="Pricing type"
							value={values.pricingKind}
							options={MasterPlanAndPackagePricingKindOptions}
							onChange={(pricingKind) =>
								onUpdate({
									pricingKind:
										pricingKind as MasterPlanAndPackagePricingKind,
								})
							}
						/>
						{usesStandardAmount ? (
							<NumberField
								error={errors.amount}
								label="Amount"
								value={values.amount}
								onChange={(amount) => onUpdate({ amount })}
							/>
						) : (
							<div className="grid gap-4 md:grid-cols-2">
								<NumberField
									error={errors.baseAmount}
									label="Base amount"
									value={values.baseAmount}
									onChange={(baseAmount) => onUpdate({ baseAmount })}
								/>
								<NumberField
									error={errors.percentOff}
									label="Percent off"
									value={values.percentOff}
									onChange={(percentOff) => onUpdate({ percentOff })}
								/>
							</div>
						)}
						{values.pricingKind === "Interval" ? (
							<NumberField
								error={errors.intervalMonths}
								label="Every x months"
								value={values.intervalMonths}
								onChange={(intervalMonths) => onUpdate({ intervalMonths })}
							/>
						) : null}
						{values.pricingKind === "Transactional" ? (
							<TextField
								error={errors.unitLabel}
								label="Transactional unit"
								value={values.unitLabel}
								onChange={(unitLabel) => onUpdate({ unitLabel })}
							/>
						) : null}
						{values.pricingKind === "Percent Off" ? (
							<TextField
								error={errors.billingLabel}
								label="Discount applies to"
								value={values.billingLabel}
								onChange={(billingLabel) => onUpdate({ billingLabel })}
							/>
						) : null}
					</section>

					<section className="grid gap-4 rounded-lg border border-darknavy/10 bg-offwhite/35 p-4">
						<div>
							<h2 className="text-base font-semibold text-darknavy">
								Users
							</h2>
							<p className="mt-1 text-sm text-darknavy/55">
								Set fixed seats, a user range, or included free users followed by add-ons.
							</p>
						</div>
						<SelectField
							label="User rule"
							value={values.userLimitKind}
							options={MasterPlanAndPackageUserLimitKindOptions}
							onChange={(userLimitKind) =>
								onUpdate({
									userLimitKind:
										userLimitKind as MasterPlanAndPackageUserLimitKind,
								})
							}
						/>
						{values.userLimitKind === "Fixed" ? (
							<NumberField
								error={errors.userIncludedFree}
								label="Fixed users"
								value={values.userIncludedFree}
								onChange={(userIncludedFree) =>
									onUpdate({ userIncludedFree })
								}
							/>
						) : null}
						{values.userLimitKind === "Range" ? (
							<div className="grid gap-4 md:grid-cols-2">
								<NumberField
									error={errors.userMin}
									label="Minimum users"
									value={values.userMin}
									onChange={(userMin) => onUpdate({ userMin })}
								/>
								<NumberField
									error={errors.userMax}
									label="Maximum users"
									value={values.userMax}
									onChange={(userMax) => onUpdate({ userMax })}
								/>
							</div>
						) : null}
						{values.userLimitKind === "Add-on" ? (
							<div className="grid gap-4 md:grid-cols-3">
								<NumberField
									error={errors.userIncludedFree}
									label="Free users"
									value={values.userIncludedFree}
									onChange={(userIncludedFree) =>
										onUpdate({ userIncludedFree })
									}
								/>
								<NumberField
									error={errors.userAddOnStart}
									label="Add-on starts at"
									value={values.userAddOnStart}
									onChange={(userAddOnStart) =>
										onUpdate({ userAddOnStart })
									}
								/>
								<NumberField
									error={errors.userAddOnPrice}
									label="Add-on price"
									value={values.userAddOnPrice}
									onChange={(userAddOnPrice) =>
										onUpdate({ userAddOnPrice })
									}
								/>
							</div>
						) : null}
					</section>

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
