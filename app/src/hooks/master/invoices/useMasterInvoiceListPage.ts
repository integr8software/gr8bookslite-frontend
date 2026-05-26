"use client";

import { useMemo, useState } from "react";
import {
	getCoreRowModel,
	getPaginationRowModel,
	useReactTable,
	type ColumnDef,
	type PaginationState,
} from "@tanstack/react-table";
import { MasterInvoiceTableColumns } from "@/app/src/constants/master/invoices/MasterInvoiceConstants";
import {
	MasterInvoiceRecords,
	formatMasterInvoiceCurrency,
	formatMasterInvoiceDate,
} from "@/app/src/data/master/invoices/MasterInvoiceData";
import type {
	MasterInvoicePaymentMethod,
	MasterInvoiceRecord,
	MasterInvoiceStatus,
	MasterInvoiceTableColumnKey,
} from "@/app/src/types/master/invoices/MasterInvoiceTypes";

const InitialPagination: PaginationState = {
	pageIndex: 0,
	pageSize: 5,
};

export type MasterInvoiceStatusFilter = "All statuses" | MasterInvoiceStatus;

export type MasterInvoicePaymentMethodFilter =
	| "All methods"
	| MasterInvoicePaymentMethod;

export function useMasterInvoiceListPage() {
	const [query, setQuery] = useState("");
	const [statusFilter, setStatusFilter] =
		useState<MasterInvoiceStatusFilter>("All statuses");
	const [paymentMethodFilter, setPaymentMethodFilter] =
		useState<MasterInvoicePaymentMethodFilter>("All methods");
	const [pagination, setPagination] =
		useState<PaginationState>(InitialPagination);
	const filteredRecords = useMemo(() => {
		const normalizedQuery = query.trim().toLowerCase();

		return MasterInvoiceRecords.filter((record) => {
			const matchesStatus =
				statusFilter === "All statuses" || record.status === statusFilter;
			const matchesPaymentMethod =
				paymentMethodFilter === "All methods" ||
				record.paymentMethod === paymentMethodFilter;
			const matchesQuery =
				!normalizedQuery ||
				[
					record.invoiceNo,
					record.subscriberName,
					record.ownerName,
					record.availedItem,
					record.planName,
					record.paymentMethod,
					record.referenceNo,
					record.status,
					record.billingPeriod,
					formatMasterInvoiceCurrency(record.amount),
					formatMasterInvoiceDate(record.transactionDate),
				]
					.join(" ")
					.toLowerCase()
					.includes(normalizedQuery);

			return matchesStatus && matchesPaymentMethod && matchesQuery;
		});
	}, [paymentMethodFilter, query, statusFilter]);
	const columns = useMemo<ColumnDef<MasterInvoiceRecord>[]>(
		() =>
			MasterInvoiceTableColumns.map((column) =>
				createColumn(column.key, column.label, column.className),
			),
		[],
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
	const summary = useMemo(() => {
		const paidRecords = MasterInvoiceRecords.filter(
			(record) => record.status === "Paid",
		);
		const pendingRecords = MasterInvoiceRecords.filter(
			(record) => record.status === "Pending",
		);
		const failedRecords = MasterInvoiceRecords.filter(
			(record) => record.status === "Failed",
		);
		const paidAmount = paidRecords.reduce(
			(total, record) => total + record.amount,
			0,
		);
		const subscriberCount = new Set(
			MasterInvoiceRecords.map((record) => record.subscriberId),
		).size;

		return {
			failedInvoices: failedRecords.length,
			paidAmount,
			paidInvoices: paidRecords.length,
			pendingInvoices: pendingRecords.length,
			subscriberCount,
			totalInvoices: MasterInvoiceRecords.length,
		};
	}, []);

	function resetFilters() {
		setQuery("");
		setStatusFilter("All statuses");
		setPaymentMethodFilter("All methods");
		setPagination((current) => ({ ...current, pageIndex: 0 }));
	}

	return {
		paymentMethodFilter,
		query,
		resetFilters,
		setPaymentMethodFilter,
		setQuery,
		setStatusFilter,
		statusFilter,
		summary,
		table,
	};
}

function createColumn(
	key: MasterInvoiceTableColumnKey,
	label: string,
	className: string,
): ColumnDef<MasterInvoiceRecord> {
	if (key === "amount") {
		return {
			id: key,
			accessorFn: (record) => formatMasterInvoiceCurrency(record.amount),
			enableSorting: false,
			header: label,
			meta: { className },
		};
	}

	if (key === "transactionDate") {
		return {
			id: key,
			accessorFn: (record) => formatMasterInvoiceDate(record.transactionDate),
			enableSorting: false,
			header: label,
			meta: { className },
		};
	}

	return {
		accessorKey: key,
		enableSorting: false,
		header: label,
		meta: { className },
	};
}
