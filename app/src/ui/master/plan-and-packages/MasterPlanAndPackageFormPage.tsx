"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
	ArrowLeft,
	CalendarDays,
	GitBranch,
	Plus,
	Save,
	Search,
	Trash2,
	Users,
	type LucideIcon,
} from "lucide-react";
import {
	MasterPlanAndPackageFeatureOptions,
	MasterPlanAndPackagesHref,
	MasterPlanAndPackageScaleUnitLabels,
	MasterPlanAndPackageStatusOptions,
} from "@/app/src/constants/master/plan-and-packages/MasterPlanAndPackageConstants";
import { useMasterPlanAndPackageFormPage } from "@/app/src/hooks/master/plan-and-packages/useMasterPlanAndPackageFormPage";
import type {
	MasterPlanAndPackageFormErrors,
	MasterPlanAndPackageFormValues,
	MasterPlanAndPackageReductionTier,
	MasterPlanAndPackageStatus,
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
const SuggestedReductionTiers = [
	{ reductionPercent: 5, thresholdCount: 10 },
	{ reductionPercent: 10, thresholdCount: 25 },
	{ reductionPercent: 20, thresholdCount: 50 },
	{ reductionPercent: 25, thresholdCount: 100 },
] as const satisfies readonly MasterPlanAndPackageReductionTier[];

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
	return (
		<div className="overflow-hidden rounded-lg border border-darknavy/10 bg-white shadow-sm">
			<div className="grid gap-5 p-5">
				<div className="grid content-start gap-4">
					<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-[minmax(0,0.8fr)_minmax(0,1.35fr)_minmax(8rem,0.55fr)_minmax(10rem,0.55fr)]">
						<TextField
							error={errors.code}
							label="Plan code"
							value={values.code}
							onChange={(code) => onUpdate({ code: code.toUpperCase() })}
						/>
						<TextField
							error={errors.name}
							label="Plan name"
							value={values.name}
							onChange={(name) => onUpdate({ name })}
						/>
						<NumberField
							error={errors.trialDays}
							label="Trial days"
							value={values.trialDays}
							onChange={(trialDays) => onUpdate({ trialDays })}
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
				</div>

				<section className="-mx-5 grid gap-5 border-y border-darknavy/10 bg-offwhite/45 px-5 py-5">
					<div className="flex flex-wrap items-center justify-between gap-3">
						<div className="flex items-center gap-3">
							<span className="flex h-9 w-9 items-center justify-center rounded-lg bg-skyblue/12 text-darknavy">
								<CalendarDays className="h-4 w-4" aria-hidden="true" />
							</span>
							<h2 className="text-base font-semibold text-darknavy">
								Pricing & Scale Pricing
							</h2>
						</div>
						<div className="inline-grid grid-cols-2 overflow-hidden rounded-lg border border-darknavy/10 bg-white text-xs font-bold text-darknavy/62">
							<span className="border-r border-darknavy/10 px-3 py-2">
								Monthly
							</span>
							<span className="px-3 py-2">Yearly</span>
						</div>
					</div>
					<div className="grid gap-4 xl:grid-cols-2">
						<BillingPeriodColumn
							addOnIntervalLabel="month"
							basePrice={{
								error: errors.monthlyBasePrice,
								value: values.monthlyBasePrice,
								onChange: (monthlyBasePrice) =>
									onUpdate({ monthlyBasePrice }),
							}}
							periodLabel="Monthly"
							percentOff={{
								error: errors.monthlyPercentOff,
								value: values.monthlyPercentOff,
								onChange: (monthlyPercentOff) =>
									onUpdate({ monthlyPercentOff }),
							}}
							branch={{
								addOnPrice: values.monthlyBranchAddOnPrice,
								errors: {
									addOnPrice: errors.monthlyBranchAddOnPrice,
									includedFree: errors.monthlyBranchIncludedFree,
									reductionTiers: errors.monthlyBranchReductionTiers,
								},
								includedFree: values.monthlyBranchIncludedFree,
								reductionTiers: values.monthlyBranchReductionTiers,
								onUpdate: ({ addOnPrice, includedFree, reductionTiers }) =>
									onUpdate({
										monthlyBranchAddOnPrice: addOnPrice,
										monthlyBranchIncludedFree: includedFree,
										monthlyBranchReductionTiers: reductionTiers,
									}),
							}}
							accentClassName="border-t-skyblue/55"
							user={{
								addOnPrice: values.monthlyUserAddOnPrice,
								errors: {
									addOnPrice: errors.monthlyUserAddOnPrice,
									includedFree: errors.monthlyUserIncludedFree,
									reductionTiers: errors.monthlyUserReductionTiers,
								},
								includedFree: values.monthlyUserIncludedFree,
								reductionTiers: values.monthlyUserReductionTiers,
								onUpdate: ({ addOnPrice, includedFree, reductionTiers }) =>
									onUpdate({
										monthlyUserAddOnPrice: addOnPrice,
										monthlyUserIncludedFree: includedFree,
										monthlyUserReductionTiers: reductionTiers,
									}),
							}}
						/>
						<BillingPeriodColumn
							addOnIntervalLabel="year"
							basePrice={{
								error: errors.yearlyBasePrice,
								value: values.yearlyBasePrice,
								onChange: (yearlyBasePrice) => onUpdate({ yearlyBasePrice }),
							}}
							periodLabel="Yearly"
							percentOff={{
								error: errors.yearlyPercentOff,
								value: values.yearlyPercentOff,
								onChange: (yearlyPercentOff) =>
									onUpdate({ yearlyPercentOff }),
							}}
							branch={{
								addOnPrice: values.yearlyBranchAddOnPrice,
								errors: {
									addOnPrice: errors.yearlyBranchAddOnPrice,
									includedFree: errors.yearlyBranchIncludedFree,
									reductionTiers: errors.yearlyBranchReductionTiers,
								},
								includedFree: values.yearlyBranchIncludedFree,
								reductionTiers: values.yearlyBranchReductionTiers,
								onUpdate: ({ addOnPrice, includedFree, reductionTiers }) =>
									onUpdate({
										yearlyBranchAddOnPrice: addOnPrice,
										yearlyBranchIncludedFree: includedFree,
										yearlyBranchReductionTiers: reductionTiers,
									}),
							}}
							accentClassName="border-t-citron"
							user={{
								addOnPrice: values.yearlyUserAddOnPrice,
								errors: {
									addOnPrice: errors.yearlyUserAddOnPrice,
									includedFree: errors.yearlyUserIncludedFree,
									reductionTiers: errors.yearlyUserReductionTiers,
								},
								includedFree: values.yearlyUserIncludedFree,
								reductionTiers: values.yearlyUserReductionTiers,
								onUpdate: ({ addOnPrice, includedFree, reductionTiers }) =>
									onUpdate({
										yearlyUserAddOnPrice: addOnPrice,
										yearlyUserIncludedFree: includedFree,
										yearlyUserReductionTiers: reductionTiers,
									}),
							}}
						/>
					</div>
				</section>

				<ModuleFeatureSelector
					error={errors.featureIds}
					selectedFeatureIds={values.featureIds}
					onChange={(featureIds) => onUpdate({ featureIds })}
				/>

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
	);
}

type ScaleRuleValues = {
	addOnPrice: number;
	includedFree: number;
	reductionTiers: MasterPlanAndPackageReductionTier[];
};

type ScaleRuleSectionProps = ScaleRuleValues & {
	addOnIntervalLabel: "month" | "year";
	errors: Partial<Record<keyof ScaleRuleValues, string>>;
	icon: LucideIcon;
	unitLabel: string;
	onUpdate: (values: ScaleRuleValues) => void;
};

type NumberFieldConfig = {
	error?: string;
	value: number;
	onChange: (value: number) => void;
};

function BillingPeriodColumn({
	addOnIntervalLabel,
	accentClassName,
	basePrice,
	branch,
	periodLabel,
	percentOff,
	user,
}: {
	addOnIntervalLabel: "month" | "year";
	accentClassName: string;
	basePrice: NumberFieldConfig;
	branch: Omit<ScaleRuleSectionProps, "addOnIntervalLabel" | "icon" | "unitLabel">;
	periodLabel: string;
	percentOff: NumberFieldConfig;
	user: Omit<ScaleRuleSectionProps, "addOnIntervalLabel" | "icon" | "unitLabel">;
}) {
	return (
		<div
			className={joinClasses(
				"grid content-start gap-4 rounded-lg border border-t-4 border-darknavy/10 bg-white p-4 shadow-sm",
				accentClassName,
			)}
		>
			<div className="flex items-center justify-between gap-3">
				<h3 className="text-base font-bold text-darknavy">{periodLabel}</h3>
				<span className="rounded-md bg-offwhite px-2.5 py-1 text-xs font-bold uppercase text-darknavy/52">
					/{addOnIntervalLabel}
				</span>
			</div>
			<div className="grid gap-3 border-b border-darknavy/10 pb-4 md:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
				<NumberField
					error={basePrice.error}
					label={`Base price / ${addOnIntervalLabel}`}
					value={basePrice.value}
					onChange={basePrice.onChange}
				/>
				<NumberField
					error={percentOff.error}
					label="Percent off"
					value={percentOff.value}
					onChange={percentOff.onChange}
				/>
			</div>
			<div className="grid gap-3">
				<ScaleRuleSection
					{...branch}
					addOnIntervalLabel={addOnIntervalLabel}
					icon={GitBranch}
					unitLabel={MasterPlanAndPackageScaleUnitLabels.branch}
				/>
				<ScaleRuleSection
					{...user}
					addOnIntervalLabel={addOnIntervalLabel}
					icon={Users}
					unitLabel={MasterPlanAndPackageScaleUnitLabels.user}
				/>
			</div>
		</div>
	);
}

function ScaleRuleSection({
	addOnPrice,
	addOnIntervalLabel,
	errors,
	icon: UnitIcon,
	includedFree,
	reductionTiers,
	unitLabel,
	onUpdate,
}: ScaleRuleSectionProps) {
	function update(nextValues: Partial<ScaleRuleValues>) {
		onUpdate({
			addOnPrice,
			includedFree,
			reductionTiers,
			...nextValues,
		});
	}

	function updateReductionTier(
		tierIndex: number,
		field: keyof MasterPlanAndPackageReductionTier,
		value: number,
	) {
		update({
			reductionTiers: reductionTiers.map((tier, index) =>
				index === tierIndex ? { ...tier, [field]: value } : tier,
			),
		});
	}

	function addReductionTier() {
		const lastTier = reductionTiers[reductionTiers.length - 1];
		const suggestedTier = SuggestedReductionTiers[reductionTiers.length];

		update({
			reductionTiers: [
				...reductionTiers,
				suggestedTier
					? { ...suggestedTier }
					: {
						reductionPercent: Math.min(
							(lastTier?.reductionPercent ?? 0) + 5,
							100,
						),
						thresholdCount: (lastTier?.thresholdCount ?? 0) + 10,
					},
			],
		});
	}

	function removeReductionTier(tierIndex: number) {
		update({
			reductionTiers: reductionTiers.filter((_, index) => index !== tierIndex),
		});
	}

	return (
		<div className="grid gap-3 border-b border-darknavy/10 pb-4 last:border-b-0 last:pb-0">
			<div className="flex items-center gap-2">
				<span className="flex h-8 w-8 items-center justify-center rounded-lg bg-darknavy/4 text-darknavy/72">
					<UnitIcon className="h-4 w-4" aria-hidden="true" />
				</span>
				<h4 className="text-sm font-bold text-darknavy">{unitLabel}</h4>
			</div>
			<div className="grid gap-3 md:grid-cols-2">
				<NumberField
					error={errors.includedFree}
					label="Included"
					value={includedFree}
					onChange={(nextIncludedFree) =>
						update({ includedFree: nextIncludedFree })
					}
				/>
				<NumberField
					error={errors.addOnPrice}
					label={`Add-on / ${addOnIntervalLabel}`}
					value={addOnPrice}
					onChange={(nextAddOnPrice) =>
						update({ addOnPrice: nextAddOnPrice })
					}
				/>
			</div>
			<div className="grid gap-3">
				<div className="flex flex-wrap items-center justify-between gap-3">
					<p className="text-sm font-bold text-darknavy/65">
						Reduction tiers
					</p>
					<button
						type="button"
						onClick={addReductionTier}
						className="inline-flex h-9 items-center gap-2 rounded-lg border border-skyblue/35 bg-skyblue/10 px-3 text-xs font-bold text-darknavy transition hover:border-skyblue hover:bg-skyblue/18"
					>
						<Plus className="h-3.5 w-3.5" aria-hidden="true" />
						Add tier
					</button>
				</div>
				{reductionTiers.length > 0 ? (
					<div className="grid gap-2">
						{reductionTiers.map((tier, index) => (
							<div
								key={`${tier.thresholdCount}-${index}`}
								className="grid gap-2 rounded-lg bg-offwhite/55 p-2 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_2.75rem]"
							>
								<NumberField
									label="Count reaches"
									value={tier.thresholdCount}
									onChange={(nextThresholdCount) =>
										updateReductionTier(
											index,
											"thresholdCount",
											nextThresholdCount,
										)
									}
								/>
								<NumberField
									label="Reduction percent"
									value={tier.reductionPercent}
									onChange={(nextReductionPercent) =>
										updateReductionTier(
											index,
											"reductionPercent",
											nextReductionPercent,
										)
									}
								/>
								<button
									type="button"
									title="Remove reduction tier"
									aria-label="Remove reduction tier"
									onClick={() => removeReductionTier(index)}
									className="mt-6.5 inline-flex h-11 items-center justify-center rounded-lg border border-darknavy/10 bg-white text-darknavy/55 transition hover:border-coralpink/45 hover:text-coralpink"
								>
									<Trash2 className="h-4 w-4" aria-hidden="true" />
								</button>
							</div>
						))}
					</div>
				) : (
					<div className="rounded-lg border border-dashed border-darknavy/16 bg-offwhite/55 px-3 py-4 text-sm font-semibold text-darknavy/48">
						No reduction tiers
					</div>
				)}
				<FieldError message={errors.reductionTiers} />
			</div>
		</div>
	);
}

function ModuleFeatureSelector({
	error,
	selectedFeatureIds,
	onChange,
}: {
	error?: string;
	selectedFeatureIds: string[];
	onChange: (featureIds: string[]) => void;
}) {
	const [searchTerm, setSearchTerm] = useState("");
	const selectedSet = useMemo(
		() => new Set(selectedFeatureIds),
		[selectedFeatureIds],
	);
	const normalizedSearchTerm = searchTerm.trim().toLowerCase();
	const groupedFeatures = useMemo(() => {
		const filteredFeatures = MasterPlanAndPackageFeatureOptions.filter(
			(feature) => {
				if (!normalizedSearchTerm) {
					return true;
				}

				return [
					feature.name,
					feature.description,
					feature.section,
				].some((value) => value.toLowerCase().includes(normalizedSearchTerm));
			},
		);

		return filteredFeatures.reduce<
			Array<{
				features: typeof MasterPlanAndPackageFeatureOptions;
				section: string;
			}>
		>((groups, feature) => {
			const existingGroup = groups.find(
				(group) => group.section === feature.section,
			);

			if (existingGroup) {
				existingGroup.features.push(feature);

				return groups;
			}

			groups.push({
				features: [feature],
				section: feature.section,
			});

			return groups;
		}, []);
	}, [normalizedSearchTerm]);

	function toggleFeature(featureId: string) {
		if (selectedSet.has(featureId)) {
			onChange(selectedFeatureIds.filter((selectedId) => selectedId !== featureId));

			return;
		}

		onChange([...selectedFeatureIds, featureId]);
	}

	return (
		<section className="-mx-5 grid gap-4 px-5">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<div className="flex items-center gap-3">
					<span className="flex h-9 w-9 items-center justify-center rounded-lg bg-citron/35 text-darknavy">
						<Users className="h-4 w-4" aria-hidden="true" />
					</span>
					<div>
						<h2 className="text-base font-semibold text-darknavy">Modules</h2>
						<p className="mt-1 text-xs font-bold uppercase tracking-wide text-darknavy/42">
							{selectedFeatureIds.length} selected
						</p>
					</div>
				</div>
				<label className="relative block">
					<span className="sr-only">Search modules</span>
					<Search
						className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-darknavy/38"
						aria-hidden="true"
					/>
					<input
						value={searchTerm}
						onChange={(event) => setSearchTerm(event.target.value)}
						placeholder="Search modules"
						className={joinClasses(ControlClassName, "pl-9")}
					/>
				</label>
			</div>
			<div className="max-h-120 overflow-y-auto rounded-lg border border-darknavy/10 bg-white shadow-sm">
				{groupedFeatures.length > 0 ? (
					groupedFeatures.map((group) => (
						<div key={group.section}>
							<div className="sticky top-0 z-10 border-b border-darknavy/10 bg-offwhite px-4 py-2 text-xs font-bold uppercase tracking-wide text-darknavy/55">
								{group.section}
							</div>
							<div className="grid divide-y divide-darknavy/6 md:grid-cols-2 md:divide-x md:divide-y-0 xl:grid-cols-3">
								{group.features.map((feature) => (
									<label
										key={feature.id}
										className="grid cursor-pointer grid-cols-[1.25rem_minmax(0,1fr)] gap-3 px-4 py-3 transition hover:bg-skyblue/8"
									>
										<input
											type="checkbox"
											checked={selectedSet.has(feature.id)}
											onChange={() => toggleFeature(feature.id)}
											className="mt-0.5 h-4 w-4 rounded border-darknavy/20 text-skyblue focus:ring-skyblue/20"
										/>
										<span className="min-w-0">
											<span className="block text-sm font-semibold text-darknavy">
												{feature.name}
											</span>
											<span className="mt-0.5 block text-xs font-medium text-darknavy/48">
												{feature.description}
											</span>
										</span>
									</label>
								))}
							</div>
						</div>
					))
				) : (
					<p className="px-4 py-6 text-sm font-medium text-darknavy/55">
						No modules match your search.
					</p>
				)}
			</div>
			<FieldError message={error} />
		</section>
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
