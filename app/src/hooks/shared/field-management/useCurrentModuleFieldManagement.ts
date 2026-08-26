import { useMemo } from "react";
import { usePathname } from "next/navigation";
import {
  useModuleFieldManagement,
  type ModuleFieldManagementField,
} from "@/app/src/hooks/shared/field-management/useModuleFieldManagement";
import { getModuleCodeFromPathname } from "@/app/src/ui/shared/field-management/ModuleFieldRequiredMark";

export function useCurrentModuleFieldManagement() {
  const pathname = usePathname();
  const moduleCode = useMemo(() => getModuleCodeFromPathname(pathname), [pathname]);
  const fieldManagement = useModuleFieldManagement(moduleCode);

  return {
    ...fieldManagement,
    moduleCode,
  };
}

export function useModuleFieldVisibility(labels: string[], fallbackVisible = true) {
  const { getField, moduleCode } = useCurrentModuleFieldManagement();
  const configuredFields = moduleCode ? labels.map((label) => getField(label)).filter(isConfiguredModuleField) : [];

  if (!moduleCode || configuredFields.length === 0) {
    return fallbackVisible;
  }

  return configuredFields.every((field) => field.isVisible);
}

function isConfiguredModuleField(field: ModuleFieldManagementField | undefined): field is ModuleFieldManagementField {
  return Boolean(field);
}
