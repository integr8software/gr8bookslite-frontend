"use client";

import { Check, Eye, EyeOff, RotateCcw, Save, Search, Settings2 } from "lucide-react";
import {
  FieldManagementTablePaginationStorageKey,
  isHeaderField,
  useFieldManagementPage,
  type EditableField,
} from "@/app/src/hooks/modules/system-administration/field-management/useFieldManagementPage";
import { joinClasses } from "@/app/src/ui/shared/main-layout/utils";
import { ModuleHeader, moduleHeaderActionClassNames } from "@/app/src/ui/shared/module/ModuleHeader";
import { ModuleTable } from "@/app/src/ui/shared/module/module-table/ModuleTable";

export function FieldManagementPage() {
  const {
    dirty,
    error,
    filteredModules,
    headerFields,
    isEmpty,
    isError,
    isLoading,
    moduleQuery,
    requiredCount,
    resetFields,
    save,
    selectedModule,
    selectModule,
    setModuleQuery,
    table,
    updateField,
    visibleCount,
  } = useFieldManagementPage();

  if (isLoading) {
    return <PanelMessage>Loading field settings...</PanelMessage>;
  }

  if (isError) {
    return <PanelMessage>{error instanceof Error ? error.message : "Could not load field settings."}</PanelMessage>;
  }

  if (isEmpty) {
    return <PanelMessage>No field-management modules available.</PanelMessage>;
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
              onClick={resetFields}
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
                  {module.fields.filter(isHeaderField).length}
                </span>
              </button>
            ))}
          </div>
        </aside>

        <section className="min-h-0 overflow-hidden">
          <ModuleTable
            emptyDescription="No header fields were discovered for this module."
            emptyIcon={<Search className="h-5 w-5" aria-hidden="true" />}
            emptyTitle="No header fields found"
            enableColumnReorder={false}
            maxHeightClassName="max-h-[calc(100vh-21rem)]"
            minWidthClassName="min-w-[48rem]"
            pageSizeOptions={[10, 15, 25, 50]}
            paginationLabel="fields"
            paginationStorageKey={FieldManagementTablePaginationStorageKey}
            table={table}
            tableTitle={`${selectedModule.name} header fields`}
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
