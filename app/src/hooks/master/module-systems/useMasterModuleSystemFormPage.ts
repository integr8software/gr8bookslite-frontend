import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  createMasterModuleSystem,
  saveMasterModuleSystemModules,
  updateMasterModuleSystem,
} from "@/app/src/services/master/module-systems/MasterModuleSystemApi";
import { getMasterModuleSystemEditHref } from "@/app/src/constants/master/module-systems/MasterModuleSystemConstants";
import { MasterModuleSystemQueryKeys } from "@/app/src/services/master/module-systems/MasterModuleSystemQueryKeys";
import { useMasterModuleSystemListPage } from "@/app/src/hooks/master/module-systems/useMasterModuleSystemListPage";
import { useMasterModuleSystemModulesQuery } from "@/app/src/hooks/master/module-systems/useMasterModuleSystemsQuery";

export const MasterModuleSystemStatuses = {
  active: "Active",
  inactive: "Inactive",
  draft: "Draft",
} as const;

export type MasterModuleSystemStatus = (typeof MasterModuleSystemStatuses)[keyof typeof MasterModuleSystemStatuses];

export type MasterModuleSystemDraft = {
  code: string;
  name: string;
  description: string;
  sortOrder: number;
  status: MasterModuleSystemStatus;
};

export const EmptyMasterModuleSystemDraft: MasterModuleSystemDraft = {
  code: "",
  name: "",
  description: "",
  sortOrder: 0,
  status: MasterModuleSystemStatuses.active,
};

export function useMasterModuleSystemFormPage({ mode, recordId }: { mode: "add" | "edit"; recordId?: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const systemsQuery = useMasterModuleSystemListPage();
  const modulesQuery = useMasterModuleSystemModulesQuery();
  const modules = modulesQuery.data?.modules ?? [];
  const record = useMemo(
    () => (recordId ? systemsQuery.records.find((candidate) => candidate.id === Number(recordId)) : null),
    [recordId, systemsQuery.records],
  );
  const [metadataDraft, setMetadataDraft] = useState<MasterModuleSystemDraft>(EmptyMasterModuleSystemDraft);
  const [moduleDraft, setModuleDraft] = useState<Set<string>>(new Set());
  const [isMetadataDirty, setIsMetadataDirty] = useState(false);
  const [isModuleDraftDirty, setIsModuleDraftDirty] = useState(false);
  const initialMetadataDraft = useMemo<MasterModuleSystemDraft>(
    () =>
      mode === "edit" && record
        ? {
            code: record.code,
            name: record.name,
            description: record.description,
            sortOrder: record.sortOrder,
            status: record.isActive ? MasterModuleSystemStatuses.active : MasterModuleSystemStatuses.inactive,
          }
        : EmptyMasterModuleSystemDraft,
    [mode, record],
  );
  const initialModuleDraft = useMemo(
    () => (mode === "edit" && record ? new Set(record.modules.map((module) => module.code)) : new Set<string>()),
    [mode, record],
  );
  const effectiveMetadataDraft = isMetadataDirty ? metadataDraft : initialMetadataDraft;
  const effectiveModuleDraft = isModuleDraftDirty ? moduleDraft : initialModuleDraft;

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!effectiveMetadataDraft.code.trim() || !effectiveMetadataDraft.name.trim()) {
        throw new Error("System code and name are required.");
      }

      if (mode === "add") {
        const created = await createMasterModuleSystem({
          code: effectiveMetadataDraft.code,
          name: effectiveMetadataDraft.name,
          description: effectiveMetadataDraft.description || null,
          sortOrder: Math.max(0, effectiveMetadataDraft.sortOrder),
          isActive: effectiveMetadataDraft.status === MasterModuleSystemStatuses.active,
        });
        if (effectiveModuleDraft.size > 0) {
          await saveMasterModuleSystemModules(created.system.id, Array.from(effectiveModuleDraft));
        }
        return created.system;
      }

      if (!record) throw new Error("System not found.");
      await updateMasterModuleSystem(record.id, {
        code: effectiveMetadataDraft.code,
        name: effectiveMetadataDraft.name,
        description: effectiveMetadataDraft.description || null,
        sortOrder: Math.max(0, effectiveMetadataDraft.sortOrder),
        isActive: effectiveMetadataDraft.status === MasterModuleSystemStatuses.active,
      });
      await saveMasterModuleSystemModules(record.id, Array.from(effectiveModuleDraft));
      return record;
    },
    onSuccess: async (system) => {
      await queryClient.invalidateQueries({
        queryKey: MasterModuleSystemQueryKeys.lists(),
      });
      toast.success(mode === "add" ? "System created." : "System saved.");
      router.push(getMasterModuleSystemEditHref(system.id));
    },
    onError: (error: Error) => toast.error(error.message),
  });

  function updateMetadataDraft(draft: MasterModuleSystemDraft) {
    setIsMetadataDirty(true);
    setMetadataDraft(draft);
  }

  function toggleModule(moduleCode: string) {
    setIsModuleDraftDirty(true);
    setModuleDraft((current) => {
      const next = new Set(isModuleDraftDirty ? current : initialModuleDraft);
      if (next.has(moduleCode)) next.delete(moduleCode);
      else next.add(moduleCode);
      return next;
    });
  }

  function toggleModules(moduleCodes: string[], shouldSelect: boolean) {
    setIsModuleDraftDirty(true);
    setModuleDraft((current) => {
      const next = new Set(isModuleDraftDirty ? current : initialModuleDraft);
      for (const moduleCode of moduleCodes) {
        if (shouldSelect) next.add(moduleCode);
        else next.delete(moduleCode);
      }
      return next;
    });
  }

  return {
    effectiveMetadataDraft,
    effectiveModuleDraft,
    isRecordLoading: mode === "edit" && systemsQuery.isLoading,
    modules,
    modulesQuery,
    record,
    saveMutation,
    toggleModule,
    toggleModules,
    updateMetadataDraft,
  };
}
