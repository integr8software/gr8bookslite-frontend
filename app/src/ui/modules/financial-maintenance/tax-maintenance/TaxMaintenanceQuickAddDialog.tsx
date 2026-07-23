"use client";

import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { EmptyTaxFormValues } from "@/app/src/constants/modules/financial-maintenance/tax-maintenance/TaxMaintenanceConstants";
import { createTaxMaintenance } from "@/app/src/services/modules/financial-maintenance/tax-maintenance/TaxMaintenanceApi";
import type {
  TaxMaintenance,
  TaxMaintenanceDefaultAccountIds,
} from "@/app/src/types/modules/financial-maintenance/tax-maintenance/TaxMaintenanceTypes";
import { AppSwitch } from "@/app/src/ui/shared/app/AppSwitch";
import { QuickAddDialog } from "@/app/src/ui/shared/module/QuickAddDialog";

const TaxableTaxTreatmentSwitchOption = {
  label: "Taxable",
  value: "taxable",
} as const;
const TaxExemptTreatmentSwitchOption = {
  label: "Exempt",
  value: "exempt",
} as const;

type TaxMaintenanceQuickAddDialogProps = {
  defaultAccountIds?: TaxMaintenanceDefaultAccountIds;
  isOpen: boolean;
  onClose: () => void;
  onSaved: (tax: TaxMaintenance) => void;
};

export function TaxMaintenanceQuickAddDialog({
  defaultAccountIds,
  isOpen,
  onClose,
  onSaved,
}: TaxMaintenanceQuickAddDialogProps) {
  const [name, setName] = useState("");
  const [percentage, setPercentage] = useState("0");
  const [isExempted, setIsExempted] = useState(false);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const timeoutId = window.setTimeout(() => {
      setName("");
      setPercentage("0");
      setIsExempted(false);
      setError("");
    });
    return () => window.clearTimeout(timeoutId);
  }, [isOpen]);

  const handleSave = useCallback(async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Tax registration type is required.");
      return;
    }
    if (!defaultAccountIds) {
      setError("Tax accounts are still loading.");
      return;
    }

    setIsSaving(true);
    setError("");
    try {
      const savedTax = await createTaxMaintenance({
        ...EmptyTaxFormValues,
        ...defaultAccountIds,
        name: trimmedName,
        percentage,
        isExempted,
        status: "Active",
      });
      onSaved(savedTax);
      toast.success("Tax registration type saved.");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Could not save tax registration type.");
    } finally {
      setIsSaving(false);
    }
  }, [defaultAccountIds, isExempted, name, onSaved, percentage]);

  return (
    <QuickAddDialog
      error={error}
      isOpen={isOpen}
      isPending={isSaving}
      title="Add Tax Registration Type"
      onClose={onClose}
      onSave={handleSave}
    >
      <label className="grid gap-2">
        <span className="text-sm font-semibold text-darknavy">
          Tax Registration Type <span className="text-coralpink">*</span>
        </span>
        <input
          value={name}
          disabled={isSaving}
          onChange={(event) => {
            setName(event.target.value);
            setError("");
          }}
          className="h-11 rounded-md border border-darknavy/10 bg-white px-3 text-sm font-medium text-darknavy outline-none transition placeholder:text-darknavy/35 focus:border-skyblue focus:ring-4 focus:ring-skyblue/15 disabled:cursor-not-allowed disabled:bg-darknavy/5"
        />
      </label>
      <label className="grid gap-2">
        <span className="text-sm font-semibold text-darknavy">Tax Exempt</span>
        <AppSwitch
          className="!w-full !min-w-0"
          disabled={isSaving}
          falseOption={TaxableTaxTreatmentSwitchOption}
          value={isExempted ? "exempt" : "taxable"}
          onChange={(value) => {
            const nextIsExempted = value === "exempt";
            setIsExempted(nextIsExempted);
            if (nextIsExempted) setPercentage("");
            setError("");
          }}
          trueOption={TaxExemptTreatmentSwitchOption}
        />
      </label>
      <label className="grid gap-2">
        <span className="text-sm font-semibold text-darknavy">Percentage</span>
        <input
          type="number"
          min="0"
          max="100"
          step="0.0001"
          value={percentage}
          disabled={isSaving || isExempted}
          onChange={(event) => {
            setPercentage(event.target.value);
            setError("");
          }}
          className="h-11 rounded-md border border-darknavy/10 bg-white px-3 text-sm font-medium text-darknavy outline-none transition placeholder:text-darknavy/35 focus:border-skyblue focus:ring-4 focus:ring-skyblue/15 disabled:cursor-not-allowed disabled:bg-darknavy/5"
          placeholder={isExempted ? "No tax" : "0"}
        />
      </label>
    </QuickAddDialog>
  );
}
