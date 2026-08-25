import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  GetFieldManagementBootstrap,
  type FieldManagementField,
} from "@/app/src/services/modules/system-administration/field-management/FieldManagementApi";

export const FieldManagementQueryKey = ["system-administration", "field-management"] as const;

export function useModuleFieldManagement(moduleCode: string) {
  const query = useQuery({
    enabled: Boolean(moduleCode),
    queryKey: FieldManagementQueryKey,
    queryFn: GetFieldManagementBootstrap,
  });

  const moduleFields = useMemo(
    () => query.data?.modules.find((module) => module.code === moduleCode)?.fields ?? [],
    [moduleCode, query.data?.modules],
  );

  const fieldsByKey = useMemo(
    () => new Map(moduleFields.map((field) => [normalizeFieldManagementKey(field.fieldKey), field])),
    [moduleFields],
  );

  function getField(fieldKeyOrLabel: string) {
    return fieldsByKey.get(normalizeFieldManagementKey(fieldKeyOrLabel));
  }

  function isFieldRequired(fieldKeyOrLabel: string, fallbackRequired = false) {
    return getField(fieldKeyOrLabel)?.isRequired ?? fallbackRequired;
  }

  function isFieldVisible(fieldKeyOrLabel: string, fallbackVisible = true) {
    return getField(fieldKeyOrLabel)?.isVisible ?? fallbackVisible;
  }

  return {
    error: query.error,
    fieldsByKey,
    getField,
    isEmpty: Boolean(moduleCode) && !query.isLoading && !query.isError && moduleFields.length === 0,
    isError: query.isError,
    isFieldRequired,
    isFieldVisible,
    isLoading: query.isLoading,
  };
}

export function normalizeFieldManagementKey(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

export type ModuleFieldManagementField = FieldManagementField;
