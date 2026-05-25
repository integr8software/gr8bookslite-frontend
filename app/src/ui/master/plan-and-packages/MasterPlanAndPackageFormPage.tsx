"use client";

import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import {
	MasterPlanAndPackageFeatureOptions,
	MasterPlanAndPackagePricingKindOptions,
	MasterPlanAndPackagesHref,
	MasterPlanAndPackageScaleKindOptions,
	MasterPlanAndPackageScaleUnitLabels,
	MasterPlanAndPackageStatusOptions,
} from "@/app/src/constants/master/plan-and-packages/MasterPlanAndPackageConstants";
import { useMasterPlanAndPackageFormPage } from "@/app/src/hooks/master/plan-and-packages/useMasterPlanAndPackageFormPage";
import type {
	MasterPlanAndPackageFormErrors,
	MasterPlanAndPackageFormValues,
	MasterPlanAndPackagePricingKind,
	MasterPlanAndPackageScaleKind,
	MasterPlanAndPackageStatus,
} from "@/app/src/types/master/plan-and-packages/MasterPlanAndPackageTypes";
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
const FeatureDropdownOptions = MasterPlanAndPackageFeatureOptions.map((feature) => ({
	description: feature.description,
	label: feature.section,
	name: feature.name,
	value: feature.id,
}));

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
				description="Set the plan identity, billing model, module entitlements, and scale pricing rules."
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
						<SelectField
							label="Status"
							value={values.status}
							options={MasterPlanAndPackageStatusOptions}
							onChange={(status) =>
								onUpdate({ status: status as MasterPlanAndPackageStatus })
							}
						/>
					</div>
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
						Module features
						<AppAdvancedDropdown
							menuPortal
							options={FeatureDropdownOptions}
							placeholder="Select modules"
							searchPlaceholder="Search modules"
							selectionMode="multiple"
							showSelectedDetails
							value={values.featureIds}
							onChange={(featureIds) =>
								onUpdate({
									featureIds: Array.isArray(featureIds)
										? featureIds
										: [featureIds].filter(Boolean),
								})
							}
						/>
						<FieldError message={errors.featureIds} />
					</label>
				</div>

				<div className="grid content-start gap-4">
					<section className="grid gap-4 rounded-lg border border-darknavy/10 bg-offwhite/35 p-4">
						<div>
							<h2 className="text-base font-semibold text-darknavy">
								Pricing
							</h2>
							<p className="mt-1 text-sm text-darknavy/55">
								Monthly, interval, yearly, transaction-based, and percent-off models.
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
						{values.pricingKind === "Percent Off" ? (
							<div className="grid gap-4 md:grid-cols-2">
								<NumberField
									error={errors.discountAppliesFrom}
									label="Applies from"
									value={values.discountAppliesFrom}
									onChange={(discountAppliesFrom) =>
										onUpdate({ discountAppliesFrom })
									}
								/>
								<NumberField
									error={errors.discountAppliesTo}
									label="Applies to"
									value={values.discountAppliesTo}
									onChange={(discountAppliesTo) =>
										onUpdate({ discountAppliesTo })
									}
								/>
							</div>
						) : null}
					</section>

					<section className="grid gap-4 rounded-lg border border-darknavy/10 bg-offwhite/35 p-4">
						<div>
							<h2 className="text-base font-semibold text-darknavy">
								Scale Pricing
							</h2>
							<p className="mt-1 text-sm text-darknavy/55">
								Company, branch, and user allowances can be fixed, ranged, or add-on priced.
							</p>
						</div>
						<ScaleRuleSection
							addOnPrice={values.companyAddOnPrice}
							addOnStart={values.companyAddOnStart}
							errors={{
								addOnPrice: errors.companyAddOnPrice,
								addOnStart: errors.companyAddOnStart,
								includedFree: errors.companyIncludedFree,
								max: errors.companyMax,
								min: errors.companyMin,
							}}
							includedFree={values.companyIncludedFree}
							limitKind={values.companyLimitKind}
							max={values.companyMax}
							min={values.companyMin}
							unitLabel={MasterPlanAndPackageScaleUnitLabels.company}
							onUpdate={({ addOnPrice, addOnStart, includedFree, limitKind, max, min }) =>
								onUpdate({
									companyAddOnPrice: addOnPrice,
									companyAddOnStart: addOnStart,
									companyIncludedFree: includedFree,
									companyLimitKind: limitKind,
									companyMax: max,
									companyMin: min,
								})
							}
						/>
						<ScaleRuleSection
							addOnPrice={values.branchAddOnPrice}
							addOnStart={values.branchAddOnStart}
							errors={{
								addOnPrice: errors.branchAddOnPrice,
								addOnStart: errors.branchAddOnStart,
								includedFree: errors.branchIncludedFree,
								max: errors.branchMax,
								min: errors.branchMin,
							}}
							includedFree={values.branchIncludedFree}
							limitKind={values.branchLimitKind}
							max={values.branchMax}
							min={values.branchMin}
							unitLabel={MasterPlanAndPackageScaleUnitLabels.branch}
							onUpdate={({ addOnPrice, addOnStart, includedFree, limitKind, max, min }) =>
								onUpdate({
									branchAddOnPrice: addOnPrice,
									branchAddOnStart: addOnStart,
									branchIncludedFree: includedFree,
									branchLimitKind: limitKind,
									branchMax: max,
									branchMin: min,
								})
							}
						/>
						<ScaleRuleSection
							addOnPrice={values.userAddOnPrice}
							addOnStart={values.userAddOnStart}
							errors={{
								addOnPrice: errors.userAddOnPrice,
								addOnStart: errors.userAddOnStart,
								includedFree: errors.userIncludedFree,
								max: errors.userMax,
								min: errors.userMin,
							}}
							includedFree={values.userIncludedFree}
							limitKind={values.userLimitKind}
							max={values.userMax}
							min={values.userMin}
							unitLabel={MasterPlanAndPackageScaleUnitLabels.user}
							onUpdate={({ addOnPrice, addOnStart, includedFree, limitKind, max, min }) =>
								onUpdate({
									userAddOnPrice: addOnPrice,
									userAddOnStart: addOnStart,
									userIncludedFree: includedFree,
									userLimitKind: limitKind,
									userMax: max,
									userMin: min,
								})
							}
						/>
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

type ScaleRuleValues = {
	addOnPrice: number;
	addOnStart: number;
	includedFree: number;
	limitKind: MasterPlanAndPackageScaleKind;
	max: number;
	min: number;
};

function ScaleRuleSection({
	addOnPrice,
	addOnStart,
	errors,
	includedFree,
	limitKind,
	max,
	min,
	unitLabel,
	onUpdate,
}: ScaleRuleValues & {
	errors: Partial<Record<keyof Omit<ScaleRuleValues, "limitKind">, string>>;
	unitLabel: string;
	onUpdate: (values: ScaleRuleValues) => void;
}) {
	function update(nextValues: Partial<ScaleRuleValues>) {
		onUpdate({
			addOnPrice,
			addOnStart,
			includedFree,
			limitKind,
			max,
			min,
			...nextValues,
		});
	}

	return (
		<div className="grid gap-3 rounded-lg border border-darknavy/10 bg-white p-3">
			<div className="grid gap-3 md:grid-cols-[minmax(10rem,0.7fr)_minmax(0,1fr)]">
				<SelectField
					label={`${unitLabel} rule`}
					value={limitKind}
					options={MasterPlanAndPackageScaleKindOptions}
					onChange={(nextLimitKind) =>
						update({
							limitKind: nextLimitKind as MasterPlanAndPackageScaleKind,
						})
					}
				/>
				{limitKind === "Fixed" ? (
					<NumberField
						error={errors.includedFree}
						label={`Fixed ${unitLabel.toLowerCase()} count`}
						value={includedFree}
						onChange={(nextIncludedFree) =>
							update({ includedFree: nextIncludedFree })
						}
					/>
				) : null}
				{limitKind === "Range" ? (
					<div className="grid gap-3 md:grid-cols-2">
						<NumberField
							error={errors.min}
							label="Minimum"
							value={min}
							onChange={(nextMin) => update({ min: nextMin })}
						/>
						<NumberField
							error={errors.max}
							label="Maximum"
							value={max}
							onChange={(nextMax) => update({ max: nextMax })}
						/>
					</div>
				) : null}
				{limitKind === "Add-on" ? (
					<div className="grid gap-3 md:grid-cols-3">
						<NumberField
							error={errors.includedFree}
							label="Free count"
							value={includedFree}
							onChange={(nextIncludedFree) =>
								update({ includedFree: nextIncludedFree })
							}
						/>
						<NumberField
							error={errors.addOnStart}
							label="Add-on starts"
							value={addOnStart}
							onChange={(nextAddOnStart) =>
								update({ addOnStart: nextAddOnStart })
							}
						/>
						<NumberField
							error={errors.addOnPrice}
							label="Add-on price"
							value={addOnPrice}
							onChange={(nextAddOnPrice) =>
								update({ addOnPrice: nextAddOnPrice })
							}
						/>
					</div>
				) : null}
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
