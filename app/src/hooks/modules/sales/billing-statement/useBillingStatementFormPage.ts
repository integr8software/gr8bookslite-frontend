"use client";

import { useMemo, useRef, useState } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { BillingStatementHref } from "@/app/src/constants/modules/sales/billing-statement/BillingStatementConstants";
import {
  calculateBillingStatementTotals,
  createBillingStatementFormValues,
  createBillingStatementRecord,
} from "@/app/src/data/modules/sales/billing-statement/BillingStatementData";
import { useBillingStatementStore } from "@/app/src/hooks/modules/sales/billing-statement/useBillingStatement";
import { acquireModuleActionLock } from "@/app/src/hooks/shared/module/ModuleActionLock";
import type {
  BillingStatementAccountingEntry,
  BillingStatementFormErrors,
  BillingStatementFormMode,
  BillingStatementFormValues,
  BillingStatementItem,
  BillingStatementRecord,
} from "@/app/src/types/modules/sales/billing-statement/BillingStatementTypes";
import { validateBillingStatementForm } from "@/app/src/validations/modules/sales/billing-statement/BillingStatementValidation";

export function useBillingStatementFormPage() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams<{ recordId?: string }>();
  const { addStatement, statements, updateStatement } = useBillingStatementStore();
  const mode = getBillingStatementFormMode(pathname);
  const isReadonly = mode === "view";
  const existingStatement = findBillingStatementByRouteId(statements, params.recordId);
  const [values, setValues] = useState<BillingStatementFormValues>(() =>
    createBillingStatementFormValues(existingStatement),
  );
  const [errors, setErrors] = useState<BillingStatementFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSubmittingRef = useRef(false);

  const previewRecord = useMemo(
    () => createBillingStatementRecord(values, params.recordId ?? "preview"),
    [params.recordId, values],
  );

  function updateField<TKey extends keyof BillingStatementFormValues>(
    field: TKey,
    value: BillingStatementFormValues[TKey],
  ) {
    if (isReadonly) return;
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function updateItems(items: BillingStatementItem[]) {
    if (isReadonly) return;
    setValues((current) => {
      const normalizedRecord = createBillingStatementRecord({ ...current, items }, "preview");
      const totals = calculateBillingStatementTotals(normalizedRecord.items);
      return { ...current, ...totals, items: normalizedRecord.items };
    });
    setErrors((current) => ({ ...current, items: undefined }));
  }

  function updateAccountingEntries(accountingEntries: BillingStatementAccountingEntry[]) {
    if (isReadonly) return;
    setValues((current) => ({ ...current, accountingEntries }));
  }

  function handleSubmit() {
    if (isReadonly || isSubmittingRef.current) return;

    const releaseSubmitLock = acquireModuleActionLock(
      `sales:billing-statement:submit:${mode}:${params.recordId ?? values.transNo}`,
    );

    if (!releaseSubmitLock) return;

    isSubmittingRef.current = true;
    setIsSubmitting(true);
    const nextErrors = validateBillingStatementForm(values);

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      toast.error("Please complete the required billing statement fields.");
      isSubmittingRef.current = false;
      setIsSubmitting(false);
      releaseSubmitLock();
      return;
    }

    const nextStatement = createBillingStatementRecord(values, params.recordId);

    if (mode === "edit") {
      updateStatement(nextStatement);
      toast.success("Billing statement updated.");
    } else {
      addStatement(nextStatement);
      toast.success("Billing statement created.");
    }

    router.push(`${BillingStatementHref}/view/${nextStatement.id}`);
  }

  return {
    errors,
    existingStatement,
    handleSubmit,
    isSubmitting,
    isReadonly,
    mode,
    needsRecord: mode === "edit" || mode === "view",
    previewRecord,
    updateAccountingEntries,
    updateField,
    updateItems,
    values,
  };
}

function getBillingStatementFormMode(pathname: string): BillingStatementFormMode {
  if (pathname.includes("/edit/")) return "edit";
  if (pathname.includes("/view/")) return "view";
  return "add";
}

function findBillingStatementByRouteId(
  statements: BillingStatementRecord[],
  routeId?: string,
) {
  if (!routeId) return undefined;
  const normalizedRouteId = routeId.trim().toLowerCase();

  return statements.find((statement) => {
    const normalizedId = statement.id.trim().toLowerCase();
    const normalizedTransNo = statement.transNo.trim().toLowerCase();

    return (
      normalizedId === normalizedRouteId ||
      normalizedTransNo === normalizedRouteId ||
      `bs-${normalizedTransNo}` === normalizedRouteId
    );
  });
}
