import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type PaginationState,
  type SortingState,
} from "@tanstack/react-table";
import toast from "react-hot-toast";
import {
  GetFieldManagementBootstrap,
  SaveFieldManagementModuleFields,
  type FieldManagementField,
  type FieldManagementModule,
} from "@/app/src/services/modules/system-administration/field-management/FieldManagementApi";

export const FieldManagementQueryKey = ["system-administration", "field-management"] as const;
export const FieldManagementTablePaginationStorageKey = "system-administration-field-management";

export type EditableField = FieldManagementField;

export function useFieldManagementPage() {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: FieldManagementQueryKey,
    queryFn: GetFieldManagementBootstrap,
  });
  const modules = useMemo(() => query.data?.modules ?? [], [query.data?.modules]);
  const [moduleQuery, setModuleQuery] = useState("");
  const [selectedModuleId, setSelectedModuleId] = useState<number | null>(null);
  const selectedModule = modules.find((module) => module.id === selectedModuleId) ?? modules[0];
  const [fields, setFields] = useState<EditableField[]>([]);
  const [dirty, setDirty] = useState(false);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 15,
  });
  const [sorting, setSorting] = useState<SortingState>([]);
  const columns = useMemo<ColumnDef<EditableField>[]>(
    () => [
      createFieldManagementColumn("label", "Field", "w-[28rem]"),
      createFieldManagementColumn("fieldType", "Type", "w-[8rem]"),
      {
        id: "visible",
        header: "Visible",
        enableSorting: false,
        meta: { className: "w-[9rem] text-center" },
      },
      {
        id: "required",
        header: "Required",
        enableSorting: false,
        meta: { className: "w-[10rem] text-center" },
      },
    ],
    [],
  );

  useEffect(() => {
    if (!selectedModuleId && modules[0]) {
      setSelectedModuleId(modules[0].id);
    }
  }, [modules, selectedModuleId]);

  useEffect(() => {
    if (!selectedModule || dirty) return;
    setFields(sortFieldsByLabel(selectedModule.fields));
  }, [dirty, selectedModule]);

  const filteredModules = useMemo(() => {
    const queryText = moduleQuery.trim().toLowerCase();
    if (!queryText) return modules;
    return modules.filter((module) => [module.code, module.name].join(" ").toLowerCase().includes(queryText));
  }, [moduleQuery, modules]);

  const manageableFields = useMemo(() => fields.filter(isHeaderField), [fields]);
  const visibleCount = manageableFields.filter((field) => field.isVisible).length;
  const requiredCount = manageableFields.filter((field) => field.isRequired).length;
  const headerFields = manageableFields;
  const save = useMutation({
    mutationFn: () =>
      SaveFieldManagementModuleFields(
        selectedModule!.id,
        fields.map((field) => ({
          id: field.id,
          isVisible: field.isVisible,
          isRequired: field.isRequired,
        })),
      ),
    onSuccess: (data) => {
      queryClient.setQueryData(FieldManagementQueryKey, (current: { modules: FieldManagementModule[] } | undefined) => ({
        modules: (current?.modules ?? []).map((module) => (module.id === data.module.id ? data.module : module)),
      }));
      setFields(sortFieldsByLabel(data.module.fields));
      setDirty(false);
      toast.success("Field settings saved");
    },
    onError: () => toast.error("Could not save field settings."),
  });

  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table owns table state handlers.
  const table = useReactTable({
    data: headerFields,
    columns,
    state: {
      pagination,
      sorting,
    },
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  function updateField(fieldId: number, patch: Partial<EditableField>) {
    setFields((current) =>
      current.map((field) => {
        if (field.id !== fieldId) return field;
        const next = { ...field, ...patch };
        if (!next.isVisible) next.isRequired = false;
        return next;
      }),
    );
    setDirty(true);
  }

  function resetFields() {
    if (!selectedModule) return;
    setFields(sortFieldsByLabel(selectedModule.fields));
    setDirty(false);
  }

  function selectModule(moduleId: number) {
    if (moduleId === selectedModule?.id) return;
    setSelectedModuleId(moduleId);
    const nextModule = modules.find((item) => item.id === moduleId);
    setFields(sortFieldsByLabel(nextModule?.fields ?? []));
    setDirty(false);
    table.setPageIndex(0);
  }

  return {
    dirty,
    error: query.error,
    filteredModules,
    headerFields,
    isEmpty: !query.isLoading && !query.isError && modules.length === 0,
    isError: query.isError,
    isLoading: query.isLoading,
    moduleQuery,
    modules,
    requiredCount,
    resetFields,
    save,
    selectedModule,
    selectModule,
    setModuleQuery,
    table,
    updateField,
    visibleCount,
  };
}

function createFieldManagementColumn(key: keyof EditableField, header: string, className: string): ColumnDef<EditableField> {
  return {
    accessorKey: key,
    header,
    sortingFn: "alphanumeric",
    meta: { className },
  };
}

function sortFieldsByLabel(fields: EditableField[]) {
  return [...fields].sort((firstField, secondField) => {
    const labelCompare = firstField.label.localeCompare(secondField.label, undefined, {
      sensitivity: "base",
    });

    if (labelCompare !== 0) return labelCompare;
    return firstField.fieldKey.localeCompare(secondField.fieldKey, undefined, {
      sensitivity: "base",
    });
  });
}

export function isHeaderField(field: EditableField) {
  const sourcePath = (field.sourcePath ?? "").toLowerCase();

  if (isIgnoredFieldManagementLabel(field)) {
    return false;
  }

  if (isHeaderFieldSource(sourcePath)) {
    return true;
  }

  if (sourcePath === "fallback") {
    return true;
  }

  return false;
}

function isHeaderFieldSource(sourcePath: string) {
  return (
    sourcePath.includes("formpage") ||
    sourcePath.includes("form.tsx") ||
    sourcePath.includes("fields.tsx") ||
    sourcePath.includes("details") ||
    sourcePath.includes("controls") ||
    sourcePath.includes("drawer") ||
    sourcePath.includes("dialog")
  );
}

function isIgnoredFieldManagementLabel(field: EditableField) {
  const sourcePath = (field.sourcePath ?? "").toLowerCase();
  const fieldKey = field.fieldKey.toLowerCase();
  const label = field.label.trim().toLowerCase();

  if (!label) return true;

  if (isAccountingEntryField(sourcePath, fieldKey, label)) {
    return true;
  }

  if (
    sourcePath.includes("report") ||
    sourcePath.includes("pdf") ||
    sourcePath.includes("preview") ||
    sourcePath.includes("listpage") ||
    sourcePath.includes("tablepage") ||
    sourcePath.includes("tablerow") ||
    sourcePath.includes("recordactions") ||
    sourcePath.includes("notfound")
  ) {
    return true;
  }

  if (
    /^(add|clear|copy|delete|edit|export|import|open|preview|remove|reset|save|search|select|view)\b/.test(label) ||
    /^(add|clear|copy|delete|edit|export|import|open|preview|remove|reset|save|search|select|view)_/.test(fieldKey)
  ) {
    return true;
  }

  if (
    label.includes("details") ||
    label.includes("entries") ||
    label.includes("breakdown") ||
    label.includes("actions") ||
    label.includes("search ") ||
    label.includes("select ")
  ) {
    return true;
  }

  return false;
}

function isAccountingEntryField(sourcePath: string, fieldKey: string, label: string) {
  const combinedText = [sourcePath, fieldKey, label].join(" ");

  return (
    sourcePath.includes("accounting-grid") ||
    sourcePath.includes("accountingtable") ||
    sourcePath.includes("accounting-entry") ||
    sourcePath.includes("accountingentry") ||
    sourcePath.includes("accountinggrid") ||
    /\b(account code|account title|debit|credit|ewt|ewt amount|vat input|vat output|tax amount)\b/.test(combinedText)
  );
}
