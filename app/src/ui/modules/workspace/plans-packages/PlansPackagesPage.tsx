"use client";

import { useMemo, useState } from "react";
import {
  Calculator,
  Check,
  CreditCard,
  Edit3,
  Eye,
  Package,
  Save,
  Search,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import {
  PlanPackageModuleSearchPlaceholder,
  PlanPackageStatusOptions,
} from "@/app/src/constants/modules/workspace/plans-packages/PlanPackageConstants";
import {
  PlanPackageModuleGroups,
  formatPlanPackageCurrency,
} from "@/app/src/data/modules/workspace/plans-packages/PlanPackageData";
import { usePlansPackagesPage } from "@/app/src/hooks/modules/workspace/plans-packages/usePlansPackagesPage";
import type {
  PlanPackageAddOnCode,
  PlanPackageAddOnPricingRecord,
  PlanPackageBillingPreviewResult,
  PlanPackageBillingPreviewValues,
  PlanPackagePlanFormErrors,
  PlanPackagePlanFormValues,
  PlanPackagePlanRecord,
  PlanPackagePricingFormErrors,
  PlanPackageStatus,
} from "@/app/src/types/modules/workspace/plans-packages/PlanPackageTypes";
import {
  ModuleHeader,
  moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";

export function PlansPackagesPage() {
  const page = usePlansPackagesPage();

  if (!page.selectedPlan || !page.billingPreview) {
    return null;
  }

  return (
    <section className="grid gap-5">
      <ModuleHeader
        variant="panel"
        eyebrow="Subscription & Billing"
        title="Plans & Packages"
        description="Manage package availability, module access, included seats, and add-on pricing."
        actions={
          <button
            type="button"
            onClick={page.savePlan}
            className={moduleHeaderActionClassNames.primary}
          >
            <Save className="h-4 w-4" aria-hidden="true" />
            Save Plan
          </button>
        }
      />

      <PlanPackageSummaryCards summary={page.summary} />

      <PlanList
        plans={page.plans}
        selectedPlanId={page.selectedPlan.id}
        onSelectPlan={page.selectPlan}
        onToggleStatus={page.togglePlanStatus}
      />

      <div className="grid gap-5 2xl:grid-cols-[minmax(0,1.35fr)_minmax(24rem,0.65fr)]">
        <PlanEditor
          errors={page.planErrors}
          plan={page.selectedPlan}
          values={page.planDraft}
          onSave={page.savePlan}
          onToggleModule={page.togglePlanModule}
          onUpdate={page.updatePlanDraft}
        />

        <BillingPreview
          addOns={page.addOns}
          preview={page.billingPreview}
          selectedPlan={page.selectedPlan}
          values={page.billingPreviewValues}
          onUpdate={page.updateBillingPreview}
        />
      </div>

      <PricingEditor
        addOns={page.addOns}
        errors={page.pricingErrors}
        onSave={page.savePricing}
        onUpdate={page.updateAddOnPricing}
      />
    </section>
  );
}

function PlanPackageSummaryCards({
  summary,
}: {
  summary: {
    activeAddOns: number;
    activePlans: number;
    enabledModules: number;
    inactivePlans: number;
  };
}) {
  const metrics = [
    {
      icon: Package,
      label: "Active Plans",
      value: summary.activePlans,
      tone: "bg-skyblue/12 text-darknavy",
    },
    {
      icon: Check,
      label: "Enabled Modules",
      value: summary.enabledModules,
      tone: "bg-citron/35 text-darknavy",
    },
    {
      icon: CreditCard,
      label: "Active Add-ons",
      value: summary.activeAddOns,
      tone: "bg-offwhite text-darknavy",
    },
    {
      icon: ToggleLeft,
      label: "Inactive Plans",
      value: summary.inactivePlans,
      tone: "bg-coralpink/12 text-coralpink",
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
              <p className="text-sm font-medium text-darknavy/58">
                {metric.label}
              </p>
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-lg ${metric.tone}`}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
              </span>
            </div>
            <p className="mt-3 text-2xl font-semibold text-darknavy">
              {metric.value}
            </p>
          </article>
        );
      })}
    </div>
  );
}

function PlanList({
  plans,
  selectedPlanId,
  onSelectPlan,
  onToggleStatus,
}: {
  plans: PlanPackagePlanRecord[];
  selectedPlanId: string;
  onSelectPlan: (planId: string) => void;
  onToggleStatus: (planId: string) => void;
}) {
  return (
    <article className="overflow-hidden rounded-lg border border-darknavy/10 bg-white shadow-sm">
      <div className="flex flex-col gap-2 border-b border-darknavy/10 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-skyblue">
            Plan List
          </p>
          <h2 className="mt-2 text-xl font-semibold text-darknavy">
            Package Records
          </h2>
        </div>
        <span className="rounded-md bg-offwhite px-3 py-1.5 text-xs font-semibold text-darknavy/58 ring-1 ring-darknavy/10">
          {plans.length} plans
        </span>
      </div>
      <div className="divide-y divide-darknavy/8">
        {plans.map((plan) => {
          const isSelected = plan.id === selectedPlanId;
          const isActive = plan.status === "Active";

          return (
            <div
              key={plan.id}
              className={`grid gap-4 p-4 transition md:grid-cols-[minmax(0,1.2fr)_8rem_8rem_8rem_auto] md:items-center ${
                isSelected ? "bg-skyblue/8" : "bg-white"
              }`}
            >
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-darknavy/45">
                  {plan.code.replace(/_/g, " ")}
                </p>
                <h3 className="mt-2 text-base font-semibold text-darknavy">
                  {plan.name}
                </h3>
                <p className="mt-1 line-clamp-2 text-sm text-darknavy/55">
                  {plan.description}
                </p>
              </div>
              <StatusBadge status={plan.status} />
              <p className="text-sm font-semibold text-darknavy">
                {formatPlanPackageCurrency(plan.monthlyPrice)}
              </p>
              <p className="text-sm text-darknavy/60">
                {plan.includedUsers} user, {plan.enabledModuleKeys.length} modules
              </p>
              <div className="flex flex-wrap justify-start gap-2 md:justify-end">
                <button
                  type="button"
                  onClick={() => onSelectPlan(plan.id)}
                  className={planActionClassName}
                >
                  <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                  View
                </button>
                <button
                  type="button"
                  onClick={() => onSelectPlan(plan.id)}
                  className={planActionClassName}
                >
                  <Edit3 className="h-3.5 w-3.5" aria-hidden="true" />
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => onToggleStatus(plan.id)}
                  className={planActionClassName}
                >
                  {isActive ? (
                    <ToggleRight className="h-3.5 w-3.5" aria-hidden="true" />
                  ) : (
                    <ToggleLeft className="h-3.5 w-3.5" aria-hidden="true" />
                  )}
                  {isActive ? "Inactivate" : "Activate"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </article>
  );
}

function PlanEditor({
  errors,
  plan,
  values,
  onSave,
  onToggleModule,
  onUpdate,
}: {
  errors: PlanPackagePlanFormErrors;
  plan: PlanPackagePlanRecord;
  values: PlanPackagePlanFormValues;
  onSave: () => void;
  onToggleModule: (moduleKey: string) => void;
  onUpdate: (values: Partial<PlanPackagePlanFormValues>) => void;
}) {
  return (
    <article className="rounded-lg border border-darknavy/10 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-darknavy/10 p-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-skyblue">
            Plan Configuration
          </p>
          <h3 className="mt-2 text-xl font-semibold text-darknavy">
            {plan.name}
          </h3>
        </div>
        <button
          type="button"
          onClick={onSave}
          className={moduleHeaderActionClassNames.secondary}
        >
          <Save className="h-4 w-4" aria-hidden="true" />
          Save Changes
        </button>
      </div>

      <div className="grid gap-5 p-5 xl:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <div className="grid content-start gap-4">
          <label className="grid gap-2">
            <span className="text-sm font-medium text-darknavy/72">
              Description
            </span>
            <textarea
              value={values.description}
              onChange={(event) =>
                onUpdate({ description: event.target.value })
              }
              rows={4}
              className={fieldClassName}
            />
            <FieldError message={errors.description} />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <NumericField
              error={errors.monthlyPrice}
              label="Monthly price"
              value={values.monthlyPrice}
              onChange={(monthlyPrice) => onUpdate({ monthlyPrice })}
            />
            <NumericField
              error={errors.yearlyPrice}
              label="Yearly price"
              value={values.yearlyPrice}
              onChange={(yearlyPrice) => onUpdate({ yearlyPrice })}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <NumericField
              error={errors.includedUsers}
              label="Included users"
              min={1}
              value={values.includedUsers}
              onChange={(includedUsers) => onUpdate({ includedUsers })}
            />
            <label className="grid gap-2">
              <span className="text-sm font-medium text-darknavy/72">
                Status
              </span>
              <select
                value={values.status}
                onChange={(event) =>
                  onUpdate({ status: event.target.value as PlanPackageStatus })
                }
                className={inputClassName}
              >
                {PlanPackageStatusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <ModuleMatrix
          enabledModuleKeys={values.enabledModuleKeys}
          error={errors.enabledModuleKeys}
          onToggleModule={onToggleModule}
        />
      </div>
    </article>
  );
}

function ModuleMatrix({
  enabledModuleKeys,
  error,
  onToggleModule,
}: {
  enabledModuleKeys: string[];
  error?: string;
  onToggleModule: (moduleKey: string) => void;
}) {
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLowerCase();
  const filteredGroups = useMemo(
    () =>
      PlanPackageModuleGroups.map((group) => ({
        ...group,
        options: group.options.filter((option) =>
          [option.label, option.groupLabel, option.sectionTitle]
            .join(" ")
            .toLowerCase()
            .includes(normalizedQuery),
        ),
      })).filter((group) => group.options.length > 0),
    [normalizedQuery],
  );

  return (
    <div className="grid content-start gap-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-darknavy">Modules</p>
          <p className="mt-1 text-xs text-darknavy/50">
            {enabledModuleKeys.length} selected
          </p>
        </div>
        <label className="relative block sm:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-darknavy/35" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={PlanPackageModuleSearchPlaceholder}
            className="h-10 w-full rounded-lg border border-darknavy/12 bg-offwhite/70 pl-9 pr-3 text-sm text-darknavy outline-none transition focus:border-skyblue/45 focus:bg-white"
          />
        </label>
      </div>

      <div className="max-h-[34rem] overflow-y-auto rounded-lg border border-darknavy/10">
        {filteredGroups.map((group) => (
          <div key={group.key} className="border-b border-darknavy/8 last:border-b-0">
            <div className="sticky top-0 z-10 bg-offwhite px-4 py-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-darknavy/55">
                {group.title}
              </p>
            </div>
            <div className="grid gap-1 p-2">
              {group.options.map((option) => {
                const isEnabled = enabledModuleKeys.includes(option.key);

                return (
                  <label
                    key={option.key}
                    className="flex cursor-pointer items-start gap-3 rounded-lg px-3 py-2 transition hover:bg-skyblue/8"
                  >
                    <input
                      type="checkbox"
                      checked={isEnabled}
                      onChange={() => onToggleModule(option.key)}
                      className="mt-1 h-4 w-4 accent-skyblue"
                    />
                    <span className="min-w-0">
                      <span className="block text-sm font-medium text-darknavy">
                        {option.label}
                      </span>
                      <span className="mt-0.5 block text-xs text-darknavy/45">
                        {option.groupLabel}
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <FieldError message={error} />
    </div>
  );
}

function PricingEditor({
  addOns,
  errors,
  onSave,
  onUpdate,
}: {
  addOns: PlanPackageAddOnPricingRecord[];
  errors: PlanPackagePricingFormErrors;
  onSave: () => void;
  onUpdate: (
    addOnCode: PlanPackageAddOnCode,
    values: Partial<PlanPackageAddOnPricingRecord>,
  ) => void;
}) {
  return (
    <article className="rounded-lg border border-darknavy/10 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-darknavy/10 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-skyblue">
            Pricing
          </p>
          <h3 className="mt-2 text-xl font-semibold text-darknavy">
            Add-on Pricing
          </h3>
        </div>
        <button
          type="button"
          onClick={onSave}
          className={moduleHeaderActionClassNames.secondary}
        >
          <Save className="h-4 w-4" aria-hidden="true" />
          Save Pricing
        </button>
      </div>

      <div className="grid gap-3 p-5 xl:grid-cols-4">
        {addOns.map((addOn) => (
          <div
            key={addOn.code}
            className="rounded-lg border border-darknavy/10 bg-offwhite/45 p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h4 className="font-semibold text-darknavy">{addOn.name}</h4>
                <p className="mt-1 text-xs leading-5 text-darknavy/52">
                  {addOn.unitLabel}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onUpdate(addOn.code, { isActive: !addOn.isActive })}
                className={`inline-flex h-8 w-8 items-center justify-center rounded-lg transition ${
                  addOn.isActive
                    ? "bg-citron/35 text-darknavy"
                    : "bg-darknavy/8 text-darknavy/45"
                }`}
                aria-label={addOn.isActive ? "Disable add-on" : "Enable add-on"}
              >
                {addOn.isActive ? (
                  <ToggleRight className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <ToggleLeft className="h-4 w-4" aria-hidden="true" />
                )}
              </button>
            </div>
            <p className="mt-3 min-h-10 text-xs leading-5 text-darknavy/55">
              {addOn.description}
            </p>
            <div className="mt-4 grid gap-3">
              <NumericField
                label="Monthly"
                value={addOn.monthlyPrice}
                onChange={(monthlyPrice) =>
                  onUpdate(addOn.code, { monthlyPrice })
                }
              />
              <NumericField
                label="Yearly"
                value={addOn.yearlyPrice}
                onChange={(yearlyPrice) =>
                  onUpdate(addOn.code, { yearlyPrice })
                }
              />
              <FieldError message={errors[addOn.code]} />
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}

function BillingPreview({
  addOns,
  preview,
  selectedPlan,
  values,
  onUpdate,
}: {
  addOns: PlanPackageAddOnPricingRecord[];
  preview: PlanPackageBillingPreviewResult;
  selectedPlan: PlanPackagePlanRecord;
  values: PlanPackageBillingPreviewValues;
  onUpdate: (values: Partial<PlanPackageBillingPreviewValues>) => void;
}) {
  return (
    <article className="rounded-lg border border-darknavy/10 bg-darknavy p-5 text-offwhite shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-citron">
            Billing Preview
          </p>
          <h3 className="mt-2 text-xl font-semibold">{selectedPlan.name}</h3>
        </div>
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 text-citron">
          <Calculator className="h-5 w-5" aria-hidden="true" />
        </span>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <PreviewNumberField
          label="Companies"
          value={values.companies}
          onChange={(companies) => onUpdate({ companies })}
        />
        <PreviewNumberField
          label="Users"
          value={values.users}
          onChange={(users) => onUpdate({ users })}
        />
        <PreviewNumberField
          label="Branches"
          value={values.branches}
          onChange={(branches) => onUpdate({ branches })}
        />
        <PreviewNumberField
          label="Satellites"
          value={values.satellites}
          onChange={(satellites) => onUpdate({ satellites })}
        />
      </div>

      <div className="mt-5 space-y-3 rounded-lg border border-white/10 bg-white/6 p-4">
        <PreviewLine label="Base plan" value={preview.basePrice} />
        {preview.lineItems.map((lineItem) => (
          <PreviewLine
            key={lineItem.label}
            label={`${lineItem.label} x ${lineItem.quantity}`}
            value={lineItem.total}
          />
        ))}
        <div className="border-t border-white/10 pt-3">
          <PreviewLine label="Monthly total" value={preview.total} strong />
        </div>
      </div>

      <div className="mt-5 grid gap-2">
        {addOns.map((addOn) => (
          <div
            key={addOn.code}
            className="flex items-center justify-between gap-3 text-xs text-offwhite/62"
          >
            <span>{addOn.name}</span>
            <span>{formatPlanPackageCurrency(addOn.monthlyPrice)}</span>
          </div>
        ))}
      </div>
    </article>
  );
}

function NumericField({
  error,
  label,
  min = 0,
  value,
  onChange,
}: {
  error?: string;
  label: string;
  min?: number;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-medium text-darknavy/72">{label}</span>
      <input
        type="number"
        min={min}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className={inputClassName}
      />
      <FieldError message={error} />
    </label>
  );
}

function PreviewNumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-medium text-offwhite/72">{label}</span>
      <input
        type="number"
        min={0}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-11 rounded-lg border border-white/12 bg-white/8 px-3 text-sm text-offwhite outline-none transition focus:border-skyblue/45"
      />
    </label>
  );
}

function PreviewLine({
  label,
  strong = false,
  value,
}: {
  label: string;
  strong?: boolean;
  value: number;
}) {
  return (
    <div
      className={`flex items-center justify-between gap-3 ${
        strong ? "text-base font-semibold" : "text-sm text-offwhite/72"
      }`}
    >
      <span>{label}</span>
      <span>{formatPlanPackageCurrency(value)}</span>
    </div>
  );
}

function StatusBadge({ status }: { status: PlanPackageStatus }) {
  return (
    <span
      className={`inline-flex w-fit items-center rounded-full px-2.5 py-1 text-xs font-semibold ${statusBadgeClassName(
        status,
      )}`}
    >
      {status}
    </span>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <span className="text-xs font-medium text-coralpink">{message}</span>;
}

function statusBadgeClassName(status: PlanPackageStatus) {
  switch (status) {
    case "Active":
      return "bg-citron/35 text-darknavy";
    case "Draft":
      return "bg-skyblue/14 text-darknavy";
    default:
      return "bg-darknavy/8 text-darknavy/55";
  }
}

const inputClassName =
  "h-11 rounded-lg border border-darknavy/12 bg-white px-3 text-sm text-darknavy outline-none transition focus:border-skyblue/45 focus:ring-2 focus:ring-skyblue/15";

const fieldClassName =
  "min-h-28 rounded-lg border border-darknavy/12 bg-white px-3 py-3 text-sm leading-6 text-darknavy outline-none transition focus:border-skyblue/45 focus:ring-2 focus:ring-skyblue/15";

const planActionClassName =
  "inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-darknavy/10 bg-white px-3 text-xs font-semibold text-darknavy/70 transition hover:bg-skyblue/10 hover:text-darknavy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/25";
