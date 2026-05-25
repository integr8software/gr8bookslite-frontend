"use client";

import { useMemo, useState } from "react";
import {
	getCoreRowModel,
	getPaginationRowModel,
	useReactTable,
	type ColumnDef,
	type PaginationState,
} from "@tanstack/react-table";
import {
	MasterCompanyManagementGroupOptions,
	MasterCompanyManagementSortOptions,
	MasterCompanyManagementTableColumns,
} from "@/app/src/constants/master/company-management/MasterCompanyManagementConstants";
import { MasterCompanyManagementRecords } from "@/app/src/data/master/company-management/MasterCompanyManagementData";
import type {
	MasterCompanyManagementGroupBy,
	MasterCompanyManagementRecord,
	MasterCompanyManagementSortBy,
	MasterCompanyManagementTableColumnKey,
} from "@/app/src/types/master/company-management/MasterCompanyManagementTypes";

const InitialPagination: PaginationState = {
	pageIndex: 0,
	pageSize: 5,
};

export function useMasterCompanyManagementPage() {
	const [query, setQuery] = useState("");
	const [groupBy, setGroupByState] =
		useState<MasterCompanyManagementGroupBy>("none");
	const [sortBy, setSortByState] =
		useState<MasterCompanyManagementSortBy>("name");
	const [pagination, setPagination] =
		useState<PaginationState>(InitialPagination);
	const filteredRecords = useMemo(() => {
		const normalizedQuery = query.trim().toLowerCase();

		if (!normalizedQuery) {
			return MasterCompanyManagementRecords;
		}

		return MasterCompanyManagementRecords.filter((company) =>
			[
				company.name,
				company.email,
				company.ownerName,
				company.plan,
				company.status,
				company.billingCycle,
			]
				.join(" ")
				.toLowerCase()
				.includes(normalizedQuery),
		);
	}, [query]);
	const tableRecords = useMemo(
		() => sortMasterCompanyRecords(filteredRecords, groupBy, sortBy),
		[filteredRecords, groupBy, sortBy],
	);
	const columns = useMemo<ColumnDef<MasterCompanyManagementRecord>[]>(
		() =>
			MasterCompanyManagementTableColumns.map((column) => {
				if (!("key" in column)) {
					return {
						id: "actions",
						header: column.label,
						enableGrouping: false,
						enableSorting: false,
						meta: { className: column.className },
					};
				}

				return createColumn(column.key, column.label, column.className);
			}),
		[],
	);
	// eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table owns table state handlers.
	const table = useReactTable({
		data: tableRecords,
		columns,
		state: {
			pagination,
		},
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		onPaginationChange: setPagination,
	});
	const metrics = useMemo(() => {
		const subscribedCompanies = MasterCompanyManagementRecords.filter(
			(company) => company.status !== "Inactive",
		);
		const monthlyRecurringRevenue = subscribedCompanies.reduce(
			(total, company) => total + company.monthlyRecurringRevenue,
			0,
		);
		const activeUsers = subscribedCompanies.reduce(
			(total, company) => total + company.activeUsers,
			0,
		);
		const renewalRisks = MasterCompanyManagementRecords.filter(
			(company) => company.status === "Past Due" || company.status === "Trial",
		).length;

		return {
			activeUsers,
			monthlyRecurringRevenue,
			renewalRisks,
			subscribedCompanies: subscribedCompanies.length,
			totalCompanies: MasterCompanyManagementRecords.length,
		};
	}, []);

	function setGroupBy(value: MasterCompanyManagementGroupBy) {
		setGroupByState(value);
		setPagination((current) => ({ ...current, pageIndex: 0 }));
	}

	function setSortBy(value: MasterCompanyManagementSortBy) {
		setSortByState(value);
		setPagination((current) => ({ ...current, pageIndex: 0 }));
	}

	function resetFilters() {
		setQuery("");
		setGroupBy("none");
		setSortBy("name");
	}

	return {
		groupBy,
		groupOptions: MasterCompanyManagementGroupOptions,
		metrics,
		query,
		resetFilters,
		setGroupBy,
		setQuery,
		setSortBy,
		sortBy,
		sortOptions: MasterCompanyManagementSortOptions,
		table,
	};
}

function createColumn(
	key: MasterCompanyManagementTableColumnKey,
	label: string,
	className: string,
): ColumnDef<MasterCompanyManagementRecord> {
	return {
		accessorKey: key,
		header: label,
		enableSorting: false,
		meta: { className },
	};
}

function sortMasterCompanyRecords(
	records: MasterCompanyManagementRecord[],
	groupBy: MasterCompanyManagementGroupBy,
	sortBy: MasterCompanyManagementSortBy,
) {
	return [...records].sort((first, second) => {
		if (groupBy !== "none") {
			const groupDelta = compareValues(first[groupBy], second[groupBy], false);

			if (groupDelta !== 0) {
				return groupDelta;
			}
		}

		return compareValues(
			first[sortBy],
			second[sortBy],
			sortBy === "monthlyRecurringRevenue" || sortBy === "activeUsers",
		);
	});
}

function compareValues(
	first: string | number,
	second: string | number,
	descending: boolean,
) {
	const delta =
		typeof first === "number" && typeof second === "number"
			? first - second
			: String(first).localeCompare(String(second));

	return descending ? -delta : delta;
}
