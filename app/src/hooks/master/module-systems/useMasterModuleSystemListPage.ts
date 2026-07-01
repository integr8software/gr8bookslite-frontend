"use client";

import { useMemo, useState } from "react";
import {
	getCoreRowModel,
	getPaginationRowModel,
	useReactTable,
	type ColumnDef,
	type PaginationState,
} from "@tanstack/react-table";
import toast from "react-hot-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
	updateMasterModuleSystemStatus,
	type MasterModuleSystem,
} from "@/app/src/services/master/module-systems/MasterModuleSystemApi";
import { MasterModuleSystemQueryKeys } from "@/app/src/services/master/module-systems/MasterModuleSystemQueryKeys";
import { useMasterModuleSystemsQuery } from "@/app/src/hooks/master/module-systems/useMasterModuleSystemsQuery";

const InitialPagination: PaginationState = {
	pageIndex: 0,
	pageSize: 10,
};

type StatusFilter = "ALL" | "ACTIVE" | "INACTIVE";

const ModuleSystemColumns: ColumnDef<MasterModuleSystem>[] = [
	{
		accessorKey: "name",
		header: "System Name",
		enableSorting: false,
		meta: { className: "min-w-[18rem]" },
	},
	{
		accessorKey: "description",
		header: "Description",
		enableSorting: false,
		meta: { className: "min-w-[24rem]" },
	},
	{
		id: "modules",
		accessorKey: "moduleCount",
		header: "Modules",
		enableSorting: false,
		meta: { className: "w-[9rem] text-center" },
	},
	{
		accessorKey: "isActive",
		header: "Status",
		enableSorting: false,
		meta: { className: "w-[10rem] text-center" },
	},
	{
		id: "actions",
		header: "Action",
		enableSorting: false,
		meta: { className: "w-[11rem] text-center" },
	},
];

export function useMasterModuleSystemListPage() {
	const queryClient = useQueryClient();
	const systemsQuery = useMasterModuleSystemsQuery();
	const [query, setQuery] = useState("");
	const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
	const [pagination, setPagination] =
		useState<PaginationState>(InitialPagination);
	const records = useMemo(
		() => systemsQuery.data?.systems ?? [],
		[systemsQuery.data],
	);
	const filteredRecords = useMemo(() => {
		const normalizedQuery = query.trim().toLowerCase();

		return records.filter((record) => {
			const matchesStatus =
				statusFilter === "ALL" ||
				(statusFilter === "ACTIVE" ? record.isActive : !record.isActive);
			const matchesQuery =
				!normalizedQuery ||
				[
					record.code,
					record.name,
					record.description,
					`${record.moduleCount} modules`,
				]
					.join(" ")
					.toLowerCase()
					.includes(normalizedQuery);

			return matchesStatus && matchesQuery;
		});
	}, [query, records, statusFilter]);
	// eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table owns table state handlers.
	const table = useReactTable({
		columns: ModuleSystemColumns,
		data: filteredRecords,
		state: { pagination },
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		onPaginationChange: setPagination,
	});
	const statusMutation = useMutation({
		mutationFn: async ({
			isActive,
			systemId,
		}: {
			isActive: boolean;
			systemId: number;
		}) => updateMasterModuleSystemStatus(systemId, isActive),
		onSuccess: async () => {
			await queryClient.invalidateQueries({
				queryKey: MasterModuleSystemQueryKeys.lists(),
			});
			toast.success("System status updated.");
		},
		onError: (error: Error) => toast.error(error.message),
	});
	const summary = useMemo(
		() => ({
			activeSystems: records.filter((record) => record.isActive).length,
			configuredSidebars: records.filter((record) => record.sidebar.length > 0)
				.length,
			inactiveSystems: records.filter((record) => !record.isActive).length,
			totalSystems: records.length,
		}),
		[records],
	);

	function resetFilters() {
		setQuery("");
		setStatusFilter("ALL");
		setPagination((current) => ({ ...current, pageIndex: 0 }));
	}

	function refreshSystems() {
		void systemsQuery.refetch();
	}

	function toggleRecordStatus(record: MasterModuleSystem) {
		statusMutation.mutate({
			systemId: record.id,
			isActive: !record.isActive,
		});
	}

	return {
		isLoading: systemsQuery.isLoading,
		isRefreshing: systemsQuery.isFetching,
		lastSyncedAt: systemsQuery.dataUpdatedAt || null,
		query,
		refreshSystems,
		records,
		resetFilters,
		setQuery,
		setStatusFilter,
		statusFilter,
		summary,
		table,
		toggleRecordStatus,
	};
}

export type MasterModuleSystemStatusFilter = StatusFilter;
