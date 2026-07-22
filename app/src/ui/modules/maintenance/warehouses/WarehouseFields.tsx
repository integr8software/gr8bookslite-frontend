"use client";

import { useState, type ChangeEventHandler, type ReactNode } from "react";
import { Building2, Check } from "lucide-react";
import { WarehouseBranchAvailabilityOptions } from "@/app/src/constants/modules/maintenance/warehouses/WarehouseConstants";
import type { WarehouseFormErrors, WarehouseFormValues } from "@/app/src/types/modules/maintenance/warehouses/WarehouseTypes";
import { AppLimitedTextarea } from "@/app/src/ui/shared/app/AppLimitedTextarea";
import { AppSwitch } from "@/app/src/ui/shared/app/AppSwitch";
import { MaintenanceActiveStatusSwitchOption, MaintenanceInactiveStatusSwitchOption } from "@/app/src/constants/modules/maintenance/MaintenanceStatusConstants";

type WarehouseFieldsProps = {
  branchOptions: Array<{ code: string; id: string; name: string }>;
  errors: WarehouseFormErrors;
  isWarehouseCodeReadonly?: boolean;
  values: WarehouseFormValues;
  onAvailabilityModeChange: (mode: WarehouseFormValues["branchAvailabilityMode"]) => void;
  onInputChange: ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>;
  onSetBranchSelection: (branchUnitIds: string[]) => void;
	 onStatusChange: (value: WarehouseFormValues["status"]) => void;
  onToggleBranch: (branchId: string) => void;
};

type WarehouseFormTab = "Basic Information" | "Availability";

const WarehouseFormTabs: WarehouseFormTab[] = ["Basic Information", "Availability"];

export function WarehouseFields({
  branchOptions,
  errors,
  isWarehouseCodeReadonly = false,
  onAvailabilityModeChange,
  onInputChange,
  onSetBranchSelection,
	 onStatusChange,
  onToggleBranch,
  values,
}: WarehouseFieldsProps) {
  const [selectedTab, setSelectedTab] = useState<WarehouseFormTab>("Basic Information");
  const selectedBranchCount = values.branchUnitIds.length;
  const usesBranchSelection = values.branchAvailabilityMode !== "All Branches";
  const branchSelectionNoun = values.branchAvailabilityMode === "Except Branches" ? "excluded" : "selected";

  function selectAllBranches() {
    onSetBranchSelection(branchOptions.map((branch) => branch.id));
  }

  function clearBranches() {
    onSetBranchSelection([]);
  }

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
      <WarehouseTabs
        value={selectedTab}
        hasAvailabilityError={Boolean(errors.branchUnitIds)}
        hasSelectedBranches={values.branchAvailabilityMode !== "Specific Branches" || selectedBranchCount > 0}
        onChange={setSelectedTab}
      />

      <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-5 pt-5">
        {selectedTab === "Basic Information" ? (
          <div className="grid gap-4">
            <FormField label="Warehouse Name" error={errors.name} required>
              <input name="name" value={values.name} onChange={onInputChange} maxLength={180} className={fieldClassName} placeholder="Main Warehouse" />
            </FormField>

            <FormField label="Description" error={errors.description}>
              <AppLimitedTextarea
                name="description"
                value={values.description}
                onChange={onInputChange}
                className={`${fieldClassName} min-h-24 py-3`}
                placeholder="Usage notes for this warehouse"
                counterMode="used"
              />
            </FormField>

            <FormField label="Location" error={errors.address} required>
              <textarea
                name="address"
                value={values.address}
                onChange={onInputChange}
                rows={2}
                maxLength={500}
                className={`${fieldClassName} min-h-16 resize-y py-2.5`}
                placeholder="Warehouse location"
              />
            </FormField>

            <div className="grid gap-4 lg:grid-cols-2">
              <FormField label="Manager" error={errors.managerName}>
                <input
                  name="managerName"
                  value={values.managerName}
                  onChange={onInputChange}
                  maxLength={180}
                  className={fieldClassName}
                  placeholder="Warehouse manager"
                />
              </FormField>
              <FormField label="Contact No." error={errors.contactNo}>
                <input
                  name="contactNo"
                  value={values.contactNo}
                  onChange={onInputChange}
                  maxLength={40}
                  className={fieldClassName}
                  placeholder="Contact number"
                />
              </FormField>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <FormField label="Warehouse Code" error={errors.code}>
                <input
                  name="code"
                  value={values.code}
                  onChange={onInputChange}
                  maxLength={80}
                  readOnly={isWarehouseCodeReadonly}
                  className={`${fieldClassName} font-mono ${isWarehouseCodeReadonly ? readonlyFieldClassName : ""}`}
                  placeholder={isWarehouseCodeReadonly ? "Auto-generated on save" : "WH-MAIN"}
                />
                {isWarehouseCodeReadonly ? (
                  <span className="mt-1 block text-xs font-medium text-darknavy/45">Code is managed by Maintenance Registry numbering.</span>
                ) : null}
              </FormField>
              <FormField label="Status" error={errors.status} required>
                <AppSwitch
                  falseOption={MaintenanceInactiveStatusSwitchOption}
                  value={values.status}
                  onChange={onStatusChange}
                  trueOption={MaintenanceActiveStatusSwitchOption}
                />
              </FormField>
            </div>
          </div>
        ) : null}

        {selectedTab === "Availability" ? (
          <div className="grid gap-3">
            <div className="grid gap-2 border-b border-darknavy/10 pb-3">
              <div className="min-w-0">
                <p className="text-sm font-medium text-darknavy/55">Choose how this warehouse applies to company branches.</p>
                {errors.branchAvailabilityMode ? <p className="mt-0.5 text-xs font-semibold text-coralpink">{errors.branchAvailabilityMode}</p> : null}
              </div>
              <div className="grid gap-2 sm:grid-cols-3">
                {WarehouseBranchAvailabilityOptions.map((option) => {
                  const checked = values.branchAvailabilityMode === option;

                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => onAvailabilityModeChange(option)}
                      className={`rounded-md border px-3 py-2 text-left text-sm font-semibold transition ${checked ? "border-skyblue bg-skyblue/10 text-darknavy" : "border-darknavy/10 bg-white text-darknavy/65 hover:bg-offwhite/65"}`}
                    >
                      {option}
                      <span className="mt-0.5 block text-xs font-medium text-darknavy/45">{getAvailabilityModeHint(option)}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {usesBranchSelection ? (
              <div className="grid gap-2">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-darknavy">
                      {values.branchAvailabilityMode === "Except Branches" ? "Excluded branches" : "Available branches"}
                    </p>
                    <p className="text-xs font-medium text-darknavy/45">
                      {selectedBranchCount} {branchSelectionNoun}
                    </p>
                    {errors.branchUnitIds ? <p className="mt-0.5 text-xs font-semibold text-coralpink">{errors.branchUnitIds}</p> : null}
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button type="button" onClick={selectAllBranches} className={availabilityActionClassName}>
                      Select all
                    </button>
                    <button type="button" onClick={clearBranches} className={availabilityActionClassName}>
                      Clear all
                    </button>
                  </div>
                </div>
                {branchOptions.length > 0 ? (
                  branchOptions.map((branch) => {
                    const checked = values.branchUnitIds.includes(branch.id);

                    return (
                      <label
                        key={branch.id}
                        className={`flex min-h-14 cursor-pointer items-center gap-3 rounded-md border px-3 text-sm transition ${checked ? "border-skyblue bg-skyblue/10 text-darknavy" : "border-darknavy/10 bg-white text-darknavy/70 hover:bg-offwhite/65"}`}
                      >
                        <input type="checkbox" checked={checked} onChange={() => onToggleBranch(branch.id)} className="peer sr-only" />
                        <span className="grid h-5 w-5 shrink-0 place-items-center rounded border border-darknavy/25 peer-checked:border-skyblue peer-checked:bg-skyblue peer-checked:text-white">
                          {checked ? <Check className="h-3.5 w-3.5" /> : null}
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate font-semibold">{branch.name}</span>
                          <span className="block text-xs text-darknavy/45">{branch.code}</span>
                        </span>
                      </label>
                    );
                  })
                ) : (
                  <div className="rounded-md border border-darknavy/10 bg-offwhite/45 p-4 text-sm font-medium text-darknavy/55">
                    No active branches are available for the current company.
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-md border border-skyblue/20 bg-skyblue/8 p-4 text-sm font-medium text-darknavy/65">
                This warehouse will be available to every active branch, including branches added later.
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function getAvailabilityModeHint(mode: WarehouseFormValues["branchAvailabilityMode"]) {
  if (mode === "All Branches") {
    return "Includes future branches";
  }

  if (mode === "Except Branches") {
    return "Exclude only selected branches";
  }

  return "Use only selected branches";
}

function WarehouseTabs({
  hasAvailabilityError,
  hasSelectedBranches,
  onChange,
  value,
}: {
  hasAvailabilityError: boolean;
  hasSelectedBranches: boolean;
  onChange: (value: WarehouseFormTab) => void;
  value: WarehouseFormTab;
}) {
  return (
    <div className="flex h-10 shrink-0 items-end gap-5 border-b border-darknavy/10 px-6">
      {WarehouseFormTabs.map((option) => {
        const isActive = value === option;

        return (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className={[
              "h-9 whitespace-nowrap border-b-2 text-sm font-semibold transition",
              isActive ? "border-skyblue text-skyblue" : "border-transparent text-darknavy/45 hover:text-darknavy/70",
            ].join(" ")}
          >
            <span className="inline-flex items-center gap-2">
              {option === "Availability" ? <Building2 className="h-4 w-4" aria-hidden="true" /> : null}
              {option}
              {option === "Availability" ? (
                <span
                  aria-label={hasAvailabilityError ? "Availability requires attention" : hasSelectedBranches ? "Availability complete" : "No branches selected"}
                  className={`grid h-3.5 w-3.5 shrink-0 place-items-center rounded-full border ${hasAvailabilityError ? "border-coralpink/60 bg-coralpink/10" : hasSelectedBranches ? "border-emerald-500/60 bg-emerald-50" : "border-darknavy/20 bg-darknavy/5"}`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${hasAvailabilityError ? "bg-coralpink" : hasSelectedBranches ? "bg-emerald-500" : "bg-darknavy/30"}`}
                  />
                </span>
              ) : null}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function FormField({ children, error, label, required }: { children: ReactNode; error?: string; label: string; required?: boolean }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-darknavy">
        {label}
        {required ? <span className="text-coralpink"> *</span> : null}
      </span>
      {children}
      {error ? <span className="mt-1 block text-xs font-medium text-coralpink">{error}</span> : null}
    </label>
  );
}

const fieldClassName =
  "min-h-11 w-full rounded-md border border-darknavy/15 bg-white px-3 text-sm font-medium text-darknavy outline-none transition placeholder:text-darknavy/35 focus:border-skyblue focus:ring-2 focus:ring-skyblue/20 disabled:cursor-default disabled:bg-offwhite/65 disabled:text-darknavy read-only:bg-offwhite/65";
const readonlyFieldClassName = "cursor-not-allowed bg-offwhite text-darknavy/60 focus:border-darknavy/15 focus:ring-0";
const availabilityActionClassName =
  "inline-flex min-h-9 items-center justify-center rounded-md border border-darknavy/10 bg-white px-3 text-xs font-semibold text-darknavy/65 transition hover:border-skyblue/40 hover:text-skyblue";
