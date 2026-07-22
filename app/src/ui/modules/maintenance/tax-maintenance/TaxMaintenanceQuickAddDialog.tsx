"use client";

import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { EmptyTaxFormValues } from "@/app/src/constants/modules/maintenance/tax-maintenance/TaxMaintenanceConstants";
import { createTaxMaintenance } from "@/app/src/services/modules/maintenance/tax-maintenance/TaxMaintenanceApi";
import type {
  TaxMaintenance,
  TaxMaintenanceDefaultAccountIds,
} from "@/app/src/types/modules/maintenance/tax-maintenance/TaxMaintenanceTypes";
import { QuickAddDialog } from "@/app/src/ui/shared/module/QuickAddDialog";

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
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const timeoutId = window.setTimeout(() => {
      setName("");
      setPercentage("0");
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
        status: "Active",
      });
      onSaved(savedTax);
      toast.success("Tax registration type saved.");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Could not save tax registration type.");
    } finally {
      setIsSaving(false);
    }
  }, [defaultAccountIds, name, onSaved, percentage]);

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
        <span className="text-sm font-semibold text-darknavy">Percentage</span>
        <input
          type="number"
          min="0"
          max="100"
          step="0.0001"
          value={percentage}
          disabled={isSaving}
          onChange={(event) => {
            setPercentage(event.target.value);
            setError("");
          }}
          className="h-11 rounded-md border border-darknavy/10 bg-white px-3 text-sm font-medium text-darknavy outline-none transition placeholder:text-darknavy/35 focus:border-skyblue focus:ring-4 focus:ring-skyblue/15 disabled:cursor-not-allowed disabled:bg-darknavy/5"
        />
      </label>
    </QuickAddDialog>
  );
}
