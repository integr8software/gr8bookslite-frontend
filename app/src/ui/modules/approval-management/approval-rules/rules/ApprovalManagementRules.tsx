"use client";

import { useState } from "react";
import {
  ArrowRight,
  ArrowDown,
  ArrowUp,
  ChevronDown,
  CircleDollarSign,
  ListChecks,
  MoreVertical,
  Plus,
  Route,
  Trash2,
  UsersRound,
} from "lucide-react";
import {
  ApprovalAmountConditionLimit,
  ApprovalAmountConditionModeOptions,
  ApprovalAmountConditionOperatorOptions,
} from "@/app/src/constants/modules/approval-management/ApprovalManagementConstants";
import { formatApprovalRoutingCondition } from "@/app/src/services/modules/approval-management/ApprovalManagementFormatters";
import type {
  ApprovalManagementFormErrors,
  ApprovalRoutingRuleFormErrors,
  ApprovalRoutingRuleFormValues,
  ApprovalStageFormValues,
} from "@/app/src/types/modules/approval-management/ApprovalManagementTypes";
import {
  ApprovalManagementField,
  approvalManagementFieldClassName,
} from "@/app/src/ui/modules/approval-management/approval-rules/workflow-details/ApprovalManagementEditorFields";

type ApprovalManagementRulesProps = {
  approverNameById: Map<string, string>;
  errors: ApprovalManagementFormErrors;
  hasAmountCondition: boolean;
  routingRules: ApprovalRoutingRuleFormValues[];
  stages: ApprovalStageFormValues[];
  onAddAmountConditionRule: () => void;
  onAmountConditionModeChange: (hasAmountCondition: boolean) => void;
  onRemoveAmountConditionRule: (routingRuleId: string) => void;
  onRoutingRuleStageMove: (routingRuleId: string, stageId: string, direction: "down" | "up") => void;
  onRoutingRuleFieldChange: <TKey extends keyof ApprovalRoutingRuleFormValues>(
    routingRuleId: string,
    field: TKey,
    value: ApprovalRoutingRuleFormValues[TKey],
  ) => void;
};

export function ApprovalManagementRules({
  approverNameById,
  errors,
  hasAmountCondition,
  onAddAmountConditionRule,
  onAmountConditionModeChange,
  onRemoveAmountConditionRule,
  onRoutingRuleFieldChange,
  onRoutingRuleStageMove,
  routingRules,
  stages,
}: ApprovalManagementRulesProps) {
  const amountRuleCount = routingRules.filter((rule) => rule.basis === "amount").length;
  const canAddAmountCondition = amountRuleCount < ApprovalAmountConditionLimit;
  const [openRoutingRuleId, setOpenRoutingRuleId] = useState<string | null>(null);
  const visibleRoutingRules = hasAmountCondition ? routingRules.filter((rule) => rule.basis === "amount") : routingRules;
  const usesRouteAccordion = visibleRoutingRules.length > 1;

  return (
    <section className="overflow-hidden rounded-lg border border-darknavy/10 bg-white shadow-sm shadow-darknavy/5">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-darknavy/10 px-4 py-3">
        <div className="flex items-center gap-2">
          <Route className="h-4 w-4 text-darknavy/55" aria-hidden="true" />
          <h3 className="text-base font-semibold text-darknavy">Approval Rules</h3>
        </div>
        <span className="rounded-full bg-skyblue/12 px-3 py-1 text-xs font-semibold text-darknavy">
          {hasAmountCondition ? `${amountRuleCount} condition${amountRuleCount === 1 ? "" : "s"}` : "Standard path"}
        </span>
      </div>
      <div className="grid gap-4 p-4">
        <div>
          <div className="mb-2 text-sm font-semibold text-darknavy/70">Rule type</div>
          <div className="grid gap-2 md:grid-cols-2">
            {ApprovalAmountConditionModeOptions.map((option) => {
              const isAmountOption = option.value === "amount";
              const isActive = isAmountOption ? hasAmountCondition : !hasAmountCondition;
              const Icon = isAmountOption ? CircleDollarSign : ListChecks;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => onAmountConditionModeChange(isAmountOption)}
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
                  <span className={isActive ? "h-8 w-px shrink-0 bg-skyblue/25" : "h-8 w-px shrink-0 bg-darknavy/10"} aria-hidden="true" />
                  <span
                    className={
                      isActive
                        ? "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-skyblue/20 bg-white text-skyblue"
                        : "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-offwhite text-darknavy/60"
                    }
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-darknavy">{option.label}</span>
                    <span className="mt-1 block text-xs font-medium text-darknavy/55">{option.description}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
        {hasAmountCondition ? (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-base font-semibold text-darknavy">Conditions</div>
              <div className="mt-0.5 text-xs font-medium text-darknavy/55">Add up to five conditions.</div>
            </div>
            <button
              type="button"
              onClick={onAddAmountConditionRule}
              disabled={!canAddAmountCondition}
              className="inline-flex min-h-9 items-center justify-center gap-2 rounded-md border border-skyblue/35 bg-white px-3 text-sm font-semibold text-darknavy shadow-sm transition hover:bg-skyblue/10 disabled:cursor-not-allowed disabled:border-darknavy/10 disabled:bg-offwhite disabled:text-darknavy/40 disabled:shadow-none"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              {canAddAmountCondition ? "Add Condition" : "Limit Reached"}
            </button>
          </div>
        ) : null}
        <div className="grid gap-3">
          {visibleRoutingRules.map((routingRule) => {
            const routingRuleErrors = errors.routingRules?.[routingRule.id] ?? {};
            const isOpen = !usesRouteAccordion || openRoutingRuleId === routingRule.id;
            const uniqueStages = Array.from(new Map(stages.map((stage) => [stage.id, stage])).values());
            const stageById = new Map(uniqueStages.map((stage) => [stage.id, stage]));
            const selectedStages = routingRule.stageIds
              .map((stageId) => stageById.get(stageId))
              .filter((stage): stage is ApprovalStageFormValues => Boolean(stage));

            return (
              <ApprovalManagementRuleCard
                key={routingRule.id}
                amountRuleCount={amountRuleCount}
                isOpen={isOpen}
                routingRule={routingRule}
                routingRuleErrors={routingRuleErrors}
                selectedStages={selectedStages}
                stages={uniqueStages}
                approverNameById={approverNameById}
                usesRouteAccordion={usesRouteAccordion}
                onOpenChange={setOpenRoutingRuleId}
                onRemoveAmountConditionRule={onRemoveAmountConditionRule}
                onRoutingRuleFieldChange={onRoutingRuleFieldChange}
                onRoutingRuleStageMove={onRoutingRuleStageMove}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}

type ApprovalManagementRuleCardProps = {
  amountRuleCount: number;
  approverNameById: Map<string, string>;
  isOpen: boolean;
  routingRule: ApprovalRoutingRuleFormValues;
  routingRuleErrors: ApprovalRoutingRuleFormErrors;
  selectedStages: ApprovalStageFormValues[];
  stages: ApprovalStageFormValues[];
  usesRouteAccordion: boolean;
  onOpenChange: (routingRuleId: string | null) => void;
  onRemoveAmountConditionRule: (routingRuleId: string) => void;
  onRoutingRuleStageMove: (routingRuleId: string, stageId: string, direction: "down" | "up") => void;
  onRoutingRuleFieldChange: <TKey extends keyof ApprovalRoutingRuleFormValues>(
    routingRuleId: string,
    field: TKey,
    value: ApprovalRoutingRuleFormValues[TKey],
  ) => void;
};

function ApprovalManagementRuleCard({
  amountRuleCount,
  approverNameById,
  isOpen,
  onOpenChange,
  onRemoveAmountConditionRule,
  onRoutingRuleFieldChange,
  onRoutingRuleStageMove,
  routingRule,
  routingRuleErrors,
  selectedStages,
  stages,
  usesRouteAccordion,
}: ApprovalManagementRuleCardProps) {
  const isDefaultRoute = routingRule.basis === "default";
  const routeTitle = isDefaultRoute ? "Standard Approval Path" : routingRule.name || `Rule ${routingRule.sequence}`;

  return (
    <article
      className={
        !isDefaultRoute
          ? "overflow-hidden rounded-md border border-skyblue/30 bg-skyblue/5 shadow-sm shadow-skyblue/10"
          : "overflow-hidden rounded-md border border-darknavy/10 bg-white shadow-sm shadow-darknavy/5"
      }
    >
      <div
        onClick={() => onOpenChange(isOpen ? null : routingRule.id)}
        className="grid cursor-pointer gap-3 p-3 lg:grid-cols-[minmax(15rem,0.85fr)_minmax(0,1.15fr)_auto]"
      >
        <button type="button" className="flex min-w-0 items-center gap-3 text-left" aria-expanded={isOpen}>
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
            <h4 className="truncate text-sm font-semibold text-darknavy">{routeTitle}</h4>
            <RuleConditionSummary routingRule={routingRule} />
          </div>
        </button>
        <div className="min-w-0 border-darknavy/10 lg:border-l lg:pl-5">
          <div className="text-sm font-semibold text-darknavy/65">Approval path</div>
          <ApprovalPathSummary approverNameById={approverNameById} stages={selectedStages} />
        </div>
        <div className="flex items-center justify-end gap-1">
          {!isDefaultRoute && amountRuleCount > 1 ? (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onRemoveAmountConditionRule(routingRule.id);
              }}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-darknavy/10 bg-white text-darknavy/55 transition hover:border-coralpink/40 hover:bg-coralpink/10 hover:text-coralpink"
              aria-label={`Remove ${routeTitle}`}
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
            </button>
          ) : null}
          {usesRouteAccordion ? (
            <button
              type="button"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-darknavy/55 transition hover:bg-white"
              aria-label={`${isOpen ? "Close" : "Open"} ${routeTitle}`}
            >
              <ChevronDown className={`h-4 w-4 transition ${isOpen ? "rotate-180" : ""}`} aria-hidden="true" />
            </button>
          ) : null}
          <MoreVertical className="h-4 w-4 text-darknavy/45" aria-hidden="true" />
        </div>
      </div>
      {isOpen ? (
        <div className="grid gap-4 border-t border-darknavy/10 bg-white p-4 md:grid-cols-2">
          <ApprovalManagementField label="Route Name" error={routingRuleErrors.name}>
            <input
              value={routingRule.name}
              onChange={(event) => onRoutingRuleFieldChange(routingRule.id, "name", event.target.value)}
              className={approvalManagementFieldClassName}
            />
          </ApprovalManagementField>
          <RoutingConditionFields
            errors={routingRuleErrors}
            routingRule={routingRule}
            onRoutingRuleFieldChange={onRoutingRuleFieldChange}
          />
          <div className="md:col-span-2">
            <div className="mb-2 text-sm font-semibold text-darknavy">Approval Path</div>
            {selectedStages.length ? (
              <div className="mb-3 rounded-md border border-skyblue/20 bg-skyblue/5 px-3 py-3">
                {selectedStages.map((stage, index) => (
                  <div key={stage.id} className="grid grid-cols-[2.5rem_minmax(0,1fr)_auto] gap-3 text-sm font-medium text-darknavy">
                    <div className="relative flex justify-center">
                      {index < selectedStages.length - 1 ? (
                        <span className="absolute bottom-0 top-9 w-px bg-skyblue/35" aria-hidden="true" />
                      ) : null}
                      <span className="relative z-10 inline-flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-skyblue text-xs font-bold text-white shadow-sm shadow-skyblue/25">
                        {index + 1}
                      </span>
                    </div>
                    <div className="min-w-0 pb-4">
                      <div className="rounded-md border border-skyblue/25 bg-white px-3 py-2 shadow-sm shadow-darknavy/5">
                        <div className="text-[11px] font-bold uppercase tracking-wide text-skyblue">
                          {formatApproverPosition(index)}
                        </div>
                        <div className="mt-0.5 truncate text-sm font-semibold text-darknavy">
                          {formatStageApproverNames(stage, approverNameById)}
                        </div>
                      </div>
                    </div>
                    <span className="flex items-start gap-1 pb-4">
                      <button
                        type="button"
                        onClick={() => onRoutingRuleStageMove(routingRule.id, stage.id, "up")}
                        disabled={index === 0}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-darknavy/10 bg-white text-darknavy/55 transition hover:border-skyblue/30 hover:text-skyblue disabled:cursor-not-allowed disabled:bg-offwhite disabled:text-darknavy/25"
                        aria-label={`Move ${formatStageApproverNames(stage, approverNameById)} earlier`}
                      >
                        <ArrowUp className="h-4 w-4" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onRoutingRuleStageMove(routingRule.id, stage.id, "down")}
                        disabled={index === selectedStages.length - 1}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-darknavy/10 bg-white text-darknavy/55 transition hover:border-skyblue/30 hover:text-skyblue disabled:cursor-not-allowed disabled:bg-offwhite disabled:text-darknavy/25"
                        aria-label={`Move ${formatStageApproverNames(stage, approverNameById)} later`}
                      >
                        <ArrowDown className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mb-3 rounded-md border border-dashed border-darknavy/15 bg-offwhite/45 px-3 py-4 text-sm font-medium text-darknavy/55">
                No approver setup is assigned for this workflow yet.
              </div>
            )}
            {routingRuleErrors.stageIds ? (
              <span className="mt-1 block text-xs font-medium text-coralpink">{routingRuleErrors.stageIds}</span>
            ) : null}
          </div>
        </div>
      ) : null}
    </article>
  );
}

function RuleConditionSummary({ routingRule }: { routingRule: ApprovalRoutingRuleFormValues }) {
  if (routingRule.basis === "default") {
    return <p className="mt-1 text-xs font-medium text-darknavy/55">For all other amounts</p>;
  }

  return (
    <div className="mt-1">
      <p className="text-xs font-medium text-darknavy/55">{formatApprovalRoutingCondition(routingRule)}</p>
      {routingRule.amountValue.trim() ? (
        <p className="mt-0.5 text-base font-bold text-skyblue">{formatPaymentAmount(routingRule)}</p>
      ) : null}
    </div>
  );
}

function ApprovalPathSummary({ approverNameById, stages }: { approverNameById: Map<string, string>; stages: ApprovalStageFormValues[] }) {
  if (stages.length === 0) {
    return <p className="mt-2 text-xs font-medium text-darknavy/45">No approval levels selected</p>;
  }

  return (
    <div className="mt-2 flex flex-wrap items-center gap-2">
      {stages.map((stage, index) => (
        <div key={stage.id} className="flex items-center gap-2">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-offwhite text-darknavy/60">
            <UsersRound className="h-3.5 w-3.5" aria-hidden="true" />
          </span>
          <span className="text-sm font-medium text-darknavy">{formatStageApproverNames(stage, approverNameById)}</span>
          {index < stages.length - 1 ? (
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white text-darknavy/45">
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </span>
          ) : null}
        </div>
      ))}
    </div>
  );
}

function formatStageApproverNames(stage: ApprovalStageFormValues, approverNameById: Map<string, string>) {
  const names = stage.approverIds.map((approverId) => approverNameById.get(approverId) ?? approverId).filter(Boolean);

  return names.length ? names.join(", ") : stage.name;
}

function formatApproverPosition(index: number) {
  const positions = ["First", "Second", "Third", "Fourth", "Fifth"];
  return `${positions[index] ?? `Step ${index + 1}`} approver`;
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
  onRoutingRuleFieldChange: <TKey extends keyof ApprovalRoutingRuleFormValues>(
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
      <ApprovalManagementField label="Amount Rule" error={errors.amountOperator}>
        <select
          value={routingRule.amountOperator}
          onChange={(event) =>
            onRoutingRuleFieldChange(
              routingRule.id,
              "amountOperator",
              event.target.value as ApprovalRoutingRuleFormValues["amountOperator"],
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
          onChange={(event) => onRoutingRuleFieldChange(routingRule.id, "amountValue", event.target.value)}
          className={approvalManagementFieldClassName}
          placeholder="100000.00"
        />
      </ApprovalManagementField>
    </>
  );
}
