"use client";

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
import { Check, Eye, EyeOff, RotateCcw, Save, Search, Settings2 } from "lucide-react";
import toast from "react-hot-toast";
import {
  GetFieldManagementBootstrap,
  SaveFieldManagementModuleFields,
  type FieldManagementField,
  type FieldManagementModule,
} from "@/app/src/services/modules/system-administration/field-management/FieldManagementApi";
import { joinClasses } from "@/app/src/ui/shared/main-layout/utils";
import { ModuleHeader, moduleHeaderActionClassNames } from "@/app/src/ui/shared/module/ModuleHeader";
import { ModuleTable } from "@/app/src/ui/shared/module/module-table/ModuleTable";

const QueryKey = ["system-administration", "field-management"];
const FieldManagementTablePaginationStorageKey = "system-administration-field-management";
const FieldManagementTabs = [
  { id: "header", label: "Header Fields" },
  { id: "entries", label: "Entry Fields" },
] as const;

type EditableField = FieldManagementField;
type FieldManagementTabId = (typeof FieldManagementTabs)[number]["id"];

export function FieldManagementPage() {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: QueryKey,
    queryFn: GetFieldManagementBootstrap,
  });
  const modules = useMemo(() => query.data?.modules ?? [], [query.data?.modules]);
  const [moduleQuery, setModuleQuery] = useState("");
  const [selectedModuleId, setSelectedModuleId] = useState<number | null>(null);
  const selectedModule = modules.find((module) => module.id === selectedModuleId) ?? modules[0];
  const [fields, setFields] = useState<EditableField[]>([]);
  const [activeTab, setActiveTab] = useState<FieldManagementTabId>("header");
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
  const headerFields = useMemo(() => fields.filter((field) => getFieldManagementTabId(field) === "header"), [fields]);
  const entryFields = useMemo(() => fields.filter((field) => getFieldManagementTabId(field) === "entries"), [fields]);
  const activeFields = activeTab === "entries" ? entryFields : headerFields;
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
      queryClient.setQueryData(QueryKey, (current: { modules: FieldManagementModule[] } | undefined) => ({
        modules: (current?.modules ?? []).map((module) => (module.id === data.module.id ? data.module : module)),
      }));
      setFields(sortFieldsByLabel(data.module.fields));
      setDirty(false);
      toast.success("Field settings saved");
    },
    onError: () => toast.error("Could not save field settings."),
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

  function selectModule(moduleId: number) {
    if (moduleId === selectedModule?.id) return;
    setSelectedModuleId(moduleId);
    const nextModule = modules.find((item) => item.id === moduleId);
    setFields(sortFieldsByLabel(nextModule?.fields ?? []));
    setActiveTab("header");
    setDirty(false);
    table.setPageIndex(0);
  }

  function selectTab(tabId: FieldManagementTabId) {
    setActiveTab(tabId);
    table.setPageIndex(0);
  }

  if (query.isLoading) {
    return <PanelMessage>Loading field settings...</PanelMessage>;
  }

  if (!selectedModule) {
    return <PanelMessage>No modules available.</PanelMessage>;
  }

  return (
    <section className="grid h-[calc(100vh-4rem)] min-h-0 gap-5 overflow-hidden text-darknavy">
      <ModuleHeader
        variant="panel"
        title="Field Management"
        titleAs="h1"
        description={`${selectedModule.name} fields, ${visibleCount} visible, ${requiredCount} required.`}
        actions={
          <>
            <button
              type="button"
              disabled={!dirty}
              className={joinClasses(moduleHeaderActionClassNames.secondary, "disabled:cursor-not-allowed disabled:opacity-50")}
              onClick={() => {
                setFields(sortFieldsByLabel(selectedModule.fields));
                setDirty(false);
              }}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
            <button
              type="button"
              disabled={!dirty || save.isPending}
              className={joinClasses(moduleHeaderActionClassNames.primary, "disabled:cursor-not-allowed disabled:opacity-50")}
              onClick={() => save.mutate()}
            >
              <Save className="h-4 w-4" aria-hidden="true" />
              Save
            </button>
          </>
        }
      />

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 overflow-hidden xl:grid-cols-[320px_minmax(520px,1fr)]">
        <aside className="flex min-h-0 flex-col overflow-hidden rounded-lg border border-darknavy/10 bg-white shadow-sm shadow-darknavy/5">
          <div className="border-b border-darknavy/10 p-4">
            <div className="flex h-10 items-center gap-2 rounded-md border border-darknavy/10 px-3">
              <Search className="h-4 w-4 shrink-0 text-darknavy/35" />
              <input
                value={moduleQuery}
                onChange={(event) => setModuleQuery(event.target.value)}
                className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-darknavy/35"
                placeholder="Search modules"
              />
            </div>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto p-2">
            {filteredModules.map((module) => (
              <button
                key={module.id}
                type="button"
                className={joinClasses(
                  "flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left transition",
                  module.id === selectedModule.id
                    ? "bg-skyblue/10 text-skyblue"
                    : "text-darknavy/70 hover:bg-darknavy/[0.035] hover:text-darknavy",
                )}
                onClick={() => selectModule(module.id)}
              >
                <Settings2 className="h-4 w-4 shrink-0" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold">{module.name}</span>
                  <span className="block text-xs text-darknavy/40">{module.code}</span>
                </span>
                <span className="rounded bg-darknavy/5 px-2 py-1 text-xs font-semibold text-darknavy/45">
                  {module.fields.filter((field) => getFieldManagementTabId(field)).length}
                </span>
              </button>
            ))}
          </div>
        </aside>

        <section className="min-h-0 overflow-hidden">
          <div className="mb-3 flex flex-wrap items-center gap-2 rounded-lg border border-darknavy/10 bg-white p-2 shadow-sm shadow-darknavy/5">
            {FieldManagementTabs.map((tab) => {
              const tabFields = tab.id === "entries" ? entryFields : headerFields;
              const isActive = tab.id === activeTab;

              return (
                <button
                  key={tab.id}
                  type="button"
                  className={joinClasses(
                    "inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm font-semibold transition",
                    isActive ? "bg-skyblue/10 text-skyblue" : "text-darknavy/55 hover:bg-darknavy/[0.035] hover:text-darknavy",
                  )}
                  onClick={() => selectTab(tab.id)}
                >
                  {tab.label}
                  <span
                    className={joinClasses(
                      "rounded px-2 py-0.5 text-xs font-semibold",
                      isActive ? "bg-skyblue/12 text-skyblue" : "bg-darknavy/5 text-darknavy/45",
                    )}
                  >
                    {tabFields.length}
                  </span>
                </button>
              );
            })}
          </div>
          <ModuleTable
            emptyDescription={
              activeTab === "entries"
                ? "No entry table fields were discovered for this module."
                : "No header fields were discovered for this module."
            }
            emptyIcon={<Search className="h-5 w-5" aria-hidden="true" />}
            emptyTitle={`No ${activeTabLabel.toLowerCase()} found`}
            enableColumnReorder={false}
            maxHeightClassName="max-h-[calc(100vh-21rem)]"
            minWidthClassName="min-w-[48rem]"
            pageSizeOptions={[10, 15, 25, 50]}
            paginationLabel="fields"
            paginationStorageKey={FieldManagementTablePaginationStorageKey}
            table={table}
            tableTitle={`${selectedModule.name} ${activeTabLabel.toLowerCase()}`}
            renderRow={({ id, original }) => <FieldManagementTableRow key={id} field={original} onUpdateField={updateField} />}
          />
        </section>
      </div>
    </section>
  );
}

function FieldManagementTableRow({
  field,
  onUpdateField,
}: {
  field: EditableField;
  onUpdateField: (fieldId: number, patch: Partial<EditableField>) => void;
}) {
  return (
    <tr>
      <td>
        <div className="min-w-0">
          <p className="truncate font-semibold text-darknavy">{field.label}</p>
          <p className="mt-1 truncate text-xs text-darknavy/40">{field.fieldKey}</p>
        </div>
      </td>
      <td className="text-xs font-medium text-darknavy/50">{field.fieldType ?? "text"}</td>
      <td className="text-center">
        <ToggleButton
          active={field.isVisible}
          activeLabel="Visible"
          inactiveLabel="Hidden"
          onClick={() => onUpdateField(field.id, { isVisible: !field.isVisible })}
        />
      </td>
      <td className="text-center">
        <ToggleButton
          active={field.isRequired}
          activeLabel="Required"
          disabled={!field.isVisible}
          inactiveLabel="Optional"
          onClick={() => onUpdateField(field.id, { isRequired: !field.isRequired })}
        />
      </td>
    </tr>
  );
}

function ToggleButton({
  active,
  activeLabel,
  disabled,
  inactiveLabel,
  onClick,
}: {
  active: boolean;
  activeLabel: string;
  disabled?: boolean;
  inactiveLabel: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      className={joinClasses(
        "inline-flex h-8 w-fit items-center gap-2 rounded-md border px-3 text-xs font-semibold transition disabled:opacity-35",
        active ? "border-skyblue/20 bg-skyblue/10 text-skyblue" : "border-darknavy/10 bg-white text-darknavy/45 hover:bg-darknavy/5",
      )}
      onClick={onClick}
    >
      {active ? <Check className="h-3.5 w-3.5" /> : disabled ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
      {active ? activeLabel : inactiveLabel}
    </button>
  );
}

function PanelMessage({ children }: { children: string }) {
  return <div className="p-8 text-sm text-darknavy/65">{children}</div>;
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

function getFieldManagementTabId(field: EditableField): FieldManagementTabId | null {
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
    return "entries";
  }

  if (isHeaderFieldSource(sourcePath)) {
    return "header";
  }

  if (sourcePath === "fallback") {
    return "header";
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
