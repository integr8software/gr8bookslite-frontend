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
	MasterInvoiceAllFilterValue,
	MasterInvoiceTableColumns,
} from "@/app/src/constants/master/invoices/MasterInvoiceConstants";
import {
	getMasterSubscriptionCompanyById,
	getMasterSubscriptionPlanById,
} from "@/app/src/data/master/subscriptions/MasterSubscriptionData";
import {
	formatMasterInvoiceCurrency,
	formatMasterInvoiceDate,
	getMasterInvoiceSubscriberSummary,
	getMasterInvoicesBySubscriberId,
} from "@/app/src/data/master/invoices/MasterInvoiceData";
import type {
	MasterInvoicePaymentMethodFilter,
	MasterInvoiceRecord,
	MasterInvoiceStatusFilter,
	MasterInvoiceSubscriberTab,
	MasterInvoiceTableColumnKey,
	MasterInvoiceTransactionTypeFilter,
} from "@/app/src/types/master/invoices/MasterInvoiceTypes";


const InitialPagination: PaginationState = {
	pageIndex: 0,
	pageSize: 10,
};

export function useMasterInvoiceSubscriberPage(subscriberId: string) {
	const subscriber = useMemo(
		() => getMasterSubscriptionCompanyById(subscriberId),
		[subscriberId],
	);

	const plan = useMemo(
		() => (subscriber ? getMasterSubscriptionPlanById(subscriber.planId) : undefined),
		[subscriber],
	);

	const summary = useMemo(
		() => (subscriber ? getMasterInvoiceSubscriberSummary(subscriber.id) : undefined),
		[subscriber],
	);

	const rawInvoices = useMemo(
		() => (subscriber ? getMasterInvoicesBySubscriberId(subscriber.id) : []),
		[subscriber],
	);

	const [activeTab, setActiveTab] = useState<MasterInvoiceSubscriberTab>("overview");
	const [query, setQuery] = useState("");
	const [statusFilter, setStatusFilter] =
		useState<MasterInvoiceStatusFilter>(MasterInvoiceAllFilterValue);
	const [paymentMethodFilter, setPaymentMethodFilter] =
		useState<MasterInvoicePaymentMethodFilter>(MasterInvoiceAllFilterValue);
	const [transactionTypeFilter, setTransactionTypeFilter] =
		useState<MasterInvoiceTransactionTypeFilter>(MasterInvoiceAllFilterValue);
	const [pagination, setPagination] =
		useState<PaginationState>(InitialPagination);

	const filteredInvoices = useMemo(() => {
		const normalizedQuery = query.trim().toLowerCase();

		return rawInvoices.filter((record) => {
			const matchesStatus =
				statusFilter === MasterInvoiceAllFilterValue || record.status === statusFilter;
			const matchesPaymentMethod =
				paymentMethodFilter === MasterInvoiceAllFilterValue ||
				record.paymentMethod === paymentMethodFilter;
			const matchesTransactionType =
				transactionTypeFilter === MasterInvoiceAllFilterValue ||
				record.transactionType === transactionTypeFilter;
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
					record.transactionType,
					record.billingPeriod,
					formatMasterInvoiceCurrency(record.amount),
					formatMasterInvoiceDate(record.transactionDate),
				]
					.join(" ")
					.toLowerCase()
					.includes(normalizedQuery);

			return (
				matchesStatus &&
				matchesPaymentMethod &&
				matchesTransactionType &&
				matchesQuery
			);
		});
	}, [paymentMethodFilter, query, rawInvoices, statusFilter, transactionTypeFilter]);

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
		data: filteredInvoices,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		onPaginationChange: setPagination,
		state: {
			pagination,
		},
	});

	function resetFilters() {
		setQuery("");
		setStatusFilter(MasterInvoiceAllFilterValue);
		setPaymentMethodFilter(MasterInvoiceAllFilterValue);
		setTransactionTypeFilter(MasterInvoiceAllFilterValue);
		setPagination((current) => ({ ...current, pageIndex: 0 }));
	}

	return {
		activeTab,
		columns,
		filteredInvoices,
		invoices: rawInvoices,
		pagination,
		paymentMethodFilter,
		plan,
		query,
		resetFilters,
		setActiveTab,
		setPagination,
		setPaymentMethodFilter,
		setQuery,
		setStatusFilter,
		setTransactionTypeFilter,
		statusFilter,
		subscriber,
		summary,
		table,
		transactionTypeFilter,
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
