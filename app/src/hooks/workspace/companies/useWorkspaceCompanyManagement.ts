"use client";

import { useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import {
	getCoreRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
	type ColumnDef,
	type PaginationState,
	type SortingState,
} from "@tanstack/react-table";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
	WorkspaceCompanyPlanOptions,
	WorkspaceCompanyStatusOptions,
	WorkspaceCompanyTableColumns,
	WorkspaceCompanyTypeOptions,
} from "@/app/src/constants/workspace/WorkspaceCompanyConstants";
import { GetAccessToken } from "@/app/src/data/auth/AuthSessionStorage";
import { useAppStore } from "@/app/src/hooks/shared/app/useAppStore";
import { BillingQueryKeys } from "@/app/src/services/billing/BillingQueryKeys";
import {
	CreateWorkspaceCompany,
	DeactivateWorkspaceCompany,
	GetWorkspaceCompanies,
	GetWorkspaceCompany,
	UpdateWorkspaceCompany,
} from "@/app/src/services/workspace/companies/WorkspaceCompanyApi";
import { WorkspaceCompanyQueryKeys } from "@/app/src/services/workspace/companies/WorkspaceCompanyQueryKeys";
import type {
	WorkspaceCompanyBranchRecord,
	WorkspaceCompanyFormValues,
	WorkspaceCompanyPlan,
	WorkspaceCompanyRecord,
	WorkspaceCompanyStatus,
	WorkspaceCompanyTableColumnKey,
	WorkspaceCompanyTableRecord,
	WorkspaceCompanyType,
	WorkspaceCompanyUserRecord,
} from "@/app/src/types/workspace/WorkspaceCompanyTypes";

type WorkspaceCompanyManagementStoreState = {
	branches: WorkspaceCompanyBranchRecord[];
	companies: WorkspaceCompanyRecord[];
	isLoading: boolean;
	isMutating: boolean;
	users: WorkspaceCompanyUserRecord[];
	addCompany: (values: WorkspaceCompanyFormValues) => Promise<WorkspaceCompanyRecord>;
	addCompanyUser: (user: WorkspaceCompanyUserRecord) => void;
	deleteCompany: (companyId: string) => Promise<WorkspaceCompanyRecord>;
	updateCompany: (
		companyId: string,
		values: WorkspaceCompanyFormValues,
	) => Promise<WorkspaceCompanyRecord>;
	updateCompanyUser: (user: WorkspaceCompanyUserRecord) => void;
};

const EmptyWorkspaceCompanies: WorkspaceCompanyRecord[] = [];
const EmptyWorkspaceCompanyUsers: WorkspaceCompanyUserRecord[] = [];
const EmptyWorkspaceCompanyBranches: WorkspaceCompanyBranchRecord[] = [];
const WorkspaceCompanyManagementRoutePrefix = "/workspace/company-management";

type WorkspaceCompanyRouteParams = {
	companyId?: string;
	segments: string[];
};

export function useWorkspaceCompanyRouteParams() {
	return getWorkspaceCompanyRouteParams(usePathname());
}

function getWorkspaceCompanyRouteParams(
	pathname: string,
): WorkspaceCompanyRouteParams {
	const routePath = pathname.startsWith(WorkspaceCompanyManagementRoutePrefix)
		? pathname.slice(WorkspaceCompanyManagementRoutePrefix.length)
		: pathname;
	const segments = routePath
		.split("/")
		.filter(Boolean)
		.map((segment) => decodeURIComponent(segment));
	const companyId =
		segments[0] === "edit" || segments[0] === "view"
			? segments[1]
			: undefined;

	return {
		companyId,
		segments,
	};
}

export function useWorkspaceCompanyRecord(companyId?: string) {
	const queryClient = useQueryClient();
	const storedAccessToken = useAppStore((state) => state.accessToken);
	const accessToken = storedAccessToken ?? GetAccessToken();

	return useQuery({
		queryKey: WorkspaceCompanyQueryKeys.company(companyId ?? "missing"),
		queryFn: async () => {
			if (!accessToken || !companyId) {
				throw new Error("Company record is not available.");
			}

			return GetWorkspaceCompany(accessToken, companyId);
		},
		enabled: Boolean(accessToken && companyId),
		initialData: () =>
			queryClient
				.getQueryData<WorkspaceCompanyRecord[]>(
					WorkspaceCompanyQueryKeys.companies(),
				)
				?.find((company) => company.id === companyId),
	});
}

export function useWorkspaceCompanyManagementStore<
	TSelected = WorkspaceCompanyManagementStoreState,
>(selector?: (state: WorkspaceCompanyManagementStoreState) => TSelected) {
	const queryClient = useQueryClient();
	const storedAccessToken = useAppStore((state) => state.accessToken);
	const accessToken = storedAccessToken;
	const companiesQuery = useQuery({
		queryKey: WorkspaceCompanyQueryKeys.companies(),
		queryFn: async () => GetWorkspaceCompanies(accessToken),
	});
	const usersQuery = useQuery({
		queryKey: WorkspaceCompanyQueryKeys.users(),
		queryFn: async () => EmptyWorkspaceCompanyUsers,
		initialData: EmptyWorkspaceCompanyUsers,
	});
	const branchesQuery = useQuery({
		queryKey: WorkspaceCompanyQueryKeys.branches(),
		queryFn: async () => EmptyWorkspaceCompanyBranches,
		initialData: EmptyWorkspaceCompanyBranches,
	});

	function setCompanies(
		updater: (companies: WorkspaceCompanyRecord[]) => WorkspaceCompanyRecord[],
	) {
		queryClient.setQueryData<WorkspaceCompanyRecord[]>(
			WorkspaceCompanyQueryKeys.companies(),
			(current = EmptyWorkspaceCompanies) => updater(current),
		);
	}

	function setCompanyUsers(
		updater: (
			users: WorkspaceCompanyUserRecord[],
		) => WorkspaceCompanyUserRecord[],
	) {
		queryClient.setQueryData<WorkspaceCompanyUserRecord[]>(
			WorkspaceCompanyQueryKeys.users(),
			(current = EmptyWorkspaceCompanyUsers) => updater(current),
		);
	}

	const addCompanyMutation = useMutation({
		mutationFn: async (values: WorkspaceCompanyFormValues) =>
			CreateWorkspaceCompany(accessToken, values),
		onSuccess: (company) => {
			setCompanies((companies) => [company, ...companies]);
			void queryClient.invalidateQueries({
				queryKey: WorkspaceCompanyQueryKeys.companies(),
			});
			void queryClient.invalidateQueries({
				queryKey: BillingQueryKeys.paymentMethods(),
			});
			toast.success("Company created.");
		},
		onError: (error) => {
			toast.error(
				error instanceof Error
					? error.message
					: "Could not create company. Please try again.",
			);
		},
	});
	const updateCompanyMutation = useMutation({
		mutationFn: async ({
			companyId,
			values,
		}: {
			companyId: string;
			values: WorkspaceCompanyFormValues;
		}) => {
			if (!accessToken) {
				throw new Error("Sign in again before updating this company.");
			}

			return UpdateWorkspaceCompany(accessToken, companyId, values);
		},
		onSuccess: (company) => {
			setCompanies((companies) =>
				companies.map((current) =>
					current.id === company.id ? company : current,
				),
			);
			queryClient.setQueryData(
				WorkspaceCompanyQueryKeys.company(company.id),
				company,
			);
			void queryClient.invalidateQueries({
				queryKey: WorkspaceCompanyQueryKeys.companies(),
			});
			toast.success("Company updated.");
		},
		onError: (error) => {
			toast.error(
				error instanceof Error
					? error.message
					: "Could not update company. Please try again.",
			);
		},
	});
	const deleteCompanyMutation = useMutation({
		mutationFn: async (companyId: string) => {
			if (!accessToken) {
				throw new Error("Sign in again before deleting this company.");
			}

			return DeactivateWorkspaceCompany(accessToken, companyId);
		},
		onSuccess: (company) => {
			setCompanies((companies) =>
				companies.map((current) =>
					current.id === company.id ? company : current,
				),
			);
			queryClient.setQueryData(
				WorkspaceCompanyQueryKeys.company(company.id),
				company,
			);
			void queryClient.invalidateQueries({
				queryKey: WorkspaceCompanyQueryKeys.companies(),
			});
			toast.success("Company deleted.");
		},
		onError: (error) => {
			toast.error(
				error instanceof Error
					? error.message
					: "Could not delete company. Please try again.",
			);
		},
	});
	const addCompanyUserMutation = useMutation({
		mutationFn: async (user: WorkspaceCompanyUserRecord) => user,
		onSuccess: (user) => {
			setCompanyUsers((users) => [...users, user]);
			toast.success("Company user created.");
		},
		onError: () => {
			toast.error("Could not create company user. Please try again.");
		},
	});
	const updateCompanyUserMutation = useMutation({
		mutationFn: async (user: WorkspaceCompanyUserRecord) => user,
		onSuccess: (user) => {
			setCompanyUsers((users) =>
				users.map((current) => (current.id === user.id ? user : current)),
			);
			toast.success("Company user updated.");
		},
		onError: () => {
			toast.error("Could not update company user. Please try again.");
		},
	});
	const state = useMemo<WorkspaceCompanyManagementStoreState>(
		() => ({
			addCompany: (values) => addCompanyMutation.mutateAsync(values),
			addCompanyUser: (user) => addCompanyUserMutation.mutate(user),
			branches: branchesQuery.data ?? EmptyWorkspaceCompanyBranches,
			companies: companiesQuery.data ?? EmptyWorkspaceCompanies,
			deleteCompany: (companyId) =>
				deleteCompanyMutation.mutateAsync(companyId),
			isLoading:
				branchesQuery.isLoading ||
				companiesQuery.isLoading ||
				usersQuery.isLoading,
			isMutating:
				addCompanyMutation.isPending ||
				addCompanyUserMutation.isPending ||
				deleteCompanyMutation.isPending ||
				updateCompanyMutation.isPending ||
				updateCompanyUserMutation.isPending,
			updateCompany: (companyId, values) =>
				updateCompanyMutation.mutateAsync({ companyId, values }),
			updateCompanyUser: (user) => updateCompanyUserMutation.mutate(user),
			users: usersQuery.data ?? EmptyWorkspaceCompanyUsers,
		}),
		[
			addCompanyMutation,
			addCompanyUserMutation,
			branchesQuery.data,
			branchesQuery.isLoading,
			companiesQuery.data,
			companiesQuery.isLoading,
			deleteCompanyMutation,
			updateCompanyMutation,
			updateCompanyUserMutation,
			usersQuery.data,
			usersQuery.isLoading,
		],
	);

	return selector ? selector(state) : (state as TSelected);
}

export function useWorkspaceCompanyContext() {
	const params = useWorkspaceCompanyRouteParams();
	const companies = useWorkspaceCompanyManagementStore((state) => state.companies);
	const users = useWorkspaceCompanyManagementStore((state) => state.users);
	const branches = useWorkspaceCompanyManagementStore((state) => state.branches);
	const isLoading = useWorkspaceCompanyManagementStore(
		(state) => state.isLoading,
	);
	const companyQuery = useWorkspaceCompanyRecord(params.companyId);
	const company =
		companies.find((record) => record.id === params.companyId) ??
		companyQuery.data;
	const companyUsers = users.filter((user) =>
		user.companyAssignments.some(
			(assignment) => assignment.companyId === params.companyId,
		),
	);
	const companyBranches = branches.filter(
		(branch) => branch.companyId === params.companyId,
	);

	return {
		company,
		companyBranches,
		companyUsers,
		isLoading:
			isLoading ||
			Boolean(params.companyId && !company && companyQuery.isLoading),
		params,
	};
}

export function useWorkspaceCompaniesTable({
	branches,
	companies,
	users,
}: {
	branches: WorkspaceCompanyBranchRecord[];
	companies: WorkspaceCompanyRecord[];
	users: WorkspaceCompanyUserRecord[];
}) {
	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: 5,
	});
	const [query, setQueryState] = useState("");
	const [planFilter, setPlanFilterState] = useState<WorkspaceCompanyPlan | "All">(
		"All",
	);
	const [statusFilter, setStatusFilterState] = useState<
		WorkspaceCompanyStatus | "All"
	>("All");
	const [typeFilter, setTypeFilterState] = useState<
		WorkspaceCompanyType | "All"
	>("All");
	const [sorting, setSorting] = useState<SortingState>([
		{ id: "name", desc: false },
	]);
	const tableData = useMemo<WorkspaceCompanyTableRecord[]>(
		() =>
			companies.map((company) => ({
				...company,
				totalBranches:
					company.totalBranches ??
					branches.filter((branch) => branch.companyId === company.id).length,
				totalUsers:
					company.totalUsers ??
					users.filter((user) =>
						user.companyAssignments.some(
							(assignment) => assignment.companyId === company.id,
						),
					).length,
			})),
		[branches, companies, users],
	);
	const filteredCompanies = useMemo(
		() =>
			tableData.filter((company) => {
				const searchable = [
					company.name,
					company.email,
					company.companyType,
					company.plan,
					company.status,
					company.primaryContact,
				]
					.filter(Boolean)
					.join(" ")
					.toLowerCase();

				return (
					searchable.includes(query.toLowerCase()) &&
					(planFilter === "All" || company.plan === planFilter) &&
					(statusFilter === "All" || company.status === statusFilter) &&
					(typeFilter === "All" || company.companyType === typeFilter)
				);
			}),
		[planFilter, query, statusFilter, tableData, typeFilter],
	);
	const columns = useMemo<ColumnDef<WorkspaceCompanyTableRecord>[]>(
		() =>
			WorkspaceCompanyTableColumns.map((column) => {
				if (!("key" in column)) {
					return createActionColumn(column.label, column.className);
				}

				return createColumn(
					column.key,
					column.label,
					column.className,
				);
			}),
		[],
	);

	// eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table owns table state handlers.
	const table = useReactTable({
		data: filteredCompanies,
		columns,
		state: {
			pagination,
			sorting,
		},
		onPaginationChange: setPagination,
		onSortingChange: setSorting,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
	});

	function resetFilters() {
		setQueryState("");
		setPlanFilterState("All");
		setStatusFilterState("All");
		setTypeFilterState("All");
		table.setPageIndex(0);
	}

	function setQuery(value: string) {
		setQueryState(value);
		table.setPageIndex(0);
	}

	function setPlanFilter(value: WorkspaceCompanyPlan | "All") {
		setPlanFilterState(value);
		table.setPageIndex(0);
	}

	function setStatusFilter(value: WorkspaceCompanyStatus | "All") {
		setStatusFilterState(value);
		table.setPageIndex(0);
	}

	function setTypeFilter(value: WorkspaceCompanyType | "All") {
		setTypeFilterState(value);
		table.setPageIndex(0);
	}

	return {
		planFilter,
		planOptions: WorkspaceCompanyPlanOptions,
		query,
		resetFilters,
		setPlanFilter,
		setQuery,
		setStatusFilter,
		setTypeFilter,
		statusFilter,
		statusOptions: WorkspaceCompanyStatusOptions,
		table,
		typeFilter,
		typeOptions: WorkspaceCompanyTypeOptions,
	};
}

function createActionColumn<TRecord>(
	header: string,
	className: string,
): ColumnDef<TRecord> {
	return {
		id: "actions",
		header,
		enableSorting: false,
		meta: { className },
	};
}

function createColumn(
	key: WorkspaceCompanyTableColumnKey,
	header: string,
	className: string,
): ColumnDef<WorkspaceCompanyTableRecord> {
	return {
		accessorKey: key,
		header,
		sortingFn: "alphanumeric",
		meta: { className },
	};
}
