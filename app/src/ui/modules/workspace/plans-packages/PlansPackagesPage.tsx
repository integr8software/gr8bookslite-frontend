"use client";

import { useMemo, useState } from "react";
import {
  Calculator,
  Check,
  CreditCard,
  Edit3,
  Package,
  Percent,
  Plus,
  RotateCcw,
  Save,
  Search,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import {
  PlanPackageDiscountKindOptions,
  PlanPackageDiscountTargetOptions,
  PlanPackageDiscountTypeOptions,
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
  PlanPackageDiscountFormErrors,
  PlanPackageDiscountFormValues,
  PlanPackageDiscountRecord,
  PlanPackageDiscountTarget,
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
        eyebrow="Super Admin Billing"
        title="Plans & Packages"
        description="Accounting, Inventory, package pricing, add-ons, and discounts."
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

      <PlanCards
        plans={page.plans}
        selectedPlanId={page.selectedPlan.id}
        onSelectPlan={page.selectPlan}
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
          discounts={page.discounts}
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

      <DiscountsPanel
        discounts={page.discounts}
        editingDiscountId={page.editingDiscountId}
        errors={page.discountErrors}
        values={page.discountDraft}
        onEdit={page.editDiscount}
        onReset={page.resetDiscountDraft}
        onSave={page.saveDiscount}
        onToggleStatus={page.toggleDiscountStatus}
        onUpdate={page.updateDiscountDraft}
      />
    </section>
  );
}

function PlanPackageSummaryCards({
  summary,
}: {
  summary: {
    activeAddOns: number;
    activeDiscounts: number;
    activePlans: number;
    enabledModules: number;
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
      icon: Percent,
      label: "Active Discounts",
      value: summary.activeDiscounts,
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

function PlanCards({
  plans,
  selectedPlanId,
  onSelectPlan,
}: {
  plans: PlanPackagePlanRecord[];
  selectedPlanId: string;
  onSelectPlan: (planId: string) => void;
}) {
  return (
    <div className="grid gap-3 xl:grid-cols-3">
      {plans.map((plan) => {
        const isSelected = plan.id === selectedPlanId;

        return (
          <button
            key={plan.id}
            type="button"
            onClick={() => onSelectPlan(plan.id)}
            className={`rounded-lg border bg-white p-5 text-left shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/35 ${
              isSelected
                ? "border-skyblue ring-2 ring-skyblue/18"
                : "border-darknavy/10 hover:border-skyblue/45"
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-darknavy/45">
                  {plan.code.replace(/_/g, " ")}
                </p>
                <h3 className="mt-2 text-lg font-semibold text-darknavy">
                  {plan.name}
                </h3>
              </div>
              <StatusBadge status={plan.status} />
            </div>
            <p className="mt-4 text-2xl font-semibold text-darknavy">
              {formatPlanPackageCurrency(plan.monthlyPrice)}
            </p>
            <p className="mt-1 text-sm text-darknavy/55">
              {plan.includedUsers} user included ·{" "}
              {plan.enabledModuleKeys.length} modules
            </p>
          </button>
        );
      })}
    </div>
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

function DiscountsPanel({
  discounts,
  editingDiscountId,
  errors,
  values,
  onEdit,
  onReset,
  onSave,
  onToggleStatus,
  onUpdate,
}: {
  discounts: PlanPackageDiscountRecord[];
  editingDiscountId: string | null;
  errors: PlanPackageDiscountFormErrors;
  values: PlanPackageDiscountFormValues;
  onEdit: (discount: PlanPackageDiscountRecord) => void;
  onReset: () => void;
  onSave: () => void;
  onToggleStatus: (discountId: string) => void;
  onUpdate: (values: Partial<PlanPackageDiscountFormValues>) => void;
}) {
  return (
    <article className="rounded-lg border border-darknavy/10 bg-white shadow-sm">
      <div className="border-b border-darknavy/10 p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-skyblue">
          Discounts
        </p>
        <h3 className="mt-2 text-xl font-semibold text-darknavy">
          Promo, Coupon, Voucher
        </h3>
      </div>

      <div className="grid gap-5 p-5 2xl:grid-cols-[minmax(25rem,0.85fr)_minmax(0,1.15fr)]">
        <div className="grid content-start gap-4 rounded-lg border border-darknavy/10 bg-offwhite/45 p-4">
          <div className="flex items-center justify-between gap-3">
            <h4 className="font-semibold text-darknavy">
              {editingDiscountId ? "Edit Discount" : "New Discount"}
            </h4>
            <button
              type="button"
              onClick={onReset}
              className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-darknavy/10 bg-white px-3 text-sm font-semibold text-darknavy/68 transition hover:bg-skyblue/10 hover:text-darknavy"
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
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
              onChange={(code) => onUpdate({ code })}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <SelectField
              label="Type"
              value={values.type}
              options={PlanPackageDiscountTypeOptions}
              onChange={(type) => onUpdate({ type })}
            />
            <SelectField
              label="Target"
              value={values.target}
              options={PlanPackageDiscountTargetOptions}
              onChange={(target) =>
                onUpdate({ target: target as PlanPackageDiscountTarget })
              }
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <SelectField
              label="Discount"
              value={values.discountKind}
              options={PlanPackageDiscountKindOptions}
              onChange={(discountKind) => onUpdate({ discountKind })}
            />
            <NumericField
              error={errors.value}
              label="Value"
              value={values.value}
              onChange={(value) => onUpdate({ value })}
            />
            <label className="grid gap-2">
              <span className="text-sm font-medium text-darknavy/72">
                Expires
              </span>
              <input
                type="date"
                value={values.expiresAt}
                onChange={(event) => onUpdate({ expiresAt: event.target.value })}
                className={inputClassName}
              />
              <FieldError message={errors.expiresAt} />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
            <SelectField
              label="Status"
              value={values.status}
              options={PlanPackageStatusOptions}
              onChange={(status) =>
                onUpdate({ status: status as PlanPackageStatus })
              }
            />
            <button
              type="button"
              onClick={onSave}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-darknavy px-4 text-sm font-semibold text-offwhite transition hover:bg-darknavy/92"
            >
              {editingDiscountId ? (
                <Save className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Plus className="h-4 w-4" aria-hidden="true" />
              )}
              {editingDiscountId ? "Update" : "Create"}
            </button>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border border-darknavy/10">
          <div className="grid grid-cols-[1.2fr_0.8fr_0.75fr_0.75fr_auto] gap-3 bg-offwhite px-4 py-3 text-xs font-semibold uppercase tracking-wide text-darknavy/52">
            <span>Discount</span>
            <span>Target</span>
            <span>Value</span>
            <span>Status</span>
            <span className="text-right">Actions</span>
          </div>
          <div className="divide-y divide-darknavy/8">
            {discounts.map((discount) => (
              <div
                key={discount.id}
                className="grid grid-cols-1 gap-3 px-4 py-4 text-sm md:grid-cols-[1.2fr_0.8fr_0.75fr_0.75fr_auto] md:items-center"
              >
                <div>
                  <p className="font-semibold text-darknavy">{discount.name}</p>
                  <p className="mt-1 text-xs text-darknavy/48">
                    {discount.type} · {discount.code}
                  </p>
                </div>
                <p className="text-darknavy/65">{discount.target}</p>
                <p className="font-semibold text-darknavy">
                  {discount.discountKind === "Percent"
                    ? `${discount.value}%`
                    : formatPlanPackageCurrency(discount.value)}
                </p>
                <StatusBadge status={discount.status} />
                <div className="flex flex-wrap justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => onEdit(discount)}
                    className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-darknavy/10 bg-white px-3 text-xs font-semibold text-darknavy/70 transition hover:bg-skyblue/10 hover:text-darknavy"
                  >
                    <Edit3 className="h-3.5 w-3.5" aria-hidden="true" />
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => onToggleStatus(discount.id)}
                    className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-darknavy/10 bg-white px-3 text-xs font-semibold text-darknavy/70 transition hover:bg-citron/25 hover:text-darknavy"
                  >
                    {discount.status === "Active" ? (
                      <ToggleRight className="h-3.5 w-3.5" aria-hidden="true" />
                    ) : (
                      <ToggleLeft className="h-3.5 w-3.5" aria-hidden="true" />
                    )}
                    {discount.status === "Active" ? "Archive" : "Activate"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}

function BillingPreview({
  addOns,
  discounts,
  preview,
  selectedPlan,
  values,
  onUpdate,
}: {
  addOns: PlanPackageAddOnPricingRecord[];
  discounts: PlanPackageDiscountRecord[];
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

      <label className="mt-4 grid gap-2">
        <span className="text-sm font-medium text-offwhite/72">Discount</span>
        <select
          value={values.discountId}
          onChange={(event) => onUpdate({ discountId: event.target.value })}
          className="h-11 rounded-lg border border-white/12 bg-white/8 px-3 text-sm text-offwhite outline-none transition focus:border-skyblue/45"
        >
          <option value="">No discount</option>
          {discounts.map((discount) => (
            <option key={discount.id} value={discount.id}>
              {discount.code}
            </option>
          ))}
        </select>
      </label>

      <div className="mt-5 space-y-3 rounded-lg border border-white/10 bg-white/6 p-4">
        <PreviewLine label="Base plan" value={preview.basePrice} />
        {preview.lineItems.map((lineItem) => (
          <PreviewLine
            key={lineItem.label}
            label={`${lineItem.label} x ${lineItem.quantity}`}
            value={lineItem.total}
          />
        ))}
        <PreviewLine label="Discount" value={-preview.discountAmount} />
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
    <label className="grid gap-2">
      <span className="text-sm font-medium text-darknavy/72">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={inputClassName}
      />
      <FieldError message={error} />
    </label>
  );
}

function SelectField<TValue extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: readonly TValue[];
  value: TValue;
  onChange: (value: TValue) => void;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-medium text-darknavy/72">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as TValue)}
        className={inputClassName}
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
