"use client";

import { useMemo, useState } from "react";
import {
	getCoreRowModel,
	getPaginationRowModel,
	useReactTable,
	type ColumnDef,
	type PaginationState,
} from "@tanstack/react-table";
import { useShallow } from "zustand/react/shallow";
import {
	MasterTenantAccessStatusOptions,
	MasterTenantAccessTableColumns,
} from "@/app/src/constants/master/tenant-access/MasterTenantAccessConstants";
import {
	createMasterTenantAccessListRecords,
	createMasterTenantAccessMetrics,
} from "@/app/src/data/master/tenant-access/MasterTenantAccessData";
import { useMasterTenantAccessStore } from "@/app/src/hooks/master/tenant-access/useMasterTenantAccessStore";
import type {
	MasterTenantAccessEntity,
	MasterTenantAccessListRecord,
	MasterTenantAccessStatus,
} from "@/app/src/types/master/tenant-access/MasterTenantAccessTypes";

type MasterTenantAccessColumnKey = keyof Pick<
	MasterTenantAccessListRecord,
	| "countA"
	| "countB"
	| "dateText"
	| "detailText"
	| "primaryText"
	| "relationName"
	| "relationText"
	| "status"
>;

const InitialPagination: PaginationState = {
	pageIndex: 0,
	pageSize: 5,
};

export function useMasterTenantAccessListPage(
	entity: MasterTenantAccessEntity,
) {
	const tenantAccess = useMasterTenantAccessStore(
		useShallow((state) => ({
			branches: state.branches,
			companies: state.companies,
			subscribers: state.subscribers,
			users: state.users,
		})),
	);
	const [query, setQueryState] = useState("");
	const [statusFilter, setStatusFilterState] = useState<
		MasterTenantAccessStatus | "All"
	>("All");
	const [pagination, setPagination] =
		useState<PaginationState>(InitialPagination);
	const records = useMemo(
		() =>
			createMasterTenantAccessListRecords({
				...tenantAccess,
				entity,
			}),
		[entity, tenantAccess],
	);
	const filteredRecords = useMemo(() => {
		const normalizedQuery = query.trim().toLowerCase();

		return records.filter((record) => {
			const searchable = [
				record.primaryText,
				record.secondaryText,
				record.relationName,
				record.relationText,
				record.detailText,
				record.dateText,
				record.status,
			]
				.join(" ")
				.toLowerCase();

			return (
				(!normalizedQuery || searchable.includes(normalizedQuery)) &&
				(statusFilter === "All" || record.status === statusFilter)
			);
		});
	}, [query, records, statusFilter]);
	const columns = useMemo<ColumnDef<MasterTenantAccessListRecord>[]>(
		() =>
			MasterTenantAccessTableColumns[entity].map((column) => {
				if (!("key" in column)) {
					return {
						id: "actions",
						enableSorting: false,
						header: column.label,
						meta: { className: column.className },
					};
				}

				return createColumn(column.key, column.label, column.className);
			}),
		[entity],
	);
	// eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table owns table state handlers.
	const table = useReactTable({
		columns,
		data: filteredRecords,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		onPaginationChange: setPagination,
		state: {
			pagination,
		},
	});
	const metrics = useMemo(
		() =>
			createMasterTenantAccessMetrics({
				...tenantAccess,
				entity,
			}),
		[entity, tenantAccess],
	);

	function setQuery(value: string) {
		setQueryState(value);
		setPagination((current) => ({ ...current, pageIndex: 0 }));
	}

	function setStatusFilter(value: MasterTenantAccessStatus | "All") {
		setStatusFilterState(value);
		setPagination((current) => ({ ...current, pageIndex: 0 }));
	}

	function resetFilters() {
		setQuery("");
		setStatusFilter("All");
	}

	return {
		metrics,
		query,
		resetFilters,
		setQuery,
		setStatusFilter,
		statusFilter,
		statusOptions: MasterTenantAccessStatusOptions,
		table,
	};
}

function createColumn(
	key: MasterTenantAccessColumnKey,
	header: string,
	className: string,
): ColumnDef<MasterTenantAccessListRecord> {
	return {
		accessorKey: key,
		enableSorting: false,
		header,
		meta: { className },
	};
}
