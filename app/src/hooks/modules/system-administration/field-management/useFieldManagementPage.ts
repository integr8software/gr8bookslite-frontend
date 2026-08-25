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
export const FieldManagementTabIds = {
  header: "header",
  entries: "entries",
} as const;
export const FieldManagementTabs = [
  { id: FieldManagementTabIds.header, label: "Header Fields" },
  { id: FieldManagementTabIds.entries, label: "Entry Fields" },
] as const;

export type EditableField = FieldManagementField;
export type FieldManagementTabId = (typeof FieldManagementTabs)[number]["id"];

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
  const [activeTab, setActiveTab] = useState<FieldManagementTabId>(FieldManagementTabIds.header);
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

  const manageableFields = useMemo(() => fields.filter((field) => getFieldManagementTabId(field)), [fields]);
  const visibleCount = manageableFields.filter((field) => field.isVisible).length;
  const requiredCount = manageableFields.filter((field) => field.isRequired).length;
  const headerFields = useMemo(() => fields.filter((field) => getFieldManagementTabId(field) === FieldManagementTabIds.header), [fields]);
  const entryFields = useMemo(() => fields.filter((field) => getFieldManagementTabId(field) === FieldManagementTabIds.entries), [fields]);
  const activeFields = activeTab === FieldManagementTabIds.entries ? entryFields : headerFields;
  const activeTabLabel = FieldManagementTabs.find((tab) => tab.id === activeTab)?.label ?? "Fields";
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
    data: activeFields,
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
    setActiveTab(FieldManagementTabIds.header);
    setDirty(false);
    table.setPageIndex(0);
  }

  function selectTab(tabId: FieldManagementTabId) {
    setActiveTab(tabId);
    table.setPageIndex(0);
  }

  return {
    activeTab,
    activeTabLabel,
    dirty,
    entryFields,
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
    selectTab,
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

export function getFieldManagementTabId(field: EditableField): FieldManagementTabId | null {
  const sourcePath = (field.sourcePath ?? "").toLowerCase();
  const fieldKey = field.fieldKey.toLowerCase();
  const label = field.label.toLowerCase();
  const combinedText = [sourcePath, fieldKey, label].join(" ");

  if (isIgnoredFieldManagementLabel(field)) {
    return null;
  }

  if (
    /\b(entries?|entry|line|lines|item-entry|account-entry|data-entry)\b/.test(combinedText) ||
    sourcePath.includes("accounting-grid") ||
    sourcePath.includes("accountingtable") ||
    sourcePath.includes("expensetable") ||
    sourcePath.includes("itementry") ||
    sourcePath.includes("accountentry") ||
    sourcePath.includes("module-data-entry") ||
    sourcePath.includes("#column-labels")
  ) {
    return FieldManagementTabIds.entries;
  }

  if (isHeaderFieldSource(sourcePath)) {
    return FieldManagementTabIds.header;
  }

  if (sourcePath === "fallback") {
    return FieldManagementTabIds.header;
  }

  return null;
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
