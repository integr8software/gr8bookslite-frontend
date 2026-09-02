"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
	cloneSidebar,
	ensureAssignedModuleLinks,
	normalizeSidebarTree,
} from "@/app/src/data/master/module-systems/MasterModuleSystemSidebarData";
import { useMasterModuleSystemsQuery } from "@/app/src/hooks/master/module-systems/useMasterModuleSystemsQuery";
import {
	getMasterModuleSystemSidebar,
	saveMasterModuleSystemSidebar,
	type MasterModuleSystemSidebarItem,
} from "@/app/src/services/master/module-systems/MasterModuleSystemApi";
import { MasterModuleSystemQueryKeys } from "@/app/src/services/master/module-systems/MasterModuleSystemQueryKeys";

export function useMasterModuleSystemSidebarPage(recordId: string | number) {
	const queryClient = useQueryClient();
	const systemsQuery = useMasterModuleSystemsQuery();
	const record = useMemo(
		() =>
			systemsQuery.data?.systems.find(
				(candidate) => String(candidate.id) === String(recordId),
			) ?? null,
		[recordId, systemsQuery.data],
	);

	const sidebarQuery = useQuery({
		enabled: Boolean(record?.id),
		queryFn: () => {
			if (!record?.id) {
				return { fallbackSidebar: [], sidebar: [] };
			}
			return getMasterModuleSystemSidebar(record.id);
		},
		queryKey: record?.id
			? MasterModuleSystemQueryKeys.sidebar(record.id)
			: ["master-module-systems", "sidebar", "empty"],
	});

	const [sidebarDraft, setSidebarDraft] = useState<
		MasterModuleSystemSidebarItem[]
	>([]);
	const [isSidebarDraftDirty, setIsSidebarDraftDirty] = useState(false);

	const initialSidebarDraft = useMemo(() => {
		if (!record) return [];
		const configuredSidebar =
			(sidebarQuery.data?.sidebar.length ?? 0) > 0
				? (sidebarQuery.data?.sidebar ?? [])
				: record.sidebar.length > 0
				? record.sidebar
				: (sidebarQuery.data?.fallbackSidebar ?? []);
		return normalizeSidebarTree(
			ensureAssignedModuleLinks(cloneSidebar(configuredSidebar), record.modules),
		);
	}, [record, sidebarQuery.data]);

	const effectiveSidebarDraft = isSidebarDraftDirty
		? sidebarDraft
		: initialSidebarDraft;

	const saveSidebarMutation = useMutation({
		mutationFn: async () => {
			if (!record) throw new Error("System not found.");
			return saveMasterModuleSystemSidebar(
				record.id,
				normalizeSidebarTree(effectiveSidebarDraft),
			);
		},
		onSuccess: async () => {
			if (record) {
				await queryClient.invalidateQueries({
					queryKey: MasterModuleSystemQueryKeys.sidebar(record.id),
				});
			}
			await queryClient.invalidateQueries({
				queryKey: MasterModuleSystemQueryKeys.lists(),
			});
			toast.success("System sidebar template saved.");
		},
		onError: (error: Error) => toast.error(error.message),
	});

	function updateDraft(items: MasterModuleSystemSidebarItem[]) {
		setIsSidebarDraftDirty(true);
		setSidebarDraft(items);
	}

	function resetDraft() {
		setIsSidebarDraftDirty(false);
		setSidebarDraft(initialSidebarDraft);
	}

	return {
		effectiveSidebarDraft,
		fallbackSidebar: sidebarQuery.data?.fallbackSidebar ?? [],
		initialSidebarDraft,
		isLoading: systemsQuery.isLoading || sidebarQuery.isLoading,
		isSaving: saveSidebarMutation.isPending,
		record,
		resetDraft,
		saveDraft: () => saveSidebarMutation.mutate(),
		updateDraft,
	};
}
