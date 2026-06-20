"use client";

import {
	useState,
	type ChangeEventHandler,
	type FormEventHandler,
} from "react";
import {
	ArrowRight,
	BadgeCheck,
	ChevronDown,
	CircleDollarSign,
	Info,
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
	ApprovalStageRequirementOptions,
} from "@/app/src/constants/modules/system-administration/approval-management/ApprovalManagementConstants";
import { formatApprovalRoutingCondition } from "@/app/src/services/modules/system-administration/approval-management/ApprovalManagementFormatters";
import type {
	ApprovalApproverOption,
	ApprovalManagementFormErrors,
	ApprovalManagementFormValues,
	ApprovalManagementRecord,
	ApprovalRoutingRuleFormErrors,
	ApprovalRoutingRuleFormValues,
	ApprovalStageFormValues,
	ApprovalStageRequirement,
} from "@/app/src/types/modules/system-administration/approval-management/ApprovalManagementTypes";
import {
	ApprovalManagementField,
	approvalManagementFieldClassName,
	approvalManagementPrimaryButtonClassName,
} from "@/app/src/ui/modules/system-administration/approval-management/ApprovalManagementUi";
import { AppSkeleton } from "@/app/src/ui/shared/app/AppSkeleton";

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
	approverOptions,
	errors,
	isLoading,
	isMutating,
	onAddAmountConditionRule,
	onAmountConditionModeChange,
	onInputChange,
	onRemoveAmountConditionRule,
	onRoutingRuleFieldChange,
	onRoutingRuleStageToggle,
	onStageFieldChange,
	onSubmit,
	selectedWorkflow,
	values,
}: ApprovalManagementEditorProps) {
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

			<ApprovalStagePicker
				approverOptions={approverOptions}
				errors={errors}
				stages={values.stages}
				onStageFieldChange={onStageFieldChange}
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
	onAmountConditionModeChange,
	onAddAmountConditionRule,
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
	const usesRouteAccordion = routingRules.length > 1;

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
						? `${amountRuleCount} payment condition${amountRuleCount === 1 ? "" : "s"}`
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
								Payment Conditions
							</div>
							<div className="mt-0.5 text-xs font-medium text-darknavy/55">
								Evaluate higher thresholds first, then use the
								fallback rule.
							</div>
						</div>
						<button
							type="button"
							onClick={onAddAmountConditionRule}
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
					{routingRules.map((routingRule) => {
						const routingRuleErrors =
							errors.routingRules?.[routingRule.id] ?? {};
						const isDefaultRoute = routingRule.basis === "default";
						const isRouteOpen =
							!usesRouteAccordion ||
							openRoutingRuleId === routingRule.id;
						const routeTitle = isDefaultRoute
							? hasAmountCondition
								? "Fallback Rule"
								: "Standard Approval Path"
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
									className={
										"grid gap-3 p-3 lg:grid-cols-[minmax(15rem,0.85fr)_minmax(0,1.15fr)_auto]"
									}
								>
									<button
										type="button"
										onClick={() =>
											setOpenRoutingRuleId(
												isRouteOpen
													? null
													: routingRule.id,
											)
										}
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
												onClick={() =>
													onRemoveAmountConditionRule(
														routingRule.id,
													)
												}
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
												onClick={() =>
													setOpenRoutingRuleId(
														isRouteOpen
															? null
															: routingRule.id,
													)
												}
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
				{hasAmountCondition ? (
					<div className="flex items-center gap-2 rounded-md border border-skyblue/20 bg-skyblue/8 px-3 py-2 text-xs font-semibold text-skyblue">
						<Info className="h-4 w-4 shrink-0" aria-hidden="true" />
						Rules are evaluated from top to bottom. The first
						matching rule will be applied.
					</div>
				) : null}
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
			<p className="mt-0.5 text-base font-bold text-skyblue">
				{formatPaymentAmount(routingRule)}
			</p>
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

	if (routingRule.amountOperator === "between") {
		return `PHP ${formatAmount(routingRule.amountValue)} - PHP ${formatAmount(
			routingRule.amountValueTo,
		)}`;
	}

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
			{routingRule.amountOperator === "between" ? (
				<ApprovalManagementField
					label="Ending Amount"
					error={errors.amountValueTo}
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
						className={approvalManagementFieldClassName}
						placeholder="250000.00"
					/>
				</ApprovalManagementField>
			) : null}
		</>
	);
}

function ApprovalStagePicker({
	approverOptions,
	errors,
	onStageFieldChange,
	stages,
}: {
	approverOptions: ApprovalApproverOption[];
	errors: ApprovalManagementFormErrors;
	stages: ApprovalStageFormValues[];
	onStageFieldChange: <TKey extends keyof ApprovalStageFormValues>(
		stageId: string,
		field: TKey,
		value: ApprovalStageFormValues[TKey],
	) => void;
}) {
	const [openStageId, setOpenStageId] = useState<string | null>(null);
	const effectiveOpenStageId =
		stages.find((stage) => stage.id === openStageId)?.id ?? null;

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
			<div className="p-4">
				<div className="overflow-hidden rounded-lg border border-darknavy/10">
					{stages.map((stage) => {
						const stageErrors = errors.stages?.[stage.id] ?? {};
						const isOpen = stage.id === effectiveOpenStageId;

						return (
							<div
								key={stage.id}
								className="relative border-b border-darknavy/10 last:border-b-0"
							>
								<button
									type="button"
									onClick={() =>
										setOpenStageId(isOpen ? null : stage.id)
									}
									className="grid min-h-20 w-full grid-cols-[2.5rem_3rem_minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 text-left transition hover:bg-offwhite/55"
									aria-expanded={isOpen}
								>
									<span className="relative inline-flex h-full items-center justify-center">
										<span className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-skyblue/15" />
										<span className="relative inline-flex h-7 w-7 items-center justify-center rounded-full bg-skyblue text-sm font-bold text-white shadow-sm">
											{stage.sequence}
										</span>
									</span>
									<span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-offwhite text-darknavy/60">
										<UsersRound
											className="h-5 w-5"
											aria-hidden="true"
										/>
									</span>
									<div className="min-w-0">
										<div className="truncate text-sm font-semibold leading-5 text-darknavy">
											{stage.name}
										</div>
										<div className="mt-0.5 text-xs font-medium text-darknavy/55">
											{stage.requirement === "all"
												? "All approvers"
												: "Any one approver"}{" "}
											<span className="px-1.5 text-darknavy/25">
												-
											</span>
											{stage.approverIds.length} approver
											{stage.approverIds.length === 1
												? ""
												: "s"}
										</div>
									</div>
									<ChevronDown
										className={`h-4 w-4 shrink-0 text-darknavy/55 transition ${isOpen ? "rotate-180" : ""}`}
										aria-hidden="true"
									/>
								</button>
								{isOpen ? (
									<div className="grid gap-3 border-t border-darknavy/10 bg-offwhite/35 p-4 md:grid-cols-2">
										<ApprovalManagementField
											label="Level Name"
											error={stageErrors.name}
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
												className={
													approvalManagementFieldClassName
												}
											/>
										</ApprovalManagementField>
										<ApprovalManagementField
											label="Condition"
											error={stageErrors.requirement}
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
												className={
													approvalManagementFieldClassName
												}
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
										</ApprovalManagementField>
										<div className="md:col-span-2">
											<div className="mb-2 text-sm font-semibold text-darknavy">
												Approvers
											</div>
											<div className="grid max-h-36 gap-2 overflow-auto md:grid-cols-2">
												{approverOptions.map(
													(approver) => {
														const checked =
															stage.approverIds.includes(
																approver.id,
															);

														return (
															<label
																key={
																	approver.id
																}
																className="flex min-h-12 items-center gap-3 rounded-md border border-darknavy/10 bg-white px-3 text-sm font-semibold text-darknavy"
															>
																<input
																	type="checkbox"
																	checked={
																		checked
																	}
																	onChange={() =>
																		onStageFieldChange(
																			stage.id,
																			"approverIds",
																			checked
																				? stage.approverIds.filter(
																						(
																							approverId,
																						) =>
																							approverId !==
																							approver.id,
																					)
																				: [
																						...stage.approverIds,
																						approver.id,
																					],
																		)
																	}
																	className="h-4 w-4 accent-skyblue"
																/>
																<span className="min-w-0">
																	<span className="block truncate">
																		{
																			approver.name
																		}
																	</span>
																	<span className="block text-xs text-darknavy/45">
																		{
																			approver.role
																		}
																	</span>
																</span>
															</label>
														);
													},
												)}
											</div>
											{stageErrors.approverIds ? (
												<span className="mt-1 block text-xs font-medium text-coralpink">
													{stageErrors.approverIds}
												</span>
											) : null}
										</div>
									</div>
								) : null}
							</div>
						);
					})}
				</div>
			</div>
		</section>
	);
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
