import type { ChangeEventHandler, FormEvent, ReactNode } from "react";
import { CircleDollarSign, ListChecks } from "lucide-react";
import {
	ApprovalAmountConditionModeOptions,
	ApprovalAmountConditionOperatorOptions,
	ApprovalManagementStatusOptions,
	ApprovalStageCountOptions,
	ApprovalStageRequirementOptions,
	ApprovalWorkflowFeatureOptions,
} from "@/app/src/constants/modules/system-administration/approval-management/ApprovalManagementConstants";
import type {
	ApprovalApproverOption,
	ApprovalManagementFormErrors,
	ApprovalManagementFormValues,
	ApprovalManagementModuleCode,
	ApprovalManagementModuleOption,
	ApprovalRoutingRuleFormErrors,
	ApprovalRoutingRuleFormValues,
	ApprovalStageFormValues,
	ApprovalStageRequirement,
	ApprovalWorkflowFeatureKey,
} from "@/app/src/types/modules/system-administration/approval-management/ApprovalManagementTypes";
import {
	AppAdvancedDropdown,
	type AppAdvancedDropdownOption,
} from "@/app/src/ui/shared/advanced-dropdown/AppAdvancedDropdown";

type ApprovalManagementFormProps = {
	approverOptions: ApprovalApproverOption[];
	errors: ApprovalManagementFormErrors;
	hasAmountCondition: boolean;
	isReadonly: boolean;
	moduleOptions: ApprovalManagementModuleOption[];
	values: ApprovalManagementFormValues;
	onAmountConditionModeChange: (hasAmountCondition: boolean) => void;
	onInputChange: ChangeEventHandler<
		HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
	>;
	onModuleCodeChange: (moduleCode: ApprovalManagementModuleCode) => void;
	onRoutingRuleFieldChange: <
		TKey extends keyof ApprovalRoutingRuleFormValues,
	>(
		routingRuleId: string,
		field: TKey,
		value: ApprovalRoutingRuleFormValues[TKey],
	) => void;
	onRoutingRuleStageToggle: (routingRuleId: string, stageId: string) => void;
	onStageFieldChange: <TKey extends keyof ApprovalStageFormValues>(
		stageId: string,
		field: TKey,
		value: ApprovalStageFormValues[TKey],
	) => void;
	onSubmit: (event: FormEvent<HTMLFormElement>) => void;
	onWorkflowFeatureChange: (
		feature: ApprovalWorkflowFeatureKey,
		enabled: boolean,
	) => void;
};

export function ApprovalManagementForm({
	approverOptions,
	errors,
	hasAmountCondition,
	isReadonly,
	moduleOptions,
	onAmountConditionModeChange,
	onInputChange,
	onModuleCodeChange,
	onRoutingRuleFieldChange,
	onRoutingRuleStageToggle,
	onStageFieldChange,
	onSubmit,
	onWorkflowFeatureChange,
	values,
}: ApprovalManagementFormProps) {
	const dropdownApproverOptions =
		createDropdownApproverOptions(approverOptions);
	const visibleRoutingRules = hasAmountCondition
		? values.routingRules.filter((rule) => rule.basis === "amount")
		: values.routingRules;

	return (
		<form
			id="approval-management-form"
			onSubmit={onSubmit}
			className="grid gap-5"
		>
			<section className="rounded-lg border border-darknavy/10 bg-white p-5 shadow-sm">
				<h2 className="text-base font-semibold text-darknavy">
					Workflow Setup
				</h2>
				<div className="mt-4 grid gap-4 lg:grid-cols-2">
					<FormField
						label="Module"
						error={errors.moduleCode}
						required
					>
						<select
							name="moduleCode"
							value={values.moduleCode}
							onChange={(event) =>
								onModuleCodeChange(
									event.target
										.value as ApprovalManagementModuleCode,
								)
							}
							disabled={isReadonly}
							className={fieldClassName}
						>
							<option value="">Select module</option>
							{moduleOptions.map((option) => (
								<option key={option.code} value={option.code}>
									{option.name} ({option.code})
								</option>
							))}
						</select>
					</FormField>
					<FormField
						label="Number of Approval Stages"
						error={errors.stageCount}
						required
					>
						<select
							name="stageCount"
							value={values.stageCount}
							onChange={onInputChange}
							disabled={isReadonly}
							className={fieldClassName}
						>
							{ApprovalStageCountOptions.map((stageCount) => (
								<option key={stageCount} value={stageCount}>
									{stageCount}
								</option>
							))}
						</select>
					</FormField>
					<FormField label="Status" error={errors.status} required>
						<select
							name="status"
							value={values.status}
							onChange={onInputChange}
							disabled={isReadonly}
							className={fieldClassName}
						>
							{ApprovalManagementStatusOptions.map((status) => (
								<option key={status} value={status}>
									{status}
								</option>
							))}
						</select>
					</FormField>
					<FormField
						label="Description"
						error={errors.description}
						wide
					>
						<textarea
							name="description"
							value={values.description}
							onChange={onInputChange}
							readOnly={isReadonly}
							className={`${fieldClassName} min-h-24 py-3`}
							placeholder="Workflow notes"
						/>
					</FormField>
				</div>
			</section>

			<section className="grid gap-3">
				<div className="flex items-center justify-between gap-3">
					<h2 className="text-base font-semibold text-darknavy">
						Approval Stages
					</h2>
					<span className="rounded-full bg-skyblue/12 px-3 py-1 text-xs font-semibold text-darknavy">
						{values.stageCount}{" "}
						{values.stageCount === 1 ? "stage" : "stages"}
					</span>
				</div>
				{values.stages.map((stage) => {
					const stageErrors = errors.stages?.[stage.id] ?? {};

					return (
						<article
							key={stage.id}
							className="rounded-lg border border-darknavy/10 bg-white p-5 shadow-sm"
						>
							<div className="mb-4 flex flex-wrap items-center justify-between gap-3">
								<h3 className="text-sm font-semibold uppercase tracking-wide text-darknavy/55">
									Stage {stage.sequence}
								</h3>
								<span
									className={
										stage.requirement === "all"
											? "rounded-full bg-citron/35 px-3 py-1 text-xs font-semibold text-darknavy"
											: "rounded-full bg-skyblue/12 px-3 py-1 text-xs font-semibold text-darknavy"
									}
								>
									{stage.requirement === "all"
										? "All approvers"
										: "Any one approver"}
								</span>
							</div>
							<div className="grid gap-4 lg:grid-cols-2">
								<FormField
									label="Stage Name"
									error={stageErrors.name}
									required
								>
									<input
										value={stage.name}
										onChange={(event) =>
											onStageFieldChange(
												stage.id,
												"name",
												event.target.value,
											)
										}
										readOnly={isReadonly}
										className={fieldClassName}
									/>
								</FormField>
								<FormField
									label="Condition to Proceed"
									error={stageErrors.requirement}
									required
								>
									<select
										value={stage.requirement}
										onChange={(event) =>
											onStageFieldChange(
												stage.id,
												"requirement",
												event.target
													.value as ApprovalStageRequirement,
											)
										}
										disabled={isReadonly}
										className={fieldClassName}
									>
										{ApprovalStageRequirementOptions.map(
											(option) => (
												<option
													key={option.value}
													value={option.value}
												>
													{option.label}
												</option>
											),
										)}
									</select>
								</FormField>
								<FormField
									label="Approvers"
									error={stageErrors.approverIds}
									required
									wide
								>
									<AppAdvancedDropdown
										isClearable
										menuPortal
										readOnly={isReadonly}
										searchPlaceholder="Search approvers"
										selectionMode="multiple"
										showSelectedDetails
										options={dropdownApproverOptions}
										placeholder="Select approvers"
										value={stage.approverIds}
										onChange={(nextValue) =>
											onStageFieldChange(
												stage.id,
												"approverIds",
												Array.isArray(nextValue)
													? nextValue
													: nextValue
														? [nextValue]
														: [],
											)
										}
									/>
								</FormField>
							</div>
						</article>
					);
				})}
			</section>

			<section className="grid gap-3">
				<div className="flex flex-wrap items-center justify-between gap-3">
					<h2 className="text-base font-semibold text-darknavy">
						Approval Matrix
					</h2>
					<span className="rounded-full bg-skyblue/12 px-3 py-1 text-xs font-semibold text-darknavy">
						{hasAmountCondition
							? "Amount condition"
							: "Standard path"}
					</span>
				</div>
				<div className="grid gap-3 md:grid-cols-2">
					{ApprovalAmountConditionModeOptions.map((option) => {
						const isAmountOption = option.value === "amount";
						const isActive = isAmountOption
							? hasAmountCondition
							: !hasAmountCondition;
						const Icon = isAmountOption
							? CircleDollarSign
							: ListChecks;

						return (
							<button
								key={option.value}
								type="button"
								disabled={isReadonly}
								onClick={() =>
									onAmountConditionModeChange(isAmountOption)
								}
								className={
									isActive
										? "flex min-h-20 items-center gap-3 rounded-lg border border-skyblue bg-skyblue/12 px-4 py-3 text-left shadow-sm transition disabled:cursor-default disabled:opacity-90"
										: "flex min-h-20 items-center gap-3 rounded-lg border border-darknavy/10 bg-white px-4 py-3 text-left shadow-sm transition hover:border-skyblue/60 hover:bg-skyblue/10 disabled:cursor-default disabled:opacity-90"
								}
								aria-pressed={isActive}
							>
								<span
									className={
										isActive
											? "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-darknavy text-white"
											: "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-offwhite text-darknavy"
									}
								>
									<Icon
										className="h-5 w-5"
										aria-hidden="true"
									/>
								</span>
								<span className="min-w-0">
									<span className="block text-sm font-semibold text-darknavy">
										{option.label}
									</span>
									<span className="mt-1 block text-xs font-medium text-darknavy/55">
										{option.description}
									</span>
								</span>
							</button>
						);
					})}
				</div>
				<div className="grid gap-3">
					{visibleRoutingRules.map((routingRule) => {
						const routingRuleErrors =
							errors.routingRules?.[routingRule.id] ?? {};
						const isDefaultRoute = routingRule.basis === "default";
						const routeTitle = isDefaultRoute
							? "Standard Approval Path"
							: "Amount Condition";

						return (
							<article
								key={routingRule.id}
								className={
									isDefaultRoute
										? "rounded-lg border border-darknavy/10 bg-white p-5 shadow-sm"
										: "rounded-lg border border-citron/60 bg-citron/10 p-5 shadow-sm"
								}
							>
								<div className="mb-4 flex flex-wrap items-center justify-between gap-3">
									<div className="flex min-w-0 items-center gap-3">
										<span
											className={
												isDefaultRoute
													? "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-skyblue/12 text-sm font-bold text-darknavy"
													: "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-citron/45 text-sm font-bold text-darknavy"
											}
										>
											{routingRule.sequence}
										</span>
										<h3 className="truncate text-sm font-semibold text-darknavy">
											{routeTitle}
										</h3>
									</div>
									<span
										className={
											isDefaultRoute
												? "rounded-full bg-skyblue/12 px-3 py-1 text-xs font-semibold text-darknavy"
												: "rounded-full bg-citron/45 px-3 py-1 text-xs font-semibold text-darknavy"
										}
									>
										{isDefaultRoute
											? "No condition"
											: "Amount"}
									</span>
								</div>
								<div className="grid gap-4 lg:grid-cols-2">
									<FormField
										label="Route Name"
										error={routingRuleErrors.name}
										required
									>
										<input
											value={routingRule.name}
											onChange={(event) =>
												onRoutingRuleFieldChange(
													routingRule.id,
													"name",
													event.target.value,
												)
											}
											readOnly={isReadonly}
											className={fieldClassName}
										/>
									</FormField>
									<RoutingConditionFields
										errors={routingRuleErrors}
										isReadonly={isReadonly}
										routingRule={routingRule}
										onRoutingRuleFieldChange={
											onRoutingRuleFieldChange
										}
									/>
									<FormField
										label="Approval Path"
										error={routingRuleErrors.stageIds}
										required
										wide
									>
										<div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
											{values.stages.map((stage) => (
												<label
													key={stage.id}
													className="flex min-h-12 items-center gap-3 rounded-md border border-darknavy/10 bg-offwhite/45 px-3 py-2 text-sm font-medium text-darknavy"
												>
													<input
														type="checkbox"
														checked={routingRule.stageIds.includes(
															stage.id,
														)}
														onChange={() =>
															onRoutingRuleStageToggle(
																routingRule.id,
																stage.id,
															)
														}
														disabled={isReadonly}
														className="h-4 w-4 accent-darknavy"
													/>
													<span>
														Stage {stage.sequence}:{" "}
														{stage.name}
													</span>
												</label>
											))}
										</div>
									</FormField>
								</div>
							</article>
						);
					})}
				</div>
			</section>

			<section className="rounded-lg border border-darknavy/10 bg-white p-5 shadow-sm">
				<h2 className="text-base font-semibold text-darknavy">
					Workflow Features
				</h2>
				<div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
					{ApprovalWorkflowFeatureOptions.map((feature) => (
						<label
							key={feature.key}
							className="flex min-h-12 items-center gap-3 rounded-md border border-darknavy/10 bg-offwhite/45 px-3 py-2 text-sm font-semibold text-darknavy"
						>
							<input
								type="checkbox"
								checked={values.workflowFeatures[feature.key]}
								onChange={(event) =>
									onWorkflowFeatureChange(
										feature.key,
										event.target.checked,
									)
								}
								disabled={isReadonly}
								className="h-4 w-4 accent-darknavy"
							/>
							<span>{feature.label}</span>
						</label>
					))}
				</div>
			</section>
		</form>
	);
}

function RoutingConditionFields({
	errors,
	isReadonly,
	onRoutingRuleFieldChange,
	routingRule,
}: {
	errors: ApprovalRoutingRuleFormErrors;
	isReadonly: boolean;
	onRoutingRuleFieldChange: <
		TKey extends keyof ApprovalRoutingRuleFormValues,
	>(
		routingRuleId: string,
		field: TKey,
		value: ApprovalRoutingRuleFormValues[TKey],
	) => void;
	routingRule: ApprovalRoutingRuleFormValues;
}) {
	if (routingRule.basis === "default") {
		return null;
	}

	if (routingRule.basis === "amount") {
		return (
			<>
				<FormField
					label="Amount Rule"
					error={errors.amountOperator}
					required
				>
					<select
						value={routingRule.amountOperator}
						onChange={(event) =>
							onRoutingRuleFieldChange(
								routingRule.id,
								"amountOperator",
								event.target
									.value as ApprovalRoutingRuleFormValues["amountOperator"],
							)
						}
						disabled={isReadonly}
						className={fieldClassName}
					>
						{ApprovalAmountConditionOperatorOptions.map(
							(option) => (
								<option key={option.value} value={option.value}>
									{option.label}
								</option>
							),
						)}
					</select>
				</FormField>
				<FormField label="Amount" error={errors.amountValue} required>
					<input
						inputMode="decimal"
						value={routingRule.amountValue}
						onChange={(event) =>
							onRoutingRuleFieldChange(
								routingRule.id,
								"amountValue",
								event.target.value,
							)
						}
						readOnly={isReadonly}
						className={fieldClassName}
						placeholder="100000.00"
					/>
				</FormField>
				{routingRule.amountOperator === "between" ? (
					<FormField
						label="Ending Amount"
						error={errors.amountValueTo}
						required
					>
						<input
							inputMode="decimal"
							value={routingRule.amountValueTo}
							onChange={(event) =>
								onRoutingRuleFieldChange(
									routingRule.id,
									"amountValueTo",
									event.target.value,
								)
							}
							readOnly={isReadonly}
							className={fieldClassName}
							placeholder="250000.00"
						/>
					</FormField>
				) : null}
			</>
		);
	}

	return null;
}

function createDropdownApproverOptions(
	approvers: ApprovalApproverOption[],
): AppAdvancedDropdownOption[] {
	return approvers.map((approver) => ({
		description: approver.email,
		label: approver.role,
		name: approver.name,
		value: approver.id,
	}));
}

function FormField({
	children,
	error,
	label,
	required,
	wide,
}: {
	children: ReactNode;
	error?: string;
	label: string;
	required?: boolean;
	wide?: boolean;
}) {
	return (
		<div className={wide ? "lg:col-span-2" : undefined}>
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
		</div>
	);
}

const fieldClassName =
	"min-h-11 w-full rounded-md border border-darknavy/15 bg-white px-3 text-sm font-medium text-darknavy outline-none transition placeholder:text-darknavy/35 focus:border-skyblue focus:ring-2 focus:ring-skyblue/20 disabled:cursor-default disabled:bg-offwhite/65 disabled:text-darknavy read-only:bg-offwhite/65";
