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
	MasterSubscriptionCompanies,
	getMasterSubscriptionPlanById,
} from "@/app/src/data/master/subscriptions/MasterSubscriptionData";
import {
	MasterInvoiceRecords,
	formatMasterInvoiceCurrency,
	getMasterInvoiceSubscriberSummary,
} from "@/app/src/data/master/invoices/MasterInvoiceData";
import type {
	MasterInvoiceSubscriberSummary,
} from "@/app/src/types/master/invoices/MasterInvoiceTypes";
import type {
	MasterSubscriptionBillingCycle,
	MasterSubscriptionCompanyRecord,
	MasterSubscriptionCompanyStatus,
	MasterSubscriptionPlanRecord,
} from "@/app/src/types/master/subscriptions/MasterSubscriptionTypes";

export type MasterInvoiceCompanyStatusFilter = "All" | MasterSubscriptionCompanyStatus;
export type MasterInvoiceBillingCycleFilter = "All" | MasterSubscriptionBillingCycle;

export type MasterInvoiceCompanyRowItem = {
	plan: MasterSubscriptionPlanRecord | undefined;
	subscriber: MasterSubscriptionCompanyRecord;
	summary: MasterInvoiceSubscriberSummary;
};

export const MasterInvoiceCompanyStatusOptions: MasterInvoiceCompanyStatusFilter[] = [
	"All",
	"Active",
	"Trial",
	"Past Due",
	"Scheduled",
];

export const MasterInvoiceBillingCycleOptions: MasterInvoiceBillingCycleFilter[] = [
	"All",
	"Monthly",
	"Annual",
	"Every 3 months",
	"Per transaction",
];

const InitialPagination: PaginationState = {
	pageIndex: 0,
	pageSize: 10,
};

export function useMasterInvoiceListPage() {
	const [query, setQuery] = useState("");
	const [statusFilter, setStatusFilter] =
		useState<MasterInvoiceCompanyStatusFilter>("All");
	const [billingCycleFilter, setBillingCycleFilter] =
		useState<MasterInvoiceBillingCycleFilter>("All");
	const [pagination, setPagination] =
		useState<PaginationState>(InitialPagination);

	const allCompanyRows = useMemo<MasterInvoiceCompanyRowItem[]>(() => {
		return MasterSubscriptionCompanies.map((subscriber) => {
			const plan = getMasterSubscriptionPlanById(subscriber.planId);
			const summary =
				getMasterInvoiceSubscriberSummary(subscriber.id) ?? {
					failedInvoices: 0,
					paidAmount: 0,
					paidInvoices: 0,
					pendingAmount: 0,
					pendingInvoices: 0,
					planName: plan?.name ?? "Unknown plan",
					recentInvoices: [],
					refundedAmount: 0,
					refundedInvoices: 0,
					subscriberId: subscriber.id,
					subscriberName: subscriber.name,
					totalAmount: 0,
					totalInvoices: 0,
				};

			return {
				plan,
				subscriber,
				summary,
			};
		});
	}, []);

	const filteredCompanyRows = useMemo(() => {
		const normalizedQuery = query.trim().toLowerCase();

		return allCompanyRows.filter(({ subscriber, plan, summary }) => {
			const matchesStatus =
				statusFilter === "All" || subscriber.status === statusFilter;
			const matchesCycle =
				billingCycleFilter === "All" ||
				subscriber.billingCycle === billingCycleFilter;
			const matchesQuery =
				!normalizedQuery ||
				[
					subscriber.name,
					subscriber.ownerName,
					subscriber.id,
					plan?.name ?? "",
					subscriber.billingCycle,
					subscriber.status,
					formatMasterInvoiceCurrency(summary.paidAmount),
				]
					.join(" ")
					.toLowerCase()
					.includes(normalizedQuery);

			return matchesStatus && matchesCycle && matchesQuery;
		});
	}, [allCompanyRows, billingCycleFilter, query, statusFilter]);

	const columns = useMemo<ColumnDef<MasterInvoiceCompanyRowItem>[]>(
		() => [
			{
				id: "subscriber",
				header: "Company / Subscriber",
				enableSorting: false,
				meta: { className: "w-[18rem]" },
			},
			{
				id: "plan",
				header: "Plan & Billing",
				enableSorting: false,
				meta: { className: "w-[14rem]" },
			},
			{
				id: "usage",
				header: "Usage & Scale",
				enableSorting: false,
				meta: { className: "w-[13rem]" },
			},
			{
				id: "transactions",
				header: "Transactions & Revenue",
				enableSorting: false,
				meta: { className: "w-[16rem]" },
			},
			{
				id: "status",
				header: "Status & Renewal",
				enableSorting: false,
				meta: { className: "w-[13rem]" },
			},
			{
				id: "actions",
				header: "Actions",
				enableSorting: false,
				meta: { className: "w-[12rem] text-right" },
			},
		],
		[],
	);

	// eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table owns table state handlers.
	const table = useReactTable({
		columns,
		data: filteredCompanyRows,
		state: {
			pagination,
		},
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		onPaginationChange: setPagination,
	});

	const metrics = useMemo(() => {
		const paidInvoices = MasterInvoiceRecords.filter((i) => i.status === "Paid");
		const pendingInvoices = MasterInvoiceRecords.filter((i) => i.status === "Pending");
		const failedInvoices = MasterInvoiceRecords.filter((i) => i.status === "Failed");
		const refundedInvoices = MasterInvoiceRecords.filter((i) => i.status === "Refunded");

		const totalCollectedRevenue = paidInvoices.reduce((sum, i) => sum + i.amount, 0);
		const totalPendingRevenue = pendingInvoices.reduce((sum, i) => sum + i.amount, 0);
		const totalRefundedRevenue = refundedInvoices.reduce((sum, i) => sum + i.amount, 0);

		const pastDueSubscribers = MasterSubscriptionCompanies.filter(
			(s) => s.status === "Past Due",
		).length;

		return {
			failedInvoiceCount: failedInvoices.length,
			pastDueSubscribers,
			pendingInvoiceCount: pendingInvoices.length,
			refundedInvoiceCount: refundedInvoices.length,
			totalCollectedRevenue,
			totalInvoicesCount: MasterInvoiceRecords.length,
			totalPendingRevenue,
			totalRefundedRevenue,
			totalSubscribers: MasterSubscriptionCompanies.length,
		};
	}, []);

	const hasActiveFilters =
		query.trim().length > 0 ||
		statusFilter !== "All" ||
		billingCycleFilter !== "All";

	function resetFilters() {
		setQuery("");
		setStatusFilter("All");
		setBillingCycleFilter("All");
		setPagination((current) => ({ ...current, pageIndex: 0 }));
	}

	return {
		allCompanyRows,
		billingCycleFilter,
		companyRows: filteredCompanyRows,
		hasActiveFilters,
		isLoading: false,
		isRefreshing: false,
		lastSyncedAt: Date.now(),
		metrics,
		query,
		resetFilters,
		setBillingCycleFilter,
		setQuery,
		setStatusFilter,
		statusFilter,
		table,
	};
}



