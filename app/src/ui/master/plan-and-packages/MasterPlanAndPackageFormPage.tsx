"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  ChevronDown,
  GitBranch,
  Plus,
  Save,
  Search,
  Trash2,
  Users,
  type LucideIcon,
} from "lucide-react";
import {
	MasterPlanAndPackagesHref,
	MasterPlanAndPackageScaleUnitLabels,
	MasterPlanAndPackageScopeLabels,
	MasterPlanAndPackageScopeOptions,
	MasterPlanAndPackageStatusOptions,
} from "@/app/src/constants/master/plan-and-packages/MasterPlanAndPackageConstants";
import { useMasterModuleSystemsQuery } from "@/app/src/hooks/master/module-systems/useMasterModuleSystemsQuery";
import { useMasterPlanAndPackageFormPage } from "@/app/src/hooks/master/plan-and-packages/useMasterPlanAndPackageFormPage";
import type {
	MasterPlanAndPackageFormErrors,
	MasterPlanAndPackageFormValues,
	MasterPlanAndPackageReductionTier,
	MasterPlanAndPackageScope,
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
const FieldLabelClassName =
  "grid gap-1.5 text-sm font-semibold text-darknavy/58";
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
              disabled={page.isSaving}
              className={moduleHeaderActionClassNames.primary}
            >
              <Save className="h-4 w-4" aria-hidden="true" />
              {page.isSaving ? "Saving..." : "Save"}
            </button>
          </>
        }
      />
      <MasterPlanAndPackageForm
        errors={page.errors}
        isSaving={page.isSaving}
        values={page.values}
        onSave={page.saveRecord}
        onUpdate={page.updateValues}
      />
    </section>
  );
}

function MasterPlanAndPackageForm({
  errors,
  isSaving,
  values,
  onSave,
  onUpdate,
}: {
  errors: MasterPlanAndPackageFormErrors;
  isSaving: boolean;
  values: MasterPlanAndPackageFormValues;
  onSave: () => void;
  onUpdate: (values: Partial<MasterPlanAndPackageFormValues>) => void;
}) {
  const systemsQuery = useMasterModuleSystemsQuery();
  const systemOptions = useMemo(
    () =>
      (systemsQuery.data?.systems ?? [])
        .filter((system) => system.isActive)
        .map((system) => ({
          description: `${system.moduleCount} modules`,
          id: system.code,
          name: system.name,
          section: "Available systems",
        })),
    [systemsQuery.data],
  );

  return (
    <div className="overflow-hidden rounded-lg border border-darknavy/10 bg-white shadow-sm">
      <div className="grid gap-5 p-5">
        <div className="grid content-start gap-4">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-[minmax(0,1.3fr)_minmax(14rem,1fr)_minmax(8rem,0.55fr)_minmax(10rem,0.55fr)]">
            <TextField
              error={errors.name}
              label="Plan name"
              value={values.name}
              onChange={(name) => onUpdate({ name })}
            />
            <MultiSelectScopeField
              error={errors.scope}
              label="Plan scope"
              selectedScopes={values.scopes ?? (values.scope === "ALL" ? ["ALL"] : [values.scope])}
              onChange={(scopes, primaryScope) =>
                onUpdate({ scopes, scope: primaryScope })
              }
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
              <div>
                <h2 className="text-base font-semibold text-darknavy">
                  Prices
                </h2>
                <p className="mt-1 text-sm font-medium text-darknavy/55">
                  Billing intervals are stored separately from shared usage
                  rules.
                </p>
              </div>
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
              basePrice={{
                error: errors.monthlyBasePrice,
                value: values.monthlyBasePrice,
                onChange: (monthlyBasePrice) => onUpdate({ monthlyBasePrice }),
              }}
              periodLabel="Monthly"
              intervalBadge="/MONTH"
              percentOff={{
                error: errors.monthlyPercentOff,
                value: values.monthlyPercentOff,
                onChange: (monthlyPercentOff) =>
                  onUpdate({ monthlyPercentOff }),
              }}
              accentClassName="border-t-skyblue/55"
            />
            <BillingPeriodColumn
              basePrice={{
                error: errors.yearlyBasePrice,
                value: values.yearlyBasePrice,
                onChange: (yearlyBasePrice) => onUpdate({ yearlyBasePrice }),
              }}
              periodLabel="Yearly"
              intervalBadge="/YEAR"
              percentOff={{
                error: errors.yearlyPercentOff,
                value: values.yearlyPercentOff,
                onChange: (yearlyPercentOff) => onUpdate({ yearlyPercentOff }),
              }}
              accentClassName="border-t-citron"
            />
          </div>
        </section>

        <ModuleFeatureSelector
          error={errors.featureIds}
          featureOptions={systemOptions}
          isLoading={systemsQuery.isLoading}
          selectedFeatureIds={values.featureIds}
          onChange={(featureIds) => onUpdate({ featureIds })}
        />

        <div className="flex justify-end">
          <button
            type="button"
            onClick={onSave}
            disabled={isSaving}
            className={moduleHeaderActionClassNames.primary}
          >
            <Save className="h-4 w-4" aria-hidden="true" />
            {isSaving ? "Saving..." : "Save"}
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
  accentClassName,
  basePrice,
  intervalBadge,
  periodLabel,
  percentOff,
}: {
  accentClassName: string;
  basePrice: NumberFieldConfig;
  intervalBadge: string;
  periodLabel: string;
  percentOff: NumberFieldConfig;
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
          {intervalBadge}
        </span>
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
        <NumberField
          error={basePrice.error}
          label={`Base price ${intervalBadge.toLowerCase()}`}
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
    </div>
  );
}

function ModuleFeatureSelector({
  error,
  featureOptions,
  isLoading,
  selectedFeatureIds,
  onChange,
}: {
  error?: string;
  featureOptions: Array<{
    description: string;
    id: string;
    name: string;
    section: string;
  }>;
  isLoading: boolean;
  selectedFeatureIds: string[];
  onChange: (featureIds: string[]) => void;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const selectedSet = useMemo(
    () => new Set(selectedFeatureIds),
    [selectedFeatureIds],
  );
  const allFeatureIds = useMemo(
    () => featureOptions.map((feature) => feature.id),
    [featureOptions],
  );
  const globalSelectionState = getSelectionState(allFeatureIds, selectedSet);
  const normalizedSearchTerm = searchTerm.trim().toLowerCase();
  const groupedFeatures = useMemo(() => {
    const filteredFeatures = featureOptions.filter(
      (feature) => {
        if (!normalizedSearchTerm) {
          return true;
        }

        return [feature.name, feature.description, feature.section].some(
          (value) => value.toLowerCase().includes(normalizedSearchTerm),
        );
      },
    );

    return filteredFeatures.reduce<
      Array<{
        features: typeof featureOptions;
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
  }, [featureOptions, normalizedSearchTerm]);

  function toggleFeature(featureId: string) {
    if (selectedSet.has(featureId)) {
      onChange(
        selectedFeatureIds.filter((selectedId) => selectedId !== featureId),
      );

      return;
    }

    onChange([...selectedFeatureIds, featureId]);
  }

  function setFeatureSelection(featureIds: string[], isSelected: boolean) {
    const nextSelectedSet = new Set(selectedFeatureIds);

    featureIds.forEach((featureId) => {
      if (isSelected) {
        nextSelectedSet.add(featureId);

        return;
      }

      nextSelectedSet.delete(featureId);
    });

    onChange(
      featureOptions.filter((feature) =>
        nextSelectedSet.has(feature.id),
      ).map((feature) => feature.id),
    );
  }

  return (
    <section className="-mx-5 grid gap-4 px-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-citron/35 text-darknavy">
            <Users className="h-4 w-4" aria-hidden="true" />
          </span>
          <div>
              <h2 className="text-base font-semibold text-darknavy">Systems</h2>
              <p className="mt-1 text-xs font-bold uppercase tracking-wide text-darknavy/42">
                {selectedFeatureIds.length} selected
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <ModuleSelectionCheckbox
            checked={globalSelectionState === "all"}
            isIndeterminate={globalSelectionState === "partial"}
            label="All systems"
            selectedCount={selectedFeatureIds.length}
            totalCount={allFeatureIds.length}
            onChange={() =>
              setFeatureSelection(allFeatureIds, globalSelectionState !== "all")
            }
          />
          <label className="relative block">
            <span className="sr-only">Search systems</span>
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-darknavy/38"
              aria-hidden="true"
            />
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search systems"
              className={joinClasses(ControlClassName, "pl-9")}
            />
          </label>
        </div>
      </div>
      <div className="max-h-120 overflow-y-auto rounded-lg border border-darknavy/10 bg-white shadow-sm">
        {isLoading ? (
          <p className="px-4 py-6 text-sm font-medium text-darknavy/55">
            Loading systems...
          </p>
        ) : groupedFeatures.length > 0 ? (
          groupedFeatures.map((group) => {
            const groupFeatureIds = group.features.map((feature) => feature.id);
            const groupSelectionState = getSelectionState(
              groupFeatureIds,
              selectedSet,
            );

            return (
              <div key={group.section}>
                <div className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-3 border-b border-darknavy/10 bg-offwhite px-4 py-2">
                  <p className="text-xs font-bold uppercase tracking-wide text-darknavy/55">
                    {group.section}
                  </p>
                  <ModuleSelectionCheckbox
                    checked={groupSelectionState === "all"}
                    isIndeterminate={groupSelectionState === "partial"}
                    label="Section"
                    selectedCount={
                      groupFeatureIds.filter((featureId) =>
                        selectedSet.has(featureId),
                      ).length
                    }
                    totalCount={groupFeatureIds.length}
                    onChange={() =>
                      setFeatureSelection(
                        groupFeatureIds,
                        groupSelectionState !== "all",
                      )
                    }
                  />
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
            );
          })
        ) : (
          <p className="px-4 py-6 text-sm font-medium text-darknavy/55">
            No systems match your search.
          </p>
        )}
      </div>
      <FieldError message={error} />
    </section>
  );
}

function ModuleSelectionCheckbox({
  checked,
  isIndeterminate,
  label,
  selectedCount,
  totalCount,
  onChange,
}: {
  checked: boolean;
  isIndeterminate: boolean;
  label: string;
  selectedCount: number;
  totalCount: number;
  onChange: () => void;
}) {
  return (
    <label className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-lg border border-darknavy/10 bg-white px-3 text-xs font-bold text-darknavy/65 shadow-sm transition hover:border-skyblue/45 hover:bg-skyblue/8">
      <span>{label}</span>
      <span className="text-darknavy/38">
        {selectedCount}/{totalCount}
      </span>
      <input
        type="checkbox"
        checked={checked}
        ref={(element) => {
          if (element) {
            element.indeterminate = isIndeterminate;
          }
        }}
        onChange={onChange}
        className="h-4 w-4 rounded border-darknavy/20 text-skyblue focus:ring-skyblue/20"
      />
    </label>
  );
}

function getSelectionState(featureIds: string[], selectedSet: Set<string>) {
  const selectedCount = featureIds.filter((featureId) =>
    selectedSet.has(featureId),
  ).length;

  if (selectedCount === 0) {
    return "none";
  }

  if (selectedCount === featureIds.length) {
    return "all";
  }

  return "partial";
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
  const [draftValue, setDraftValue] = useState(() => String(value));
  const [isFocused, setIsFocused] = useState(false);

  function handleChange(nextValue: string) {
    setDraftValue(nextValue);

    if (nextValue.trim() === "") {
      return;
    }

    onChange(toNumber(nextValue));
  }

  function handleBlur() {
    setIsFocused(false);

    if (draftValue.trim() === "") {
      onChange(0);
      setDraftValue("0");
    }
  }

  return (
    <label className={FieldLabelClassName}>
      {label}
      <input
        type="number"
        min={0}
        value={isFocused ? draftValue : String(value)}
        onBlur={handleBlur}
        onChange={(event) => handleChange(event.target.value)}
        onFocus={() => {
          setIsFocused(true);
          setDraftValue(String(value));
        }}
        className={ControlClassName}
      />
      <FieldError message={error} />
    </label>
  );
}

function SelectField<TOption extends string>({
  getOptionLabel,
  label,
  options,
  value,
  onChange,
}: {
  getOptionLabel?: (option: TOption) => string;
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
            {getOptionLabel ? getOptionLabel(option) : option}
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

  return (
    <span className="text-xs font-semibold text-coralpink">{message}</span>
  );
}

function MultiSelectScopeField({
  error,
  label,
  selectedScopes,
  onChange,
}: {
  error?: string;
  label: string;
  selectedScopes: MasterPlanAndPackageScope[];
  onChange: (scopes: MasterPlanAndPackageScope[], primaryScope: MasterPlanAndPackageScope) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  const isAll =
    selectedScopes.includes("ALL") ||
    (selectedScopes.includes("ONBOARDING") && selectedScopes.includes("ADDITIONAL_COMPANY"));

  function toggleScope(scope: MasterPlanAndPackageScope) {
    if (scope === "ALL") {
      onChange(["ALL"], "ALL");
      return;
    }

    let nextScopes: MasterPlanAndPackageScope[];
    if (isAll) {
      if (scope === "ONBOARDING") {
        nextScopes = ["ADDITIONAL_COMPANY"];
      } else {
        nextScopes = ["ONBOARDING"];
      }
    } else if (selectedScopes.includes(scope)) {
      nextScopes = selectedScopes.filter((s) => s !== scope && s !== "ALL");
      if (nextScopes.length === 0) {
        nextScopes = ["ALL"];
      }
    } else {
      nextScopes = [...selectedScopes.filter((s) => s !== "ALL"), scope];
      if (nextScopes.includes("ONBOARDING") && nextScopes.includes("ADDITIONAL_COMPANY")) {
        nextScopes = ["ALL"];
      }
    }

    const primaryScope: MasterPlanAndPackageScope =
      nextScopes.includes("ALL") ||
      (nextScopes.includes("ONBOARDING") && nextScopes.includes("ADDITIONAL_COMPANY"))
        ? "ALL"
        : nextScopes[0] ?? "ALL";

    onChange(nextScopes, primaryScope);
  }

  const displayText = isAll
    ? "All scopes"
    : selectedScopes.map((s) => MasterPlanAndPackageScopeLabels[s] || s).join(", ") || "All scopes";

  return (
    <div ref={containerRef} className={FieldLabelClassName}>
      <span>{label}</span>
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className={joinClasses(
            ControlClassName,
            "flex items-center justify-between text-left font-semibold cursor-pointer",
          )}
        >
          <span className="truncate">{displayText}</span>
          <ChevronDown
            className={joinClasses(
              "h-4 w-4 text-darknavy/45 transition-transform",
              isOpen ? "rotate-180" : "",
            )}
            aria-hidden="true"
          />
        </button>
        {isOpen && (
          <div className="absolute left-0 top-full z-20 mt-1 w-full min-w-[14rem] rounded-lg border border-darknavy/10 bg-white p-2 shadow-lg">
            <div className="grid gap-1">
              <label className="flex cursor-pointer items-center gap-2 rounded-md px-2.5 py-1.5 text-sm font-semibold text-darknavy hover:bg-skyblue/8">
                <input
                  type="checkbox"
                  checked={isAll}
                  onChange={() => toggleScope("ALL")}
                  className="h-4 w-4 rounded border-darknavy/20 text-skyblue focus:ring-skyblue/20"
                />
                <span>All scopes</span>
              </label>
              <label className="flex cursor-pointer items-center gap-2 rounded-md px-2.5 py-1.5 text-sm font-semibold text-darknavy hover:bg-skyblue/8">
                <input
                  type="checkbox"
                  checked={isAll || selectedScopes.includes("ONBOARDING")}
                  onChange={() => toggleScope("ONBOARDING")}
                  className="h-4 w-4 rounded border-darknavy/20 text-skyblue focus:ring-skyblue/20"
                />
                <span>New user onboarding</span>
              </label>
              <label className="flex cursor-pointer items-center gap-2 rounded-md px-2.5 py-1.5 text-sm font-semibold text-darknavy hover:bg-skyblue/8">
                <input
                  type="checkbox"
                  checked={isAll || selectedScopes.includes("ADDITIONAL_COMPANY")}
                  onChange={() => toggleScope("ADDITIONAL_COMPANY")}
                  className="h-4 w-4 rounded border-darknavy/20 text-skyblue focus:ring-skyblue/20"
                />
                <span>Additional company</span>
              </label>
            </div>
          </div>
        )}
      </div>
      <FieldError message={error} />
    </div>
  );
}

function toNumber(value: string) {
  const parsedValue = Number(value);

  return Number.isFinite(parsedValue) ? parsedValue : 0;
}
