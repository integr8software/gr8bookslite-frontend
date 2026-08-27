"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  PostDatedCheckCopyFromSources,
  PostDatedCheckHref,
} from "@/app/src/constants/modules/cash-receipt/post-dated-check/PostDatedCheckConstants";
import {
  createPostDatedCheckDetail,
  createNextPostDatedCheckDetail,
  createPostDatedCheckValues,
  MockPostDatedCheckCopyFromRecords,
  renumberPostDatedCheckDetails,
} from "@/app/src/data/modules/cash-receipt/post-dated-check/PostDatedCheckData";
import { useAppStore } from "@/app/src/hooks/shared/app/useAppStore";
import {
  createPostDatedCheck,
  getPostDatedCheckNumber,
  getPostDatedCheckParties,
  getPostDatedCheck,
  updatePostDatedCheck,
} from "@/app/src/services/modules/cash-receipt/post-dated-check/PostDatedCheckService";
import { PostDatedCheckQueryKeys } from "@/app/src/services/modules/cash-receipt/post-dated-check/PostDatedCheckQueryKeys";
import type {
  PostDatedCheckFormErrors,
  PostDatedCheckFormValues,
} from "@/app/src/types/modules/cash-receipt/post-dated-check/PostDatedCheckTypes";
import { validatePostDatedCheck } from "@/app/src/validations/modules/cash-receipt/post-dated-check/PostDatedCheckValidation";

export function usePostDatedCheckActionPage() {
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const activeBranchId = useAppStore((state) => state.activeBranchId);
  const activeCompanyId = useAppStore((state) => state.activeCompanyId);
  const mode = pathname.includes("/view/") ? "view" : pathname.includes("/edit/") ? "edit" : "add";
  const recordId = pathname.match(/\/(?:edit|view)\/([^/]+)/)?.[1] ?? "";
  const [values, setValues] = useState<PostDatedCheckFormValues>(createPostDatedCheckValues);
  const [errors, setErrors] = useState<PostDatedCheckFormErrors>({});
  const recordQuery = useQuery({
    queryKey: PostDatedCheckQueryKeys.detail(recordId, activeCompanyId, activeBranchId),
    queryFn: () => getPostDatedCheck(recordId, activeBranchId),
    enabled: Boolean(recordId),
  });
  const partiesQuery = useQuery({
    queryKey: PostDatedCheckQueryKeys.parties(activeCompanyId),
    queryFn: getPostDatedCheckParties,
  });
  const numberQuery = useQuery({
    queryKey: [...PostDatedCheckQueryKeys.all, "number", activeCompanyId, activeBranchId],
    queryFn: () => getPostDatedCheckNumber(activeBranchId),
    enabled: mode === "add",
  });
  const saveMutation = useMutation({
    mutationFn: () =>
      mode === "edit" ? updatePostDatedCheck(recordId, values, activeBranchId) : createPostDatedCheck(values, activeBranchId),
    onSuccess: async (record) => {
      await queryClient.invalidateQueries({ queryKey: PostDatedCheckQueryKeys.all });
      toast.success("Post Dated Check saved.");
      router.push(`${PostDatedCheckHref}/view/${record.id}`);
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Could not save the registry."),
  });

  useEffect(() => {
    if (recordQuery.data) {
      queueMicrotask(() =>
        setValues({
          registryNo: recordQuery.data.registryNo,
          registryDate: recordQuery.data.registryDate,
          partyId: recordQuery.data.partyId,
          partyCode: recordQuery.data.partyCode,
          partyName: recordQuery.data.partyName,
          type: recordQuery.data.type,
          remarks: recordQuery.data.remarks,
          details: recordQuery.data.details,
        }),
      );
    }
  }, [recordQuery.data]);
  useEffect(() => {
    if (mode === "add" && numberQuery.data?.registryNo) {
      queueMicrotask(() => setValues((current) => ({ ...current, registryNo: current.registryNo || numberQuery.data.registryNo })));
    }
  }, [mode, numberQuery.data]);

  const partyOptions = useMemo(
    () => (partiesQuery.data ?? []).map((party) => ({ value: party.id, label: party.partyCode, name: party.partyName })),
    [partiesQuery.data],
  );
  function updateField<K extends keyof PostDatedCheckFormValues>(field: K, value: PostDatedCheckFormValues[K]) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }
  function selectParty(value: string) {
    const party = partiesQuery.data?.find((item) => item.id === value);
    updateField("partyId", party?.id ?? "");
    updateField("partyCode", party?.partyCode ?? "");
    updateField("partyName", party?.partyName ?? "");
  }
  function submit() {
    const nextErrors = validatePostDatedCheck(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      toast.error("Please complete the required PDC fields.");
      return;
    }
    saveMutation.mutate();
  }
  function updateRow(id: string, field: keyof PostDatedCheckFormValues["details"][number], value: string | number) {
    updateField(
      "details",
      values.details.map((row) => (row.id === id ? { ...row, [field]: value } : row)),
    );
  }
  function checkDuplicateCheckNumber(id: string, checkNumber: string) {
    const normalized = checkNumber.trim().toLowerCase();
    const isDuplicate = Boolean(normalized) && values.details.some((row) => row.id !== id && row.pdcNo.trim().toLowerCase() === normalized);

    setErrors((current) => {
      const detailErrors = { ...current.detailErrors };
      const rowErrors = { ...detailErrors[id] };
      if (isDuplicate) rowErrors.pdcNo = "Check number is duplicated in this registry.";
      else delete rowErrors.pdcNo;
      if (Object.keys(rowErrors).length) detailErrors[id] = rowErrors;
      else delete detailErrors[id];
      return { ...current, detailErrors: Object.keys(detailErrors).length ? detailErrors : undefined };
    });

    if (isDuplicate) toast.error(`Check number ${checkNumber.trim()} already exists in this registry.`);
  }
  function addRows(count: number) {
    const next = [...values.details];
    for (let index = 0; index < count; index += 1) {
      const previous = next.at(-1);
      next.push(previous ? createNextPostDatedCheckDetail(previous, next.length, next) : createPostDatedCheckDetail(next.length));
    }
    updateField("details", renumberPostDatedCheckDetails(next));
  }
  function removeRow(id: string) {
    updateField("details", renumberPostDatedCheckDetails(values.details.filter((row) => row.id !== id)));
  }
  function duplicateRow(id: string) {
    const index = values.details.findIndex((row) => row.id === id);
    const next = [...values.details];
    next.splice(index + 1, 0, { ...values.details[index], id: createPostDatedCheckDetail().id });
    updateField("details", renumberPostDatedCheckDetails(next));
  }
  function insertRow(id: string, position: "above" | "below") {
    const index = values.details.findIndex((row) => row.id === id);
    const next = [...values.details];
    next.splice(position === "above" ? index : index + 1, 0, createPostDatedCheckDetail());
    updateField("details", renumberPostDatedCheckDetails(next));
  }
  function moveRow(from: string, to: string) {
    const next = [...values.details];
    const fromIndex = next.findIndex((row) => row.id === from);
    const toIndex = next.findIndex((row) => row.id === to);
    const [row] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, row);
    updateField("details", renumberPostDatedCheckDetails(next));
  }

  function copyFrom(recordIds: string[]) {
    const selectedRecords = MockPostDatedCheckCopyFromRecords.filter((record) => recordIds.includes(record.id));
    if (selectedRecords.length === 0) return;
    const references = selectedRecords.map((record) => record.sourceNo).join(", ");
    updateField("remarks", values.remarks.trim() ? `${values.remarks.trim()} | Copied from ${references}` : `Copied from ${references}`);
    toast.success(`${selectedRecords.length} invoice${selectedRecords.length === 1 ? "" : "s"} copied.`);
  }

  return {
    addRows,
    copyFrom,
    copyFromRecords: MockPostDatedCheckCopyFromRecords,
    copyFromSources: [...PostDatedCheckCopyFromSources],
    checkDuplicateCheckNumber,
    duplicateRow,
    errors,
    loadError: recordQuery.error,
    insertRow,
    isLoading: recordQuery.isLoading,
    isReadonly: mode === "view",
    isSaving: saveMutation.isPending,
    moveRow,
    numberInputMode: numberQuery.data?.inputMode,
    partyOptions,
    removeRow,
    selectParty,
    submit,
    title: mode === "add" ? "Add Post Dated Check" : mode === "edit" ? "Edit Post Dated Check" : "View Post Dated Check",
    updateField,
    updateRow,
    values,
  };
}
