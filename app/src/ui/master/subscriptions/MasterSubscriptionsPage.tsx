"use client";

import type { ReactNode } from "react";
import {
	Building2,
	Calculator,
	Check,
	CircleDollarSign,
	Edit3,
	Eye,
	GitBranch,
	Layers3,
	Package,
	Plus,
	Save,
	ToggleLeft,
	ToggleRight,
	Trash2,
	Users,
} from "lucide-react";
import {
	MasterSubscriptionBillingCycleOptions,
	MasterSubscriptionStatusOptions,
	MasterSubscriptionUnitLabels,
	MasterSubscriptionUnitOptions,
} from "@/app/src/constants/master/subscriptions/MasterSubscriptionConstants";
import {
	MasterSubscriptionModules,
	formatMasterSubscriptionCurrency,
} from "@/app/src/data/master/subscriptions/MasterSubscriptionData";
import { useMasterSubscriptionsPage } from "@/app/src/hooks/master/subscriptions/useMasterSubscriptionsPage";
import type {
	MasterSubscriptionPlanFormErrors,
	MasterSubscriptionPlanFormValues,
	MasterSubscriptionPlanRecord,
	MasterSubscriptionPlanStatus,
	MasterSubscriptionPreviewValues,
	MasterSubscriptionQuote,
	MasterSubscriptionUnit,
	MasterSubscriptionVolumeRuleRecord,
} from "@/app/src/types/master/subscriptions/MasterSubscriptionTypes";
import {
	ModuleHeader,
	moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";
import { MasterSubscriptionCompanyTable } from "@/app/src/ui/master/subscriptions/MasterSubscriptionCompanyTable";

const ControlClassName =
	"h-11 w-full rounded-lg border border-darknavy/10 bg-white px-3 text-sm font-semibold text-darknavy shadow-sm transition placeholder:text-darknavy/35 focus:border-skyblue focus:outline-none focus:ring-4 focus:ring-skyblue/15";
const FieldLabelClassName = "grid gap-1.5 text-sm font-semibold text-darknavy/58";
const PlanActionClassName =
	"inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-darknavy/10 bg-white px-3 text-xs font-semibold text-darknavy/70 transition hover:bg-skyblue/10 hover:text-darknavy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/25";

export function MasterSubscriptionsPage() {
	const page = useMasterSubscriptionsPage();

	return (
		<section className="grid gap-5">
			<ModuleHeader
				variant="card"
				titleAs="h1"
				title="Plans & Packages"
				description="Maintain plan records, included modules, activation status, and volume pricing rules from one master view."
				eyebrow={
					<>
						<CircleDollarSign className="h-3.5 w-3.5" aria-hidden="true" />
						Subscription & Billing
					</>
				}
				actions={
					<>
						<button
							type="button"
							onClick={page.createPlan}
							className={moduleHeaderActionClassNames.secondary}
						>
							<Plus className="h-4 w-4" aria-hidden="true" />
							New Plan
						</button>
						<button
							type="button"
							onClick={page.savePlan}
							className={moduleHeaderActionClassNames.primary}
						>
							<Save className="h-4 w-4" aria-hidden="true" />
							Save Plan
						</button>
					</>
				}
			/>

			<MasterSubscriptionSummaryCards summary={page.summary} />

			<div className="grid gap-5 xl:grid-cols-[minmax(18rem,0.42fr)_minmax(0,1fr)]">
				<MasterSubscriptionPlanCatalog
					plans={page.plans}
					selectedPlanId={page.selectedPlan.id}
					onSelectPlan={page.selectPlan}
					onTogglePlanStatus={page.togglePlanStatus}
				/>
				<MasterSubscriptionPlanEditor
					errors={page.planErrors}
					values={page.planDraft}
					onSave={page.savePlan}
					onToggleModule={page.toggleModule}
					onUpdate={page.updatePlanDraft}
					onUpdateIncludedCount={page.updateIncludedCount}
					onUpdatePricing={page.updatePricing}
				/>
			</div>

			<div className="grid gap-5 2xl:grid-cols-[minmax(0,1.05fr)_minmax(24rem,0.95fr)]">
				<MasterSubscriptionPricingRulesPanel
					rules={page.selectedPlanRules}
					onAddRule={page.addVolumeRule}
					onRemoveRule={page.removeVolumeRule}
					onUpdateRule={page.updateVolumeRule}
				/>
				<MasterSubscriptionBillingPreview
					preview={page.billingPreview}
					previewValues={page.previewValues}
					values={page.planDraft}
					onUpdatePreviewValues={page.updatePreviewValues}
				/>
			</div>

			<MasterSubscriptionCompanyTable
				plansById={page.plansById}
				query={page.query}
				resetSubscriptionFilters={page.resetSubscriptionFilters}
				setQuery={page.setQuery}
				subscriptionQuotes={page.subscriptionQuotes}
				table={page.table}
			/>
		</section>
	);
}

function MasterSubscriptionSummaryCards({
	summary,
}: {
	summary: {
		activePlans: number;
		draftPlans: number;
		enabledModules: number;
		inactivePlans: number;
		monthlyRevenue: number;
		subscribedCompanies: number;
	};
}) {
	const metrics = [
		{
			icon: Package,
			label: "Active Plans",
			supportingText: "available packages",
			tone: "bg-skyblue/12 text-darknavy",
			value: summary.activePlans,
		},
		{
			icon: Layers3,
			label: "Enabled Modules",
			supportingText: "in active plans",
			tone: "bg-citron/35 text-darknavy",
			value: summary.enabledModules,
		},
		{
			icon: Building2,
			label: "Draft Plans",
			supportingText: "pending review",
			tone: "bg-offwhite text-darknavy",
			value: summary.draftPlans,
		},
		{
			icon: ToggleLeft,
			label: "Inactive Plans",
			supportingText: "not available",
			tone: "bg-coralpink/12 text-coralpink",
			value: summary.inactivePlans,
		},
	];

	return (
		<div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
			{metrics.map((metric) => {
				const Icon = metric.icon;

				return (
					<article
						key={metric.label}
						className="rounded-lg border border-darknavy/10 bg-white p-4 shadow-sm"
					>
						<div className="flex items-center justify-between gap-3">
							<div>
								<p className="text-sm font-medium text-darknavy/58">
									{metric.label}
								</p>
								<p className="mt-1 text-xs font-semibold uppercase tracking-wide text-darknavy/38">
									{metric.supportingText}
								</p>
							</div>
							<span
								className={joinClasses(
									"flex h-10 w-10 items-center justify-center rounded-lg",
									metric.tone,
								)}
							>
								<Icon className="h-4 w-4" aria-hidden="true" />
							</span>
						</div>
						<p className="mt-4 text-2xl font-semibold text-darknavy">
							{metric.value}
						</p>
					</article>
				);
			})}
			<article className="rounded-lg border border-darknavy/10 bg-darknavy p-4 text-white shadow-sm md:col-span-2 xl:col-span-4">
				<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
					<div>
						<p className="text-sm font-semibold text-white/65">
							Projected Monthly Recurring Revenue
						</p>
						<p className="mt-2 text-2xl font-semibold">
							{formatMasterSubscriptionCurrency(summary.monthlyRevenue)}
						</p>
					</div>
					<div className="rounded-lg bg-white/10 px-4 py-3 text-sm font-semibold text-white/80 ring-1 ring-white/12">
						Plan, branch, satellite, user, and company overages included
					</div>
				</div>
			</article>
		</div>
	);
}

function MasterSubscriptionPlanCatalog({
	plans,
	selectedPlanId,
	onSelectPlan,
	onTogglePlanStatus,
}: {
	plans: MasterSubscriptionPlanRecord[];
	selectedPlanId: string;
	onSelectPlan: (planId: string) => void;
	onTogglePlanStatus: (planId: string) => void;
}) {
	return (
		<div className="grid gap-3 self-start">
			<div className="flex items-center justify-between gap-3">
				<div>
					<h2 className="text-lg font-semibold text-darknavy">Plan Library</h2>
					<p className="mt-1 text-sm text-darknavy/55">
						{plans.length} maintenance records
					</p>
				</div>
				<Package className="h-5 w-5 text-skyblue" aria-hidden="true" />
			</div>
			{plans.map((plan) => {
				const isSelected = plan.id === selectedPlanId;
				const isActive = plan.status === "Active";

				return (
					<article
						key={plan.id}
						className={joinClasses(
							"rounded-lg border bg-white p-4 shadow-sm transition",
							isSelected
								? "border-skyblue ring-2 ring-skyblue/18"
								: "border-darknavy/10 hover:border-skyblue/45",
						)}
					>
						<button
							type="button"
							onClick={() => onSelectPlan(plan.id)}
							className="block w-full text-left focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-skyblue/20"
						>
							<div className="flex items-start justify-between gap-4">
								<div className="min-w-0">
									<p className="truncate text-base font-semibold text-darknavy">
										{plan.name}
									</p>
									<p className="mt-1 text-xs font-semibold uppercase tracking-wide text-darknavy/42">
										{plan.code}
									</p>
								</div>
								<MasterSubscriptionPlanStatusBadge status={plan.status} />
							</div>
						</button>
						<div className="mt-4 grid grid-cols-3 gap-2 text-sm">
							<PlanCardMetric label="Companies" value={plan.includedCompanies} />
							<PlanCardMetric label="Branches" value={plan.includedBranches} />
							<PlanCardMetric label="Users" value={plan.includedUsers} />
						</div>
						<div className="mt-4 flex items-center justify-between gap-3 border-t border-darknavy/10 pt-3">
							<span className="text-sm font-semibold text-darknavy">
								{formatMasterSubscriptionCurrency(plan.monthlyBasePrice)}
							</span>
							<span className="text-xs font-semibold uppercase tracking-wide text-darknavy/42">
								{plan.moduleIds.length} modules
							</span>
						</div>
						<div className="mt-3 flex flex-wrap gap-2">
							<button
								type="button"
								onClick={() => onSelectPlan(plan.id)}
								className={PlanActionClassName}
							>
								<Eye className="h-3.5 w-3.5" aria-hidden="true" />
								View
							</button>
							<button
								type="button"
								onClick={() => onSelectPlan(plan.id)}
								className={PlanActionClassName}
							>
								<Edit3 className="h-3.5 w-3.5" aria-hidden="true" />
								Edit
							</button>
							<button
								type="button"
								onClick={() => onTogglePlanStatus(plan.id)}
								className={PlanActionClassName}
							>
								{isActive ? (
									<ToggleRight className="h-3.5 w-3.5" aria-hidden="true" />
								) : (
									<ToggleLeft className="h-3.5 w-3.5" aria-hidden="true" />
								)}
								{isActive ? "Inactivate" : "Activate"}
							</button>
						</div>
					</article>
				);
			})}
		</div>
	);
}

function PlanCardMetric({ label, value }: { label: string; value: number }) {
	return (
		<div className="rounded-md bg-offwhite px-2.5 py-2 ring-1 ring-darknavy/8">
			<p className="text-xs font-medium text-darknavy/45">{label}</p>
			<p className="mt-1 font-semibold text-darknavy">{value}</p>
		</div>
	);
}

function MasterSubscriptionPlanEditor({
	errors,
	values,
	onSave,
	onToggleModule,
	onUpdate,
	onUpdateIncludedCount,
	onUpdatePricing,
}: {
	errors: MasterSubscriptionPlanFormErrors;
	values: MasterSubscriptionPlanFormValues;
	onSave: () => boolean;
	onToggleModule: (moduleId: string) => void;
	onUpdate: (values: Partial<MasterSubscriptionPlanFormValues>) => void;
	onUpdateIncludedCount: (
		key: "includedBranches" | "includedCompanies" | "includedUsers",
		value: number,
	) => void;
	onUpdatePricing: (unit: MasterSubscriptionUnit, value: number) => void;
}) {
	return (
		<div className="overflow-hidden rounded-lg border border-darknavy/10 bg-white shadow-sm">
			<div className="flex flex-col gap-3 border-b border-darknavy/10 p-5 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<p className="text-xs font-semibold uppercase tracking-wide text-skyblue">
						Maintenance
					</p>
					<h2 className="mt-2 text-lg font-semibold text-darknavy">
						Plan Setup
					</h2>
				</div>
				<button
					type="button"
					onClick={onSave}
					className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-skyblue px-4 text-sm font-semibold text-white shadow-sm shadow-skyblue/20 transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-skyblue/20"
				>
					<Save className="h-4 w-4" aria-hidden="true" />
					Save
				</button>
			</div>

			<div className="grid gap-5 p-5">
				<div className="grid gap-4 lg:grid-cols-2">
					<TextField
						error={errors.name}
						label="Plan name"
						value={values.name}
						onChange={(value) => onUpdate({ name: value })}
					/>
					<TextField
						error={errors.code}
						label="Plan code"
						value={values.code}
						onChange={(value) => onUpdate({ code: value.toUpperCase() })}
					/>
					<SelectField
						label="Status"
						value={values.status}
						options={MasterSubscriptionStatusOptions}
						onChange={(value) =>
							onUpdate({ status: value as MasterSubscriptionPlanStatus })
						}
					/>
					<SelectField
						label="Default cycle"
						value={values.billingCycle}
						options={MasterSubscriptionBillingCycleOptions}
						onChange={(value) =>
							onUpdate({
								billingCycle:
									value as MasterSubscriptionPlanFormValues["billingCycle"],
							})
						}
					/>
				</div>

				<label className={FieldLabelClassName}>
					Description
					<textarea
						value={values.description}
						onChange={(event) => onUpdate({ description: event.target.value })}
						rows={3}
						className="w-full rounded-lg border border-darknavy/10 bg-white px-3 py-2 text-sm font-medium text-darknavy shadow-sm transition placeholder:text-darknavy/35 focus:border-skyblue focus:outline-none focus:ring-4 focus:ring-skyblue/15"
					/>
					<FieldError message={errors.description} />
				</label>

				<div className="grid gap-4 lg:grid-cols-4">
					<NumberField
						error={errors.monthlyBasePrice}
						icon={<CircleDollarSign className="h-4 w-4" aria-hidden="true" />}
						label="Base monthly price"
						value={values.monthlyBasePrice}
						onChange={(value) => onUpdate({ monthlyBasePrice: value })}
					/>
					<NumberField
						error={errors.includedCompanies}
						icon={<Building2 className="h-4 w-4" aria-hidden="true" />}
						label="Included companies"
						value={values.includedCompanies}
						onChange={(value) =>
							onUpdateIncludedCount("includedCompanies", value)
						}
					/>
					<NumberField
						error={errors.includedBranches}
						icon={<GitBranch className="h-4 w-4" aria-hidden="true" />}
						label="Included branches"
						value={values.includedBranches}
						onChange={(value) =>
							onUpdateIncludedCount("includedBranches", value)
						}
					/>
					<NumberField
						error={errors.includedUsers}
						icon={<Users className="h-4 w-4" aria-hidden="true" />}
						label="Included users"
						value={values.includedUsers}
						onChange={(value) => onUpdateIncludedCount("includedUsers", value)}
					/>
				</div>

				<div className="grid gap-4 lg:grid-cols-3">
					{MasterSubscriptionUnitOptions.map((unit) => (
						<NumberField
							key={unit}
							label={`${MasterSubscriptionUnitLabels[unit]} overage`}
							value={values.pricing[unit]}
							onChange={(value) => onUpdatePricing(unit, value)}
						/>
					))}
				</div>

				<div className="grid gap-3">
					<div className="flex items-center justify-between gap-3">
						<div>
							<h3 className="text-base font-semibold text-darknavy">
								Included Modules
							</h3>
							<FieldError message={errors.moduleIds} />
						</div>
						<span className="rounded-md bg-offwhite px-2.5 py-1 text-xs font-semibold text-darknavy/55 ring-1 ring-darknavy/10">
							{values.moduleIds.length} selected
						</span>
					</div>
					<div className="grid gap-2 md:grid-cols-2">
						{MasterSubscriptionModules.map((moduleOption) => {
							const isSelected = values.moduleIds.includes(moduleOption.id);

							return (
								<button
									key={moduleOption.id}
									type="button"
									aria-pressed={isSelected}
									onClick={() => onToggleModule(moduleOption.id)}
									className={joinClasses(
										"flex items-start gap-3 rounded-lg border p-3 text-left transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-skyblue/15",
										isSelected
											? "border-skyblue bg-skyblue/10"
											: "border-darknavy/10 bg-white hover:border-skyblue/45",
									)}
								>
									<span
										className={joinClasses(
											"mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border",
											isSelected
												? "border-skyblue bg-skyblue text-white"
												: "border-darknavy/20 bg-white",
										)}
									>
										{isSelected ? (
											<Check className="h-3.5 w-3.5" aria-hidden="true" />
										) : null}
									</span>
									<span className="min-w-0">
										<span className="block text-sm font-semibold text-darknavy">
											{moduleOption.name}
										</span>
										<span className="mt-1 block text-xs font-semibold uppercase tracking-wide text-darknavy/38">
											{moduleOption.category}
										</span>
									</span>
								</button>
							);
						})}
					</div>
				</div>
			</div>
		</div>
	);
}

function MasterSubscriptionPricingRulesPanel({
	rules,
	onAddRule,
	onRemoveRule,
	onUpdateRule,
}: {
	rules: MasterSubscriptionVolumeRuleRecord[];
	onAddRule: () => void;
	onRemoveRule: (ruleId: string) => void;
	onUpdateRule: (
		ruleId: string,
		values: Partial<MasterSubscriptionVolumeRuleRecord>,
	) => void;
}) {
	return (
		<div className="overflow-hidden rounded-lg border border-darknavy/10 bg-white shadow-sm">
			<div className="flex flex-col gap-3 border-b border-darknavy/10 p-5 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<p className="text-xs font-semibold uppercase tracking-wide text-skyblue">
						Scale pricing
					</p>
					<h2 className="mt-2 text-lg font-semibold text-darknavy">
						Volume Rules
					</h2>
				</div>
				<button
					type="button"
					onClick={onAddRule}
					className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-darknavy/10 bg-white px-4 text-sm font-semibold text-darknavy/70 transition hover:bg-skyblue/10 hover:text-darknavy focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-skyblue/15"
				>
					<Plus className="h-4 w-4" aria-hidden="true" />
					Add Rule
				</button>
			</div>

			{rules.length === 0 ? (
				<div className="p-6 text-sm font-medium text-darknavy/55">
					No volume rules for the selected plan.
				</div>
			) : (
				<div className="divide-y divide-darknavy/10">
					{rules.map((rule) => (
						<div
							key={rule.id}
							className="grid gap-3 p-4 lg:grid-cols-[minmax(12rem,1fr)_12rem_7rem_7rem_8rem_2.75rem]"
						>
							<label className={FieldLabelClassName}>
								Rule name
								<input
									value={rule.label}
									onChange={(event) =>
										onUpdateRule(rule.id, { label: event.target.value })
									}
									className={ControlClassName}
								/>
							</label>
							<SelectField
								label="Charge unit"
								value={rule.unit}
								options={MasterSubscriptionUnitOptions}
								optionLabels={MasterSubscriptionUnitLabels}
								onChange={(value) =>
									onUpdateRule(rule.id, {
										unit: value as MasterSubscriptionUnit,
									})
								}
							/>
							<NumberField
								label="Starts at"
								value={rule.startsAt}
								onChange={(value) =>
									onUpdateRule(rule.id, { startsAt: value })
								}
							/>
							<NumberField
								label="Ends at"
								value={rule.endsAt ?? ""}
								onChange={(value) =>
									onUpdateRule(rule.id, { endsAt: value === 0 ? null : value })
								}
							/>
							<NumberField
								label="Discount %"
								value={rule.discountPercent}
								onChange={(value) =>
									onUpdateRule(rule.id, { discountPercent: value })
								}
							/>
							<div className="flex items-end">
								<button
									type="button"
									aria-label={`Remove ${rule.label}`}
									onClick={() => onRemoveRule(rule.id)}
									className="flex h-11 w-11 items-center justify-center rounded-lg text-coralpink transition hover:bg-coralpink/10 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-coralpink/15"
								>
									<Trash2 className="h-4 w-4" aria-hidden="true" />
								</button>
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
}

function MasterSubscriptionBillingPreview({
	preview,
	previewValues,
	values,
	onUpdatePreviewValues,
}: {
	preview: MasterSubscriptionQuote;
	previewValues: MasterSubscriptionPreviewValues;
	values: MasterSubscriptionPlanFormValues;
	onUpdatePreviewValues: (
		values: Partial<MasterSubscriptionPreviewValues>,
	) => void;
}) {
	return (
		<div className="overflow-hidden rounded-lg border border-darknavy/10 bg-white shadow-sm">
			<div className="border-b border-darknavy/10 p-5">
				<p className="text-xs font-semibold uppercase tracking-wide text-skyblue">
					Quote check
				</p>
				<h2 className="mt-2 text-lg font-semibold text-darknavy">
					Pricing Preview
				</h2>
			</div>

			<div className="grid gap-5 p-5">
				<div className="grid gap-3 sm:grid-cols-3">
					<NumberField
						icon={<Building2 className="h-4 w-4" aria-hidden="true" />}
						label="Companies"
						value={previewValues.companies}
						onChange={(value) => onUpdatePreviewValues({ companies: value })}
					/>
					<NumberField
						icon={<GitBranch className="h-4 w-4" aria-hidden="true" />}
						label="Branches"
						value={previewValues.branches}
						onChange={(value) => onUpdatePreviewValues({ branches: value })}
					/>
					<NumberField
						icon={<Users className="h-4 w-4" aria-hidden="true" />}
						label="Users"
						value={previewValues.users}
						onChange={(value) => onUpdatePreviewValues({ users: value })}
					/>
				</div>

				<div className="rounded-lg bg-offwhite p-4 ring-1 ring-darknavy/8">
					<div className="flex flex-col gap-3 border-b border-darknavy/10 pb-4 sm:flex-row sm:items-start sm:justify-between">
						<div>
							<p className="text-sm font-semibold text-darknavy/55">
								{values.name}
							</p>
							<p className="mt-1 text-2xl font-semibold text-darknavy">
								{formatMasterSubscriptionCurrency(preview.total)}
							</p>
						</div>
						<span className="inline-flex items-center gap-2 rounded-md bg-white px-3 py-1.5 text-xs font-semibold text-darknavy/65 ring-1 ring-darknavy/10">
							<Calculator className="h-3.5 w-3.5" aria-hidden="true" />
							{preview.effectiveDiscountPercent}% effective discount
						</span>
					</div>
					<div className="grid gap-3 pt-4">
						<PreviewLine
							label="Base plan"
							value={formatMasterSubscriptionCurrency(preview.basePrice)}
						/>
						<PreviewLine
							label="Company overage"
							value={formatMasterSubscriptionCurrency(preview.companyCharge)}
						/>
						<PreviewLine
							label="Branch / satellite overage"
							value={formatMasterSubscriptionCurrency(preview.branchCharge)}
						/>
						<PreviewLine
							label="User overage"
							value={formatMasterSubscriptionCurrency(preview.userCharge)}
						/>
					</div>
				</div>

				<div className="grid gap-2 text-sm text-darknavy/65">
					<IncludedLine
						icon={<Building2 className="h-4 w-4" aria-hidden="true" />}
						label="Companies included"
						value={values.includedCompanies}
					/>
					<IncludedLine
						icon={<GitBranch className="h-4 w-4" aria-hidden="true" />}
						label="Branches included"
						value={values.includedBranches}
					/>
					<IncludedLine
						icon={<Users className="h-4 w-4" aria-hidden="true" />}
						label="Users included"
						value={values.includedUsers}
					/>
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

function SelectField<TOption extends string>({
	label,
	optionLabels,
	options,
	value,
	onChange,
}: {
	label: string;
	optionLabels?: Partial<Record<TOption, string>>;
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
						{optionLabels?.[option] ?? option}
					</option>
				))}
			</select>
		</label>
	);
}

function NumberField({
	error,
	icon,
	label,
	value,
	onChange,
}: {
	error?: string;
	icon?: ReactNode;
	label: string;
	value: number | "";
	onChange: (value: number) => void;
}) {
	return (
		<label className={FieldLabelClassName}>
			{label}
			<span className="relative block">
				{icon ? (
					<span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-darknavy/38">
						{icon}
					</span>
				) : null}
				<input
					type="number"
					min={0}
					inputMode="numeric"
					value={value}
					onChange={(event) => onChange(toNumber(event.target.value))}
					className={joinClasses(ControlClassName, icon ? "pl-9" : undefined)}
				/>
			</span>
			<FieldError message={error} />
		</label>
	);
}

function PreviewLine({ label, value }: { label: string; value: string }) {
	return (
		<div className="flex items-center justify-between gap-4 text-sm">
			<span className="text-darknavy/58">{label}</span>
			<span className="font-semibold text-darknavy">{value}</span>
		</div>
	);
}

function IncludedLine({
	icon,
	label,
	value,
}: {
	icon: ReactNode;
	label: string;
	value: number;
}) {
	return (
		<div className="flex items-center justify-between gap-3 rounded-lg border border-darknavy/10 bg-white px-3 py-2">
			<span className="inline-flex items-center gap-2">
				<span className="text-skyblue">{icon}</span>
				{label}
			</span>
			<span className="font-semibold text-darknavy">{value}</span>
		</div>
	);
}

function FieldError({ message }: { message?: string }) {
	if (!message) {
		return null;
	}

	return <span className="text-xs font-semibold text-coralpink">{message}</span>;
}

function MasterSubscriptionPlanStatusBadge({
	status,
}: {
	status: MasterSubscriptionPlanStatus;
}) {
	const classes = {
		Active: "bg-citron/30 text-darknavy ring-citron/45",
		Draft: "bg-offwhite text-darknavy/70 ring-darknavy/10",
		Inactive: "bg-coralpink/12 text-coralpink ring-coralpink/20",
	} satisfies Record<MasterSubscriptionPlanStatus, string>;

	return (
		<span
			className={joinClasses(
				"inline-flex rounded-md px-2.5 py-1 text-xs font-semibold ring-1",
				classes[status],
			)}
		>
			{status}
		</span>
	);
}

function toNumber(value: string) {
	const parsedValue = Number(value);

	return Number.isFinite(parsedValue) ? parsedValue : 0;
}
