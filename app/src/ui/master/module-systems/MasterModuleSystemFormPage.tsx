"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ListTree, Save } from "lucide-react";
import { type MasterModuleSystem } from "@/app/src/services/master/module-systems/MasterModuleSystemApi";
import {
  MasterModuleSystemsHref,
  getMasterModuleSystemSidebarHref,
} from "@/app/src/constants/master/module-systems/MasterModuleSystemConstants";
import {
  MasterModuleSystemStatuses,
  useMasterModuleSystemFormPage,
  type MasterModuleSystemDraft,
} from "@/app/src/hooks/master/module-systems/useMasterModuleSystemFormPage";
import { ModuleHeader, moduleHeaderActionClassNames } from "@/app/src/ui/shared/module/ModuleHeader";
import { AppSkeleton } from "@/app/src/ui/shared/app/AppSkeleton";
import { ModuleNotFound } from "@/app/src/ui/shared/module/ModuleNotFound";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";
import { ModuleSystemPageSkeleton } from "@/app/src/ui/master/module-systems/ModuleSystemPageSkeleton";
import { ModuleFieldRequiredMark } from "@/app/src/ui/shared/field-management/ModuleFieldRequiredMark";

const ControlClassName =
  "h-10 w-full rounded-lg border border-darknavy/10 bg-white px-3 text-sm font-semibold text-darknavy shadow-sm transition placeholder:text-darknavy/35 focus:border-skyblue focus:outline-none focus:ring-4 focus:ring-skyblue/15";

export function MasterModuleSystemFormPage({ mode, recordId }: { mode: "add" | "edit"; recordId?: string }) {
  const {
    effectiveMetadataDraft,
    effectiveModuleDraft,
    isRecordLoading,
    modules,
    modulesQuery,
    record,
    saveMutation,
    toggleModule,
    toggleModules,
    updateMetadataDraft,
  } = useMasterModuleSystemFormPage({ mode, recordId });

  if (isRecordLoading) {
    return <ModuleSystemPageSkeleton />;
  }

  if (mode === "edit" && !record) {
    return (
      <ModuleNotFound
        title="System not found"
        description="The selected module system is not available in the master system list."
        actionHref={MasterModuleSystemsHref}
        actionLabel="Back to systems"
      />
    );
  }

  return (
    <section className="grid gap-5">
      <ModuleHeader
        variant="card"
        titleAs="h1"
        eyebrow="Master"
        title={mode === "add" ? "Add System" : `Edit ${record?.name ?? "System"}`}
        description="Maintain the system identity and module assignments used by plans and sidebar templates."
        actions={
          <>
            <Link href={MasterModuleSystemsHref} className={moduleHeaderActionClassNames.secondary}>
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back
            </Link>
            {record ? (
              <Link href={getMasterModuleSystemSidebarHref(record.id)} className={moduleHeaderActionClassNames.secondary}>
                <ListTree className="h-4 w-4" aria-hidden="true" />
                Configure Sidebar
              </Link>
            ) : null}
            <button
              type="button"
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending}
              className={moduleHeaderActionClassNames.primary}
            >
              <Save className="h-4 w-4" aria-hidden="true" />
              {saveMutation.isPending ? "Saving..." : "Save"}
            </button>
          </>
        }
      />
      <div className="grid gap-5 xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
        <SystemDetailsPanel
          draft={effectiveMetadataDraft}
          onUpdate={updateMetadataDraft}
        />
        <AssignedModulesPanel
          isLoading={modulesQuery.isLoading}
          moduleDraft={effectiveModuleDraft}
          modules={modules}
          onToggle={toggleModule}
          onToggleMany={toggleModules}
        />
      </div>
    </section>
  );
}

function SystemDetailsPanel({
  draft,
  onUpdate,
}: {
  draft: MasterModuleSystemDraft;
  onUpdate: (draft: MasterModuleSystemDraft) => void;
}) {
  return (
    <section className="grid content-start gap-4 rounded-lg border border-darknavy/10 bg-white p-4 shadow-sm">
      <div>
        <h2 className="text-base font-semibold text-darknavy">System Details</h2>
        <p className="mt-1 text-sm text-darknavy/52">Set the master-maintained identity for this module system.</p>
      </div>
      <div>
        <TextField isRequired label="Name" value={draft.name} onChange={(name) => onUpdate({ ...draft, name })} />
      </div>
      <label className="grid gap-1.5 text-sm font-semibold text-darknavy/58">
        Description
        <textarea
          value={draft.description}
          onChange={(event) => onUpdate({ ...draft, description: event.target.value })}
          rows={6}
          className={joinClasses(ControlClassName, "h-auto py-3")}
        />
      </label>
      <div className="grid gap-3 md:grid-cols-2">
        <label className="grid gap-1.5 text-sm font-semibold text-darknavy/58">
          Order
          <input
            type="number"
            min={0}
            value={draft.sortOrder}
            onChange={(event) =>
              onUpdate({
                ...draft,
                sortOrder: Math.max(0, Number(event.target.value) || 0),
              })
            }
            className={ControlClassName}
          />
        </label>
        <label className="grid gap-1.5 text-sm font-semibold text-darknavy/58">
          Status
          <select
            value={draft.status}
            onChange={(event) =>
              onUpdate({
                ...draft,
                status: event.target.value as MasterModuleSystemDraft["status"],
              })
            }
            className={ControlClassName}
          >
            <option value={MasterModuleSystemStatuses.active}>{MasterModuleSystemStatuses.active}</option>
            <option value={MasterModuleSystemStatuses.inactive}>{MasterModuleSystemStatuses.inactive}</option>
            <option value={MasterModuleSystemStatuses.draft}>{MasterModuleSystemStatuses.draft}</option>
          </select>
        </label>
      </div>
    </section>
  );
}

function AssignedModulesPanel({
  isLoading,
  moduleDraft,
  modules,
  onToggle,
  onToggleMany,
}: {
  isLoading: boolean;
  moduleDraft: Set<string>;
  modules: MasterModuleSystem["modules"];
  onToggle: (moduleCode: string) => void;
  onToggleMany: (moduleCodes: string[], shouldSelect: boolean) => void;
}) {
  const [query, setQuery] = useState("");
  const filteredModules = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return modules;
    return modules.filter((module) => [module.name, module.code, module.description].join(" ").toLowerCase().includes(normalizedQuery));
  }, [modules, query]);
  const filteredModuleCodes = filteredModules.map((module) => module.code);
  const selectedFilteredCount = filteredModuleCodes.filter((moduleCode) => moduleDraft.has(moduleCode)).length;
  const hasFilteredModules = filteredModuleCodes.length > 0;
  const isFilteredSelectionComplete = hasFilteredModules && selectedFilteredCount === filteredModuleCodes.length;

  return (
    <section className="grid content-start gap-4 rounded-lg border border-darknavy/10 bg-white p-4 shadow-sm">
      <div>
        <h2 className="text-base font-semibold text-darknavy">Assigned Modules</h2>
        <p className="mt-1 text-sm text-darknavy/52">{moduleDraft.size} modules selected for this system.</p>
      </div>
      {isLoading ? (
        <AppSkeleton className="h-10 w-full rounded-lg" />
      ) : (
        <label className="relative block min-w-0">
          <span className="sr-only">Search modules</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search modules"
            className={ControlClassName}
          />
        </label>
      )}
      <div className="min-h-[18rem] max-h-[34rem] overflow-y-auto rounded-lg border border-darknavy/10">
        {isLoading ? (
          <AssignedModulesSkeleton />
        ) : hasFilteredModules ? (
          <label className="grid cursor-pointer grid-cols-[1.25rem_minmax(0,1fr)] gap-3 border-b border-darknavy/8 bg-offwhite/55 px-4 py-3 hover:bg-skyblue/8">
            <input
              type="checkbox"
              checked={isFilteredSelectionComplete}
              onChange={(event) => onToggleMany(filteredModuleCodes, event.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-darknavy/20 text-skyblue focus:ring-skyblue/20"
            />
            <span className="text-sm font-semibold text-darknavy">
              {query.trim() ? "Select all matching modules" : "Select all modules"}
            </span>
          </label>
        ) : null}
        {filteredModules.map((module) => (
          <label
            key={module.code}
            className="grid cursor-pointer grid-cols-[1.25rem_minmax(0,1fr)_auto] gap-3 border-b border-darknavy/6 px-4 py-3 last:border-b-0 hover:bg-skyblue/8"
          >
            <input
              type="checkbox"
              checked={moduleDraft.has(module.code)}
              onChange={() => onToggle(module.code)}
              className="mt-0.5 h-4 w-4 rounded border-darknavy/20 text-skyblue focus:ring-skyblue/20"
            />
            <span className="min-w-0">
              <span className="block text-sm font-semibold text-darknavy">{module.name}</span>
              <span className="mt-0.5 block text-xs font-medium text-darknavy/48">{module.description || module.code}</span>
            </span>
            <span className="text-xs font-bold text-darknavy/38">{module.code}</span>
          </label>
        ))}
        {!isLoading && filteredModules.length === 0 ? (
          <div className="grid min-h-[18rem] place-items-center px-4 py-6 text-center">
            <p className="text-sm font-semibold text-darknavy/52">No modules available</p>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function AssignedModulesSkeleton() {
  return (
    <div className="grid gap-0">
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={index} className="grid grid-cols-[1.25rem_minmax(0,1fr)_4rem] gap-3 border-b border-darknavy/6 px-4 py-3 last:border-b-0">
          <AppSkeleton className="mt-0.5 h-4 w-4 rounded" />
          <div className="grid gap-2">
            <AppSkeleton className="h-4 w-2/3 rounded" />
            <AppSkeleton className="h-3 w-full max-w-sm rounded" />
          </div>
          <AppSkeleton className="h-3 w-14 rounded" />
        </div>
      ))}
    </div>
  );
}

function TextField({
  isRequired = false,
  label,
  value,
  onChange,
}: {
  isRequired?: boolean;
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-1.5 text-sm font-semibold text-darknavy/58">
      <span>
        {label}
        <ModuleFieldRequiredMark className="text-coralpink" fallbackRequired={isRequired} label={label} leadingSpace />
      </span>
      <input value={value} onChange={(event) => onChange(event.target.value)} className={ControlClassName} />
    </label>
  );
}
