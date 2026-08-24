import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  GetFieldManagementBootstrap,
  type FieldManagementField,
} from "@/app/src/services/modules/system-administration/field-management/FieldManagementApi";

const FieldManagementQueryKey = ["system-administration", "field-management"];

export function useModuleFieldManagement(moduleCode: string) {
  const query = useQuery({
    enabled: Boolean(moduleCode),
    queryKey: FieldManagementQueryKey,
    queryFn: GetFieldManagementBootstrap,
  });

  const fieldsByKey = useMemo(() => {
    const fields = query.data?.modules.find((module) => module.code === moduleCode)?.fields ?? [];

    return new Map(fields.map((field) => [normalizeFieldManagementKey(field.fieldKey), field]));
  }, [moduleCode, query.data?.modules]);

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
    fieldsByKey,
    getField,
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
