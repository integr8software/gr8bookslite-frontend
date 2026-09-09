"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  BillingStatementHref,
  BillingStatementPartyOptions,
  BillingStatementResponsibilityCenterOptions,
  BillingStatementTermsOptions,
} from "@/app/src/constants/modules/sales/billing-statement/BillingStatementConstants";
import {
  calculateBillingStatementTotals,
  createBillingStatementAccountingEntries,
  createBillingStatementFormValues,
  createBillingStatementRecord,
} from "@/app/src/data/modules/sales/billing-statement/BillingStatementData";
import { acquireModuleActionLock } from "@/app/src/hooks/shared/module/ModuleActionLock";
import { useAppStore } from "@/app/src/hooks/shared/app/useAppStore";
import { useBillingMaintenanceOptions } from "@/app/src/hooks/modules/sales/shared/useBillingMaintenanceOptions";
import {
  createBillingStatement,
  fetchBillingStatement,
  updateBillingStatement,
} from "@/app/src/services/modules/sales/billing-statement/BillingStatementApi";
import { BillingStatementQueryKeys } from "@/app/src/services/modules/sales/billing-statement/BillingStatementQueryKeys";
import { fetchPartyOptions } from "@/app/src/services/modules/party-management/PartyManagementApi";
import { PartyManagementQueryKeys } from "@/app/src/services/modules/party-management/PartyManagementQueryKeys";
import type {
  BillingStatementAccountingEntry,
  BillingStatementFormErrors,
  BillingStatementFormMode,
  BillingStatementFormValues,
  BillingStatementItem,
  BillingStatementRecord,
} from "@/app/src/types/modules/sales/billing-statement/BillingStatementTypes";
import type { ItemSupplierRecord } from "@/app/src/types/modules/item-management/items/ItemManagementTypes";
import type { AppAdvancedDropdownOption } from "@/app/src/ui/shared/advanced-dropdown/AppAdvancedDropdown";
import { validateBillingStatementForm } from "@/app/src/validations/modules/sales/billing-statement/BillingStatementValidation";

export function useBillingStatementFormPage() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams<{ recordId?: string }>();
  const queryClient = useQueryClient();
  const activeBranchId = useAppStore((state) => state.activeBranchId);
  const activeCompanyId = useAppStore((state) => state.activeCompanyId);
  const mode = getBillingStatementFormMode(pathname);
  const isReadonly = mode === "view";
  const recordQuery = useQuery({
    enabled: mode !== "add" && Boolean(params.recordId) && activeCompanyId !== null && activeBranchId !== null,
    queryFn: () =>
      fetchBillingStatement(params.recordId ?? "", {
        branchUnitId: activeBranchId,
      }),
    queryKey: BillingStatementQueryKeys.detail(activeCompanyId, activeBranchId, params.recordId ?? "missing"),
    retry: false,
  });
  const customerPartyOptionsQuery = useQuery({
    enabled: activeCompanyId !== null,
    queryFn: () => fetchPartyOptions("Customer"),
    queryKey: PartyManagementQueryKeys.customerOptions("sales-billing-statement"),
    retry: false,
  });
  const customerPartyOptions = useMemo(
    () => (customerPartyOptionsQuery.data ? mapCustomerPartyOptions(customerPartyOptionsQuery.data) : BillingStatementPartyOptions),
    [customerPartyOptionsQuery.data],
  );
  const { responsibilityCenterOptions, termOptions } = useBillingMaintenanceOptions({
    responsibilityCenterFallbackOptions: BillingStatementResponsibilityCenterOptions,
    termFallbackOptions: BillingStatementTermsOptions.map((option) => ({
      name: option,
      value: option === "--Select Terms--" ? "" : option,
    })),
  });
  const existingStatement = mode === "add" ? undefined : (recordQuery.data ?? undefined);
  const [values, setValues] = useState<BillingStatementFormValues>(() => createBillingStatementFormValues(existingStatement));
  const [errors, setErrors] = useState<BillingStatementFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSubmittingRef = useRef(false);
  const saveMutation = useMutation({
    mutationFn: (nextValues: BillingStatementFormValues) => {
      if (mode === "edit" && existingStatement) {
        return updateBillingStatement(
          createBillingStatementRecord(nextValues, existingStatement.id),
          requireActiveBranchId(activeBranchId),
        );
      }

      return createBillingStatement(nextValues, requireActiveBranchId(activeBranchId));
    },
    onSuccess: (statement) => {
      void queryClient.invalidateQueries({
        queryKey: BillingStatementQueryKeys.all(activeCompanyId, activeBranchId),
      });
      void queryClient.invalidateQueries({
        queryKey: BillingStatementQueryKeys.detail(activeCompanyId, activeBranchId, statement.id),
      });
      toast.success(mode === "edit" ? "Billing statement updated." : "Billing statement created.");
      router.push(`${BillingStatementHref}/view/${statement.id}`);
    },
    onError: (error) => {
      const axiosError = error as {
        response?: { data?: { message?: string | string[] } };
        message?: string;
      };
      const responseMessage = axiosError.response?.data?.message;
      const displayMessage = Array.isArray(responseMessage)
        ? responseMessage.join(", ")
        : typeof responseMessage === "string"
          ? responseMessage
          : error instanceof Error
            ? error.message
            : "Could not save billing statement.";

      toast.error(displayMessage);
      isSubmittingRef.current = false;
      setIsSubmitting(false);
    },
  });

  useEffect(() => {
    if (!existingStatement) {
      return;
    }

    setValues(createBillingStatementFormValues(existingStatement));
    setErrors({});
  }, [existingStatement]);

  const previewRecord = useMemo(() => createBillingStatementRecord(values, params.recordId ?? "preview"), [params.recordId, values]);

  function updateField<TKey extends keyof BillingStatementFormValues>(field: TKey, value: BillingStatementFormValues[TKey]) {
    if (isReadonly) return;
    setValues((current) => {
      const nextValues = { ...current, [field]: value };
      if (field === "name" || field === "code" || field === "transNo" || field === "defaultAccount") {
        return {
          ...nextValues,
          accountingEntries: createBillingStatementAccountingEntries({
            defaultAccount: nextValues.defaultAccount,
            items: nextValues.items,
            partyCode: nextValues.code,
            partyName: nextValues.name,
            refNo: nextValues.transNo,
          }),
        };
      }
      return nextValues;
    });
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function updateItems(items: BillingStatementItem[]) {
    if (isReadonly) return;
    setValues((current) => {
      const normalizedRecord = createBillingStatementRecord({ ...current, items }, "preview");
      const totals = calculateBillingStatementTotals(normalizedRecord.items);
      return {
        ...current,
        ...totals,
        accountingEntries: createBillingStatementAccountingEntries({
          defaultAccount: current.defaultAccount,
          items: normalizedRecord.items,
          partyCode: current.code,
          partyName: current.name,
          refNo: current.transNo,
        }),
        items: normalizedRecord.items,
      };
    });
    setErrors((current) => ({ ...current, items: undefined }));
  }

  function updateAccountingEntries(accountingEntries: BillingStatementAccountingEntry[]) {
    if (isReadonly) return;
    setValues((current) => ({ ...current, accountingEntries }));
  }

  function handleSubmit() {
    if (isReadonly || isSubmittingRef.current) return;

    const releaseSubmitLock = acquireModuleActionLock(`sales:billing-statement:submit:${mode}:${params.recordId ?? values.transNo}`);

    if (!releaseSubmitLock) return;

    isSubmittingRef.current = true;
    setIsSubmitting(true);
    const nextErrors = validateBillingStatementForm(values);

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      const firstErrorMessage = Object.values(nextErrors).find(Boolean);
      toast.error(firstErrorMessage || "Please complete the required billing statement fields.");
      isSubmittingRef.current = false;
      setIsSubmitting(false);
      releaseSubmitLock();
      return;
    }

    saveMutation.mutate(values, {
      onSettled: () => releaseSubmitLock(),
    });
  }

  return {
    errors,
    existingStatement,
    handleSubmit,
    isSubmitting,
    isReadonly,
    mode,
    needsRecord: (mode === "edit" || mode === "view") && recordQuery.isFetched && !recordQuery.isLoading,
    previewRecord,
    customerPartyOptions,
    responsibilityCenterOptions,
    termOptions,
    updateAccountingEntries,
    updateField,
    updateItems,
    values,
  };
}

function mapCustomerPartyOptions(parties: ItemSupplierRecord[]): AppAdvancedDropdownOption[] {
  return parties.map((party) => ({
    label: party.code,
    name: party.name,
    selectedDetails: party.code,
    value: party.name,
  }));
}

function getBillingStatementFormMode(pathname: string): BillingStatementFormMode {
  if (pathname.includes("/edit/")) return "edit";
  if (pathname.includes("/view/")) return "view";
  return "add";
}

function requireActiveBranchId(branchUnitId: number | null) {
  if (branchUnitId === null) {
    throw new Error("Select a branch before saving billing statements.");
  }

  return branchUnitId;
}
