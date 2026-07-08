"use client";

import {
	useState,
	type ChangeEventHandler,
	type FormEventHandler,
	type ReactNode,
} from "react";
import {
	ArrowRight,
	BadgeCheck,
	ChevronDown,
	CircleDollarSign,
	ListChecks,
	MoreVertical,
	Plus,
	RefreshCw,
	Route,
	Save,
	Settings2,
	Trash2,
	UsersRound,
} from "lucide-react";
import {
	ApprovalAmountConditionLimit,
	ApprovalAmountConditionModeOptions,
	ApprovalAmountConditionOperatorOptions,
	ApprovalStageCountOptions,
} from "@/app/src/constants/modules/system-administration/approval-management/ApprovalManagementConstants";
import {
	ApproverSetupMockData,
	getApproverSetupInitials,
	getApproverSetupUser,
} from "@/app/src/data/modules/system-administration/user-management/approver-setup/ApproverSetupData";
import { formatApprovalRoutingCondition } from "@/app/src/services/modules/system-administration/approval-management/ApprovalManagementFormatters";
import type {
	ApprovalApproverOption,
	ApprovalManagementFormErrors,
	ApprovalManagementFormValues,
	ApprovalManagementRecord,
	ApprovalRoutingRuleFormErrors,
	ApprovalRoutingRuleFormValues,
	ApprovalStageFormValues,
} from "@/app/src/types/modules/system-administration/approval-management/ApprovalManagementTypes";
import type {
	ApproverAssignmentType,
	ApproverSetupRecord,
} from "@/app/src/types/modules/system-administration/user-management/approver-setup/ApproverSetupTypes";
import type { UserListRecord } from "@/app/src/types/modules/user-management/UserListTypes";
import { AppSkeleton } from "@/app/src/ui/shared/app/AppSkeleton";

const approvalManagementFieldClassName =
	"min-h-11 w-full rounded-md border border-darknavy/15 bg-white px-3 text-sm font-medium text-darknavy outline-none transition placeholder:text-darknavy/35 focus:border-skyblue focus:ring-2 focus:ring-skyblue/20 disabled:cursor-default disabled:bg-offwhite/65 disabled:text-darknavy read-only:bg-offwhite/65";

const approvalManagementPrimaryButtonClassName =
	"theme-accent-contrast-text inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-[var(--skyblue)] bg-[var(--skyblue)] px-4 text-sm font-semibold !text-[var(--skyblue-contrast)] shadow-sm transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgb(var(--skyblue-rgb)/0.2)] disabled:cursor-not-allowed disabled:opacity-60";

const approvalManagementApproverTypeOptions: ApproverAssignmentType[] = [
	"Level-based",
	"No condition",
	"Temporary",
];

type ApprovalManagementEditorProps = {
	approverOptions: ApprovalApproverOption[];
	errors: ApprovalManagementFormErrors;
	isLoading: boolean;
	isMutating: boolean;
	selectedWorkflow?: ApprovalManagementRecord;
	values: ApprovalManagementFormValues;
	onInputChange: ChangeEventHandler<
		HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
	>;
	onAmountConditionModeChange: (hasAmountCondition: boolean) => void;
	onAddAmountConditionRule: () => void;
	onRemoveAmountConditionRule: (routingRuleId: string) => void;
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
	onSubmit: FormEventHandler<HTMLFormElement>;
};

export function ApprovalManagementEditor({
	errors,
	isLoading,
	isMutating,
	onAddAmountConditionRule,
	onAmountConditionModeChange,
	onInputChange,
	onRemoveAmountConditionRule,
	onRoutingRuleFieldChange,
	onRoutingRuleStageToggle,
	onSubmit,
	selectedWorkflow,
	values,
}: ApprovalManagementEditorProps) {
	const [selectedApproverType, setSelectedApproverType] = useState<
		ApproverAssignmentType | ""
	>("");

	if (isLoading) {
		return <ApprovalManagementEditorSkeleton />;
	}

	if (!selectedWorkflow) {
		return (
			<div className="flex min-h-96 items-center justify-center p-6 text-sm font-medium text-darknavy/55">
				Select an approval workflow to configure its path.
			</div>
		);
	}

	const hasAmountCondition = values.routingRules.some(
		(rule) => rule.basis === "amount",
	);

	return (
		<form
			onSubmit={onSubmit}
			className="approval-management-editor grid min-h-0 min-w-0 content-start gap-4 p-4 lg:p-5"
		>
			<div className="flex flex-wrap items-center justify-between gap-4 border-b border-darknavy/10 pb-4">
				<div className="min-w-0">
					<h2 className="truncate text-xl font-semibold tracking-tight text-darknavy">
						{selectedWorkflow.moduleName}
					</h2>
					<div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs font-semibold">
						<span className="rounded-md border border-skyblue/15 bg-skyblue/8 px-2 py-0.5 text-skyblue">
							{selectedWorkflow.moduleCode}
						</span>
						<span className="rounded-md border border-darknavy/8 bg-offwhite/60 px-2 py-0.5 text-darknavy/65">
							{values.stageCount} approval level
							{values.stageCount === 1 ? "" : "s"}
						</span>
						{hasAmountCondition ? (
							<span className="inline-flex items-center gap-1.5 rounded-md border border-emerald-500/20 bg-emerald-50 px-2 py-0.5 text-emerald-700">
								<BadgeCheck
									className="h-3.5 w-3.5"
									aria-hidden="true"
								/>
								Amount-based rules enabled
							</span>
						) : (
							<span className="inline-flex items-center gap-1.5 rounded-md border border-darknavy/8 bg-offwhite/60 px-2 py-0.5 text-darknavy/55">
								<ListChecks
									className="h-3.5 w-3.5"
									aria-hidden="true"
								/>
								Single approval path
							</span>
						)}
					</div>
				</div>
				<button
					type="submit"
					disabled={isLoading || isMutating}
					className={approvalManagementPrimaryButtonClassName}
				>
					{isMutating ? (
						<RefreshCw
							className="h-4 w-4 animate-spin"
							aria-hidden="true"
						/>
					) : (
						<Save className="h-4 w-4" aria-hidden="true" />
					)}
					Update Workflow
				</button>
			</div>

			<section className="rounded-lg border border-darknavy/10 bg-white shadow-sm shadow-darknavy/5">
				<div className="flex items-center gap-2 px-4 py-3">
					<Settings2
						className="h-4 w-4 text-darknavy/55"
						aria-hidden="true"
					/>
					<h3 className="text-base font-semibold text-darknavy">
						Workflow Details
					</h3>
				</div>
				<div className="grid gap-4 px-4 pb-4 md:grid-cols-3">
					<ApprovalManagementField
						label="Module"
						error={errors.moduleCode}
					>
						<input
							value={selectedWorkflow.moduleName}
							readOnly
							className={`${approvalManagementFieldClassName} bg-offwhite/65`}
						/>
					</ApprovalManagementField>
					<ApprovalManagementField
						label="Module Code"
						error={errors.moduleCode}
					>
						<input
							value={selectedWorkflow.moduleCode}
							readOnly
							className={`${approvalManagementFieldClassName} bg-offwhite/65 font-mono`}
						/>
					</ApprovalManagementField>
					<ApprovalManagementField
						label="Approval Levels"
						error={errors.stageCount}
					>
						<select
							name="stageCount"
							value={values.stageCount}
							onChange={onInputChange}
							className={approvalManagementFieldClassName}
						>
							{ApprovalStageCountOptions.map((stageCount) => (
								<option key={stageCount} value={stageCount}>
									{stageCount}
								</option>
							))}
						</select>
					</ApprovalManagementField>
				</div>
			</section>

			<ApprovalSetupLevelViewer
				moduleName={selectedWorkflow.moduleName}
				selectedApproverType={selectedApproverType}
				stageCount={values.stageCount}
				onApproverTypeChange={setSelectedApproverType}
			/>

			<ApprovalMatrix
				errors={errors}
				hasAmountCondition={values.routingRules.some(
					(rule) => rule.basis === "amount",
				)}
				routingRules={values.routingRules}
				stages={values.stages}
				onAddAmountConditionRule={onAddAmountConditionRule}
				onAmountConditionModeChange={onAmountConditionModeChange}
				onRemoveAmountConditionRule={onRemoveAmountConditionRule}
				onRoutingRuleFieldChange={onRoutingRuleFieldChange}
				onRoutingRuleStageToggle={onRoutingRuleStageToggle}
			/>
		</form>
	);
}

function ApprovalMatrix({
	errors,
	hasAmountCondition,
	onAddAmountConditionRule,
	onAmountConditionModeChange,
	onRemoveAmountConditionRule,
	onRoutingRuleFieldChange,
	onRoutingRuleStageToggle,
	routingRules,
	stages,
}: {
	errors: ApprovalManagementFormErrors;
	hasAmountCondition: boolean;
	routingRules: ApprovalRoutingRuleFormValues[];
	stages: ApprovalStageFormValues[];
	onAddAmountConditionRule: () => void;
	onAmountConditionModeChange: (hasAmountCondition: boolean) => void;
	onRemoveAmountConditionRule: (routingRuleId: string) => void;
	onRoutingRuleFieldChange: <
		TKey extends keyof ApprovalRoutingRuleFormValues,
	>(
		routingRuleId: string,
		field: TKey,
		value: ApprovalRoutingRuleFormValues[TKey],
	) => void;
	onRoutingRuleStageToggle: (routingRuleId: string, stageId: string) => void;
}) {
	const amountRuleCount = routingRules.filter(
		(rule) => rule.basis === "amount",
	).length;
	const canAddAmountCondition =
		amountRuleCount < ApprovalAmountConditionLimit;
	const [openRoutingRuleId, setOpenRoutingRuleId] = useState<string | null>(
		null,
	);
	const visibleRoutingRules = hasAmountCondition
		? routingRules.filter((rule) => rule.basis === "amount")
		: routingRules;
	const usesRouteAccordion = visibleRoutingRules.length > 1;
	const handleAddAmountConditionRule = () => {
		onAddAmountConditionRule();
	};

	return (
		<section className="overflow-hidden rounded-lg border border-darknavy/10 bg-white shadow-sm shadow-darknavy/5">
			<div className="flex flex-wrap items-center justify-between gap-3 border-b border-darknavy/10 px-4 py-3">
				<div className="flex items-center gap-2">
					<Route
						className="h-4 w-4 text-darknavy/55"
						aria-hidden="true"
					/>
					<h3 className="text-base font-semibold text-darknavy">
						Approval Rules
					</h3>
				</div>
				<span className="rounded-full bg-skyblue/12 px-3 py-1 text-xs font-semibold text-darknavy">
					{hasAmountCondition
						? `${amountRuleCount} condition${amountRuleCount === 1 ? "" : "s"}`
						: "Standard path"}
				</span>
			</div>
			<div className="grid gap-4 p-4">
				<div>
					<div className="mb-2 text-sm font-semibold text-darknavy/70">
						Rule type
					</div>
					<div className="grid gap-2 md:grid-cols-2">
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
									onClick={() =>
										onAmountConditionModeChange(
											isAmountOption,
										)
									}
									className={
										isActive
											? "flex min-h-16 items-center gap-3 rounded-md border border-skyblue bg-skyblue/5 px-3 py-2 text-left shadow-sm shadow-skyblue/10 transition"
											: "flex min-h-16 items-center gap-3 rounded-md border border-darknavy/12 bg-white px-3 py-2 text-left transition hover:border-skyblue/25 hover:bg-offwhite/65"
									}
									aria-pressed={isActive}
								>
									<span
										className={
											isActive
												? "h-4 w-4 shrink-0 rounded-full border-4 border-skyblue bg-white"
												: "h-4 w-4 shrink-0 rounded-full border border-darknavy/35 bg-white"
										}
										aria-hidden="true"
									/>
									<span
										className={
											isActive
												? "h-8 w-px shrink-0 bg-skyblue/25"
												: "h-8 w-px shrink-0 bg-darknavy/10"
										}
										aria-hidden="true"
									/>
									<span
										className={
											isActive
												? "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-skyblue/20 bg-white text-skyblue"
												: "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-offwhite text-darknavy/60"
										}
									>
										<Icon
											className="h-4 w-4"
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
				</div>
				{hasAmountCondition ? (
					<div className="flex flex-wrap items-center justify-between gap-3">
						<div>
							<div className="text-base font-semibold text-darknavy">
								Conditions
							</div>
							<div className="mt-0.5 text-xs font-medium text-darknavy/55">
								Add up to five conditions.
							</div>
						</div>
						<button
							type="button"
							onClick={handleAddAmountConditionRule}
							disabled={!canAddAmountCondition}
							className="inline-flex min-h-9 items-center justify-center gap-2 rounded-md border border-skyblue/35 bg-white px-3 text-sm font-semibold text-darknavy shadow-sm transition hover:bg-skyblue/10 disabled:cursor-not-allowed disabled:border-darknavy/10 disabled:bg-offwhite disabled:text-darknavy/40 disabled:shadow-none"
						>
							<Plus className="h-4 w-4" aria-hidden="true" />
							{canAddAmountCondition
								? "Add Condition"
								: "Limit Reached"}
						</button>
					</div>
				) : null}
				<div className="grid gap-3">
					{visibleRoutingRules.map((routingRule) => {
						const routingRuleErrors =
							errors.routingRules?.[routingRule.id] ?? {};
						const isDefaultRoute = routingRule.basis === "default";
						const isRouteOpen =
							!usesRouteAccordion ||
							openRoutingRuleId === routingRule.id;
						const routeTitle = isDefaultRoute
							? "Standard Approval Path"
							: routingRule.name ||
								`Rule ${routingRule.sequence}`;
						const selectedStages = stages.filter((stage) =>
							routingRule.stageIds.includes(stage.id),
						);

						return (
							<article
								key={routingRule.id}
								className={
									!isDefaultRoute
										? "overflow-hidden rounded-md border border-skyblue/30 bg-skyblue/5 shadow-sm shadow-skyblue/10"
										: "overflow-hidden rounded-md border border-darknavy/10 bg-white shadow-sm shadow-darknavy/5"
								}
							>
								<div
									onClick={() =>
										setOpenRoutingRuleId(
											isRouteOpen ? null : routingRule.id,
										)
									}
									className={
										"grid cursor-pointer gap-3 p-3 lg:grid-cols-[minmax(15rem,0.85fr)_minmax(0,1.15fr)_auto]"
									}
								>
									<button
										type="button"
										className="flex min-w-0 items-center gap-3 text-left"
										aria-expanded={isRouteOpen}
									>
										<span
											className={
												!isDefaultRoute
													? "inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-md border border-skyblue/20 bg-white text-base font-bold text-darknavy shadow-sm"
													: "inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-md border border-darknavy/10 bg-white text-base font-bold text-darknavy shadow-sm"
											}
										>
											{routingRule.sequence}
										</span>
										<div className="min-w-0">
											<h4 className="truncate text-sm font-semibold text-darknavy">
												{routeTitle}
											</h4>
											<RuleConditionSummary
												routingRule={routingRule}
											/>
										</div>
									</button>
									<div className="min-w-0 border-darknavy/10 lg:border-l lg:pl-5">
										<div className="text-sm font-semibold text-darknavy/65">
											Approval path
										</div>
										<ApprovalPathSummary
											stages={selectedStages}
										/>
									</div>
									<div className="flex items-center justify-end gap-1">
										{!isDefaultRoute &&
										amountRuleCount > 1 ? (
											<button
												type="button"
												onClick={(event) => {
													event.stopPropagation();
													onRemoveAmountConditionRule(
														routingRule.id,
													);
												}}
												className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-darknavy/10 bg-white text-darknavy/55 transition hover:border-coralpink/40 hover:bg-coralpink/10 hover:text-coralpink"
												aria-label={`Remove ${routeTitle}`}
											>
												<Trash2
													className="h-4 w-4"
													aria-hidden="true"
												/>
											</button>
										) : null}
										{usesRouteAccordion ? (
											<button
												type="button"
												className="inline-flex h-8 w-8 items-center justify-center rounded-md text-darknavy/55 transition hover:bg-white"
												aria-label={`${isRouteOpen ? "Close" : "Open"} ${routeTitle}`}
											>
												<ChevronDown
													className={`h-4 w-4 transition ${isRouteOpen ? "rotate-180" : ""}`}
													aria-hidden="true"
												/>
											</button>
										) : null}
										<MoreVertical
											className="h-4 w-4 text-darknavy/45"
											aria-hidden="true"
										/>
									</div>
								</div>
								{isRouteOpen ? (
									<div className="grid gap-4 border-t border-darknavy/10 bg-white p-4 md:grid-cols-2">
										<ApprovalManagementField
											label="Route Name"
											error={routingRuleErrors.name}
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
												className={
													approvalManagementFieldClassName
												}
											/>
										</ApprovalManagementField>
										<RoutingConditionFields
											errors={routingRuleErrors}
											routingRule={routingRule}
											onRoutingRuleFieldChange={
												onRoutingRuleFieldChange
											}
										/>
										<div className="md:col-span-2">
											<div className="mb-2 text-sm font-semibold text-darknavy">
												Approval Path
											</div>
											<div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
												{stages.map((stage) => (
													<label
														key={stage.id}
														className="flex min-h-12 items-center gap-3 rounded-md border border-darknavy/10 bg-offwhite/35 px-3 py-2 text-sm font-medium text-darknavy transition hover:border-skyblue/40 hover:bg-white"
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
															className="h-4 w-4 accent-skyblue"
														/>
														<span>
															Level{" "}
															{stage.sequence}:{" "}
															{stage.name}
														</span>
													</label>
												))}
											</div>
											{routingRuleErrors.stageIds ? (
												<span className="mt-1 block text-xs font-medium text-coralpink">
													{routingRuleErrors.stageIds}
												</span>
											) : null}
										</div>
									</div>
								) : null}
							</article>
						);
					})}
				</div>
			</div>
		</section>
	);
}

function RuleConditionSummary({
	routingRule,
}: {
	routingRule: ApprovalRoutingRuleFormValues;
}) {
	if (routingRule.basis === "default") {
		return (
			<p className="mt-1 text-xs font-medium text-darknavy/55">
				For all other amounts
			</p>
		);
	}

	return (
		<div className="mt-1">
			<p className="text-xs font-medium text-darknavy/55">
				{formatApprovalRoutingCondition(routingRule)}
			</p>
			{routingRule.amountValue.trim() ? (
				<p className="mt-0.5 text-base font-bold text-skyblue">
					{formatPaymentAmount(routingRule)}
				</p>
			) : null}
		</div>
	);
}

function ApprovalPathSummary({
	stages,
}: {
	stages: ApprovalStageFormValues[];
}) {
	if (stages.length === 0) {
		return (
			<p className="mt-2 text-xs font-medium text-darknavy/45">
				No approval levels selected
			</p>
		);
	}

	return (
		<div className="mt-2 flex flex-wrap items-center gap-2">
			{stages.map((stage, index) => (
				<div key={stage.id} className="flex items-center gap-2">
					<span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-offwhite text-darknavy/60">
						<UsersRound
							className="h-3.5 w-3.5"
							aria-hidden="true"
						/>
					</span>
					<span className="text-sm font-medium text-darknavy">
						{stage.name}
					</span>
					{index < stages.length - 1 ? (
						<span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white text-darknavy/45">
							<ArrowRight
								className="h-4 w-4"
								aria-hidden="true"
							/>
						</span>
					) : null}
				</div>
			))}
		</div>
	);
}

function formatPaymentAmount(routingRule: ApprovalRoutingRuleFormValues) {
	const formatAmount = (value: string) => {
		const amount = Number(value.replaceAll(",", "").trim());

		if (!Number.isFinite(amount)) {
			return value || "0.00";
		}

		return new Intl.NumberFormat("en-PH", {
			maximumFractionDigits: 2,
			minimumFractionDigits: 2,
		}).format(amount);
	};

	return `PHP ${formatAmount(routingRule.amountValue)}`;
}

function RoutingConditionFields({
	errors,
	onRoutingRuleFieldChange,
	routingRule,
}: {
	errors: ApprovalRoutingRuleFormErrors;
	onRoutingRuleFieldChange: <
		TKey extends keyof ApprovalRoutingRuleFormValues,
	>(
		routingRuleId: string,
		field: TKey,
		value: ApprovalRoutingRuleFormValues[TKey],
	) => void;
	routingRule: ApprovalRoutingRuleFormValues;
}) {
	if (routingRule.basis !== "amount") {
		return null;
	}

	return (
		<>
			<ApprovalManagementField
				label="Amount Rule"
				error={errors.amountOperator}
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
					className={approvalManagementFieldClassName}
				>
					{ApprovalAmountConditionOperatorOptions.map((option) => (
						<option key={option.value} value={option.value}>
							{option.label}
						</option>
					))}
				</select>
			</ApprovalManagementField>
			<ApprovalManagementField label="Amount" error={errors.amountValue}>
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
					className={approvalManagementFieldClassName}
					placeholder="100000.00"
				/>
			</ApprovalManagementField>
		</>
	);
}

function ApprovalManagementField({
	children,
	error,
	label,
}: {
	children: ReactNode;
	error?: string;
	label: string;
}) {
	return (
		<label className="block">
			<span className="mb-2 block text-sm font-semibold text-darknavy">
				{label}
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

function ApprovalSetupLevelViewer({
	moduleName,
	onApproverTypeChange,
	selectedApproverType,
	stageCount,
}: {
	moduleName: string;
	onApproverTypeChange: (type: ApproverAssignmentType | "") => void;
	selectedApproverType: ApproverAssignmentType | "";
	stageCount: number;
}) {
	const visibleSetupRecords = selectedApproverType
		? getVisibleApproverSetupRecords(
				moduleName,
				selectedApproverType,
				stageCount,
			)
		: [];

	return (
		<section className="overflow-hidden rounded-lg border border-darknavy/10 bg-white shadow-sm shadow-darknavy/5">
			<div className="flex items-center gap-2 border-b border-darknavy/10 px-4 py-3">
				<UsersRound
					className="h-4 w-4 text-darknavy/55"
					aria-hidden="true"
				/>
				<h3 className="text-base font-semibold text-darknavy">
					Approval Levels
				</h3>
			</div>
			<div className="grid gap-4 p-4">
				<ApprovalManagementField label="Select Approver Type">
					<select
						value={selectedApproverType}
						onChange={(event) =>
							onApproverTypeChange(
								event.target.value as
									| ApproverAssignmentType
									| "",
							)
						}
						className={approvalManagementFieldClassName}
					>
						<option value="">Select approver type</option>
						{approvalManagementApproverTypeOptions.map((type) => (
							<option key={type} value={type}>
								{type}
							</option>
						))}
					</select>
				</ApprovalManagementField>
				{selectedApproverType ? (
					visibleSetupRecords.length > 0 ? (
						<div className="grid gap-3">
							{visibleSetupRecords.map((record) => (
								<ApprovalSetupRecordCard
									key={record.id}
									record={record}
								/>
							))}
						</div>
					) : (
						<div className="rounded-md border border-darknavy/10 bg-offwhite/45 px-4 py-3 text-sm font-medium text-darknavy/55">
							No approver setup has been assigned for this type
							and workflow yet.
						</div>
					)
				) : null}
			</div>
		</section>
	);
}

function ApprovalSetupRecordCard({ record }: { record: ApproverSetupRecord }) {
	const approvers = record.userIds
		.map((userId) => getApproverSetupUser(userId))
		.filter((user): user is UserListRecord => Boolean(user));

	return (
		<article className="overflow-hidden rounded-lg border border-darknavy/10 bg-white">
			<div className="grid min-h-20 grid-cols-[2.5rem_3rem_minmax(0,1fr)] items-center gap-3 border-b border-darknavy/10 px-4 py-3">
				<span className="relative inline-flex h-full items-center justify-center">
					<span className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-skyblue/15" />
					<span className="relative inline-flex h-7 w-7 items-center justify-center rounded-full bg-skyblue text-sm font-bold text-white shadow-sm">
						{record.sequence}
					</span>
				</span>
				<span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-offwhite text-darknavy/60">
					<UsersRound className="h-5 w-5" aria-hidden="true" />
				</span>
				<div className="min-w-0">
					<div className="truncate text-sm font-semibold leading-5 text-darknavy">
						{record.levelName}
					</div>
					<div className="mt-0.5 text-xs font-medium text-darknavy/55">
						{record.condition}
						<span className="px-1.5 text-darknavy/25">-</span>
						{record.userIds.length} approver
						{record.userIds.length === 1 ? "" : "s"}
					</div>
				</div>
			</div>
			<div className="grid gap-3 bg-offwhite/35 p-4 md:grid-cols-2">
				<ApprovalReadOnlyField
					label="Level Name"
					value={record.levelName}
				/>
				<ApprovalReadOnlyField
					label="Condition"
					value={record.condition}
				/>
				<ApprovalReadOnlyField label="Type" value={record.assignmentType} />
				<ApprovalReadOnlyField
					label="Module Scope"
					value={record.moduleScope}
				/>
				<div className="md:col-span-2">
					<div className="mb-2 text-sm font-semibold text-darknavy">
						Approvers
					</div>
					<div className="grid gap-2 md:grid-cols-2">
						{approvers.map((approver) => (
							<div
								key={approver.id}
								className="flex min-h-14 items-center gap-3 rounded-md border border-darknavy/10 bg-white px-3 py-2"
							>
								<span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-darknavy text-xs font-bold text-white">
									{getApproverSetupInitials(approver.name)}
								</span>
								<span className="min-w-0">
									<span className="block truncate text-sm font-semibold text-darknavy">
										{approver.name}
									</span>
									<span className="block truncate text-xs font-medium text-darknavy/45">
										{approver.userRole}
									</span>
								</span>
							</div>
						))}
					</div>
				</div>
			</div>
		</article>
	);
}

function ApprovalReadOnlyField({
	label,
	value,
}: {
	label: string;
	value: string;
}) {
	return (
		<label className="block">
			<span className="mb-2 block text-sm font-semibold text-darknavy">
				{label}
			</span>
			<input
				value={value}
				readOnly
				className={`${approvalManagementFieldClassName} bg-offwhite/65`}
			/>
		</label>
	);
}

function getVisibleApproverSetupRecords(
	moduleName: string,
	selectedApproverType: ApproverAssignmentType,
	stageCount: number,
) {
	const normalizedModuleName = normalizeApprovalSetupText(moduleName);

	return ApproverSetupMockData.filter((record) => {
		if (
			record.assignmentType !== selectedApproverType ||
			record.status === "Expired" ||
			record.sequence > stageCount
		) {
			return false;
		}

		const normalizedScope = normalizeApprovalSetupText(record.moduleScope);

		return (
			normalizedScope === normalizedModuleName ||
			normalizedScope.includes(normalizedModuleName) ||
			normalizedModuleName.includes(normalizedScope)
		);
	}).sort((firstRecord, secondRecord) => {
		if (firstRecord.sequence !== secondRecord.sequence) {
			return firstRecord.sequence - secondRecord.sequence;
		}

		return firstRecord.levelName.localeCompare(secondRecord.levelName);
	});
}

function normalizeApprovalSetupText(value: string) {
	return value.trim().toLowerCase().replaceAll(/\s+/g, " ");
}

function ApprovalManagementEditorSkeleton() {
	return (
		<div className="grid content-start gap-5 p-4 lg:p-5" aria-busy="true">
			<div className="flex items-start justify-between gap-3">
				<div className="grid gap-2">
					<AppSkeleton className="h-3 w-32 rounded-md" />
					<AppSkeleton className="h-6 w-64 rounded-md" />
				</div>
				<AppSkeleton className="h-10 w-24 rounded-md" />
			</div>
			<AppSkeleton className="h-96 rounded-md" />
		</div>
	);
}
