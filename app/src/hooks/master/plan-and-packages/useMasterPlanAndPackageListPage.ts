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
import { MasterPlanAndPackageTableColumns } from "@/app/src/constants/master/plan-and-packages/MasterPlanAndPackageConstants";
import {
	MasterPlanAndPackageRecords,
	formatMasterPlanAndPackageScalePricing,
	formatMasterPlanAndPackagePricing,
	getMasterPlanAndPackageFeatureLabels,
} from "@/app/src/data/master/plan-and-packages/MasterPlanAndPackageData";
import type {
	MasterPlanAndPackageRecord,
	MasterPlanAndPackageTableColumnKey,
} from "@/app/src/types/master/plan-and-packages/MasterPlanAndPackageTypes";

const InitialPagination: PaginationState = {
	pageIndex: 0,
	pageSize: 5,
};

export function useMasterPlanAndPackageListPage() {
	const [records, setRecords] = useState(MasterPlanAndPackageRecords);
	const [query, setQuery] = useState("");
	const [pagination, setPagination] =
		useState<PaginationState>(InitialPagination);
	const filteredRecords = useMemo(() => {
		const normalizedQuery = query.trim().toLowerCase();

		if (!normalizedQuery) {
			return records;
		}

		return records.filter((record) =>
			[
				record.name,
				record.code,
				record.description,
				record.status,
				`${record.trialDays} trial days`,
				formatMasterPlanAndPackagePricing(record.pricing),
				formatMasterPlanAndPackageScalePricing(record.scalePricing),
				...getMasterPlanAndPackageFeatureLabels(record.featureIds),
			]
				.join(" ")
				.toLowerCase()
				.includes(normalizedQuery),
		);
	}, [query, records]);
	const columns = useMemo<ColumnDef<MasterPlanAndPackageRecord>[]>(
		() =>
			MasterPlanAndPackageTableColumns.map((column) => {
				if (!("key" in column)) {
					return {
						id: "actions",
						header: column.label,
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
		columns,
		data: filteredRecords,
		state: {
			pagination,
		},
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		onPaginationChange: setPagination,
	});
	const summary = useMemo(() => {
		const activePlans = records.filter(
			(record) => record.status === "Active",
		).length;
		const draftPlans = records.filter(
			(record) => record.status === "Draft",
		).length;
		const inactivePlans = records.filter(
			(record) => record.status === "Inactive",
		).length;
		const addOnScalePlans = records.filter((record) =>
			Object.values(record.scalePricing).some(
				(scaleRules) =>
					Object.values(scaleRules).some(
						(scaleRule) => scaleRule.addOnPrice > 0,
					),
			),
		).length;
		const enabledModules = new Set(
			records.flatMap((record) => record.featureIds),
		).size;

		return {
			activePlans,
			addOnScalePlans,
			draftPlans,
			enabledModules,
			inactivePlans,
			totalPlans: records.length,
		};
	}, [records]);

	function toggleRecordStatus(recordId: string) {
		const record = records.find((candidate) => candidate.id === recordId);

		if (!record) {
			return;
		}

		const nextStatus =
			record.status === "Active" ? "Inactive" : "Active";

		setRecords((current) =>
			current.map((candidate) =>
				candidate.id === recordId
					? { ...candidate, status: nextStatus }
					: candidate,
			),
		);
		toast.success(
			nextStatus === "Active" ? "Plan activated." : "Plan inactivated.",
		);
	}

	function resetFilters() {
		setQuery("");
		setPagination((current) => ({ ...current, pageIndex: 0 }));
	}

	return {
		query,
		resetFilters,
		setQuery,
		summary,
		table,
		toggleRecordStatus,
	};
}

function createColumn(
	key: MasterPlanAndPackageTableColumnKey,
	label: string,
	className: string,
): ColumnDef<MasterPlanAndPackageRecord> {
	if (key === "pricing") {
		return {
			id: key,
			accessorFn: (record) =>
				formatMasterPlanAndPackagePricing(record.pricing),
			header: label,
			enableSorting: false,
			meta: { className },
		};
	}

	if (key === "scalePricing") {
		return {
			id: key,
			accessorFn: (record) =>
				formatMasterPlanAndPackageScalePricing(record.scalePricing),
			header: label,
			enableSorting: false,
			meta: { className },
		};
	}

	return {
		accessorKey: key,
		header: label,
		enableSorting: false,
		meta: { className },
	};
}
