"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
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
	WorkspaceBranchUserRoleOptions,
	WorkspaceBranchUserTableColumns,
	WorkspaceCompanyBranchKindOptions,
	WorkspaceCompanyBranchTableColumns,
	WorkspaceCompanyPlanOptions,
	WorkspaceCompanyStatusOptions,
	WorkspaceCompanyTableColumns,
	WorkspaceCompanyTypeOptions,
	WorkspaceCompanyUserTableColumns,
} from "@/app/src/constants/modules/workspace-companies/WorkspaceCompanyConstants";
import {
	MockWorkspaceBranchUsers,
	MockWorkspaceCompanies,
	MockWorkspaceCompanyBranches,
	MockWorkspaceCompanyUsers,
} from "@/app/src/data/modules/workspace/companies/WorkspaceCompanyData";
import { WorkspaceCompanyQueryKeys } from "@/app/src/services/modules/workspace/companies/WorkspaceCompanyQueryKeys";
import type {
	WorkspaceBranchUserRecord,
	WorkspaceBranchUserRole,
	WorkspaceBranchUserTableColumnKey,
	WorkspaceBranchUserTableRecord,
	WorkspaceCompanyBranchKind,
	WorkspaceCompanyBranchRecord,
	WorkspaceCompanyBranchTableColumnKey,
	WorkspaceCompanyBranchTableRecord,
	WorkspaceCompanyPlan,
	WorkspaceCompanyRecord,
	WorkspaceCompanyStatus,
	WorkspaceCompanyTableColumnKey,
	WorkspaceCompanyTableRecord,
	WorkspaceCompanyType,
	WorkspaceCompanyUserRecord,
	WorkspaceCompanyUserTableColumnKey,
	WorkspaceCompanyUserTableRecord,
} from "@/app/src/types/modules/workspace-companies/WorkspaceCompanyTypes";

type WorkspaceCompanyManagementStoreState = {
	branchUsers: WorkspaceBranchUserRecord[];
	branches: WorkspaceCompanyBranchRecord[];
	companies: WorkspaceCompanyRecord[];
	isLoading: boolean;
	isMutating: boolean;
	users: WorkspaceCompanyUserRecord[];
	addBranch: (branch: WorkspaceCompanyBranchRecord) => void;
	addBranchUser: (user: WorkspaceBranchUserRecord) => void;
	addCompany: (company: WorkspaceCompanyRecord) => void;
	addCompanyUser: (user: WorkspaceCompanyUserRecord) => void;
	updateBranch: (branch: WorkspaceCompanyBranchRecord) => void;
	updateBranchUser: (user: WorkspaceBranchUserRecord) => void;
	updateCompany: (company: WorkspaceCompanyRecord) => void;
	updateCompanyUser: (user: WorkspaceCompanyUserRecord) => void;
};

export function useWorkspaceCompanyManagementStore<
	TSelected = WorkspaceCompanyManagementStoreState,
>(selector?: (state: WorkspaceCompanyManagementStoreState) => TSelected) {
	const queryClient = useQueryClient();
	const companiesQuery = useQuery({
		queryKey: WorkspaceCompanyQueryKeys.companies(),
		queryFn: async () => MockWorkspaceCompanies,
		initialData: MockWorkspaceCompanies,
	});
	const usersQuery = useQuery({
		queryKey: WorkspaceCompanyQueryKeys.users(),
		queryFn: async () => MockWorkspaceCompanyUsers,
		initialData: MockWorkspaceCompanyUsers,
	});
	const branchesQuery = useQuery({
		queryKey: WorkspaceCompanyQueryKeys.branches(),
		queryFn: async () => MockWorkspaceCompanyBranches,
		initialData: MockWorkspaceCompanyBranches,
	});
	const branchUsersQuery = useQuery({
		queryKey: WorkspaceCompanyQueryKeys.branchUsers(),
		queryFn: async () => MockWorkspaceBranchUsers,
		initialData: MockWorkspaceBranchUsers,
	});

	function setCompanies(
		updater: (companies: WorkspaceCompanyRecord[]) => WorkspaceCompanyRecord[],
	) {
		queryClient.setQueryData<WorkspaceCompanyRecord[]>(
			WorkspaceCompanyQueryKeys.companies(),
			(current = MockWorkspaceCompanies) => updater(current),
		);
	}

	function setCompanyUsers(
		updater: (
			users: WorkspaceCompanyUserRecord[],
		) => WorkspaceCompanyUserRecord[],
	) {
		queryClient.setQueryData<WorkspaceCompanyUserRecord[]>(
			WorkspaceCompanyQueryKeys.users(),
			(current = MockWorkspaceCompanyUsers) => updater(current),
		);
	}

	function setBranches(
		updater: (
			branches: WorkspaceCompanyBranchRecord[],
		) => WorkspaceCompanyBranchRecord[],
	) {
		queryClient.setQueryData<WorkspaceCompanyBranchRecord[]>(
			WorkspaceCompanyQueryKeys.branches(),
			(current = MockWorkspaceCompanyBranches) => updater(current),
		);
	}

	function setBranchUsers(
		updater: (
			users: WorkspaceBranchUserRecord[],
		) => WorkspaceBranchUserRecord[],
	) {
		queryClient.setQueryData<WorkspaceBranchUserRecord[]>(
			WorkspaceCompanyQueryKeys.branchUsers(),
			(current = MockWorkspaceBranchUsers) => updater(current),
		);
	}

	const addCompanyMutation = useMutation({
		mutationFn: async (company: WorkspaceCompanyRecord) => company,
		onSuccess: (company) => {
			setCompanies((companies) => [...companies, company]);
			toast.success("Company created.");
		},
		onError: () => {
			toast.error("Could not create company. Please try again.");
		},
	});
	const updateCompanyMutation = useMutation({
		mutationFn: async (company: WorkspaceCompanyRecord) => company,
		onSuccess: (company) => {
			setCompanies((companies) =>
				companies.map((current) =>
					current.id === company.id ? company : current,
				),
			);
			toast.success("Company updated.");
		},
		onError: () => {
			toast.error("Could not update company. Please try again.");
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
	const addBranchMutation = useMutation({
		mutationFn: async (branch: WorkspaceCompanyBranchRecord) => branch,
		onSuccess: (branch) => {
			setBranches((branches) => [...branches, branch]);
			toast.success("Branch created.");
		},
		onError: () => {
			toast.error("Could not create branch. Please try again.");
		},
	});
	const updateBranchMutation = useMutation({
		mutationFn: async (branch: WorkspaceCompanyBranchRecord) => branch,
		onSuccess: (branch) => {
			setBranches((branches) =>
				branches.map((current) =>
					current.id === branch.id ? branch : current,
				),
			);
			toast.success("Branch updated.");
		},
		onError: () => {
			toast.error("Could not update branch. Please try again.");
		},
	});
	const addBranchUserMutation = useMutation({
		mutationFn: async (user: WorkspaceBranchUserRecord) => user,
		onSuccess: (user) => {
			setBranchUsers((users) => [...users, user]);
			toast.success("Branch user created.");
		},
		onError: () => {
			toast.error("Could not create branch user. Please try again.");
		},
	});
	const updateBranchUserMutation = useMutation({
		mutationFn: async (user: WorkspaceBranchUserRecord) => user,
		onSuccess: (user) => {
			setBranchUsers((users) =>
				users.map((current) => (current.id === user.id ? user : current)),
			);
			toast.success("Branch user updated.");
		},
		onError: () => {
			toast.error("Could not update branch user. Please try again.");
		},
	});
	const state = useMemo<WorkspaceCompanyManagementStoreState>(
		() => ({
			addBranch: (branch) => addBranchMutation.mutate(branch),
			addBranchUser: (user) => addBranchUserMutation.mutate(user),
			addCompany: (company) => addCompanyMutation.mutate(company),
			addCompanyUser: (user) => addCompanyUserMutation.mutate(user),
			branchUsers: branchUsersQuery.data,
			branches: branchesQuery.data,
			companies: companiesQuery.data,
			isLoading:
				branchUsersQuery.isLoading ||
				branchesQuery.isLoading ||
				companiesQuery.isLoading ||
				usersQuery.isLoading,
			isMutating:
				addBranchMutation.isPending ||
				addBranchUserMutation.isPending ||
				addCompanyMutation.isPending ||
				addCompanyUserMutation.isPending ||
				updateBranchMutation.isPending ||
				updateBranchUserMutation.isPending ||
				updateCompanyMutation.isPending ||
				updateCompanyUserMutation.isPending,
			updateBranch: (branch) => updateBranchMutation.mutate(branch),
			updateBranchUser: (user) => updateBranchUserMutation.mutate(user),
			updateCompany: (company) => updateCompanyMutation.mutate(company),
			updateCompanyUser: (user) => updateCompanyUserMutation.mutate(user),
			users: usersQuery.data,
		}),
		[
			addBranchMutation,
			addBranchUserMutation,
			addCompanyMutation,
			addCompanyUserMutation,
			branchUsersQuery.data,
			branchUsersQuery.isLoading,
			branchesQuery.data,
			branchesQuery.isLoading,
			companiesQuery.data,
			companiesQuery.isLoading,
			updateBranchMutation,
			updateBranchUserMutation,
			updateCompanyMutation,
			updateCompanyUserMutation,
			usersQuery.data,
			usersQuery.isLoading,
		],
	);

	return selector ? selector(state) : (state as TSelected);
}

export function useWorkspaceCompanyContext() {
	const params = useParams<{ branchId?: string; companyId?: string }>();
	const companies = useWorkspaceCompanyManagementStore((state) => state.companies);
	const users = useWorkspaceCompanyManagementStore((state) => state.users);
	const branches = useWorkspaceCompanyManagementStore((state) => state.branches);
	const branchUsers = useWorkspaceCompanyManagementStore(
		(state) => state.branchUsers,
	);
	const isLoading = useWorkspaceCompanyManagementStore(
		(state) => state.isLoading,
	);
	const company = companies.find((record) => record.id === params.companyId);
	const companyUsers = users.filter((user) => user.companyId === params.companyId);
	const companyBranches = branches.filter(
		(branch) => branch.companyId === params.companyId,
	);
	const companyBranchUsers = branchUsers.filter(
		(user) => user.companyId === params.companyId,
	);
	const branch = companyBranches.find((record) => record.id === params.branchId);
	const selectedBranchUsers = branchUsers.filter(
		(user) =>
			user.companyId === params.companyId && user.branchId === params.branchId,
	);

	return {
		branch,
		company,
		companyBranches,
		companyBranchUsers,
		companyUsers,
		isLoading,
		params,
		selectedBranchUsers,
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
				totalBranches: branches.filter(
					(branch) => branch.companyId === company.id,
				).length,
				totalUsers: users.filter((user) => user.companyId === company.id)
					.length,
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

				return createColumn<WorkspaceCompanyTableRecord>(
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

export function useWorkspaceCompanyUsersTable(
	users: WorkspaceCompanyUserRecord[],
) {
	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: 5,
	});
	const [query, setQueryState] = useState("");
	const [statusFilter, setStatusFilterState] = useState<
		WorkspaceCompanyStatus | "All"
	>("All");
	const [sorting, setSorting] = useState<SortingState>([
		{ id: "name", desc: false },
	]);
	const filteredUsers = useMemo(
		() =>
			users.filter((user) => {
				const searchable = [
					user.name,
					user.email,
					user.contactNumber,
					user.status,
					user.lastLogin,
				]
					.filter(Boolean)
					.join(" ")
					.toLowerCase();

				return (
					searchable.includes(query.toLowerCase()) &&
					(statusFilter === "All" || user.status === statusFilter)
				);
			}),
		[query, statusFilter, users],
	);
	const columns = useMemo<ColumnDef<WorkspaceCompanyUserTableRecord>[]>(
		() =>
			WorkspaceCompanyUserTableColumns.map((column) => {
				if (!("key" in column)) {
					return createActionColumn(column.label, column.className);
				}

				return createColumn<WorkspaceCompanyUserTableRecord>(
					column.key,
					column.label,
					column.className,
				);
			}),
		[],
	);

	// eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table owns table state handlers.
	const table = useReactTable({
		data: filteredUsers,
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
		setStatusFilterState("All");
		table.setPageIndex(0);
	}

	function setQuery(value: string) {
		setQueryState(value);
		table.setPageIndex(0);
	}

	function setStatusFilter(value: WorkspaceCompanyStatus | "All") {
		setStatusFilterState(value);
		table.setPageIndex(0);
	}

	return {
		query,
		resetFilters,
		setQuery,
		setStatusFilter,
		statusFilter,
		statusOptions: WorkspaceCompanyStatusOptions,
		table,
	};
}

export function useWorkspaceCompanyBranchesTable({
	branches,
	branchUsers,
}: {
	branches: WorkspaceCompanyBranchRecord[];
	branchUsers: WorkspaceBranchUserRecord[];
}) {
	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: 5,
	});
	const [query, setQueryState] = useState("");
	const [kindFilter, setKindFilterState] = useState<
		WorkspaceCompanyBranchKind | "All"
	>("All");
	const [statusFilter, setStatusFilterState] = useState<
		WorkspaceCompanyStatus | "All"
	>("All");
	const [sorting, setSorting] = useState<SortingState>([
		{ id: "name", desc: false },
	]);
	const tableData = useMemo<WorkspaceCompanyBranchTableRecord[]>(
		() =>
			branches.map((branch) => ({
				...branch,
				totalUsers: branchUsers.filter(
					(user) => user.branchId === branch.id,
				).length,
			})),
		[branches, branchUsers],
	);
	const filteredBranches = useMemo(
		() =>
			tableData.filter((branch) => {
				const searchable = [
					branch.code,
					branch.name,
					branch.branchType,
					branch.status,
					branch.tin,
					branch.email,
				]
					.filter(Boolean)
					.join(" ")
					.toLowerCase();

				return (
					searchable.includes(query.toLowerCase()) &&
					(kindFilter === "All" || branch.branchType === kindFilter) &&
					(statusFilter === "All" || branch.status === statusFilter)
				);
			}),
		[kindFilter, query, statusFilter, tableData],
	);
	const columns = useMemo<ColumnDef<WorkspaceCompanyBranchTableRecord>[]>(
		() =>
			WorkspaceCompanyBranchTableColumns.map((column) => {
				if (!("key" in column)) {
					return createActionColumn(column.label, column.className);
				}

				return createColumn<WorkspaceCompanyBranchTableRecord>(
					column.key,
					column.label,
					column.className,
				);
			}),
		[],
	);

	// eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table owns table state handlers.
	const table = useReactTable({
		data: filteredBranches,
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
		setKindFilterState("All");
		setStatusFilterState("All");
		table.setPageIndex(0);
	}

	function setKindFilter(value: WorkspaceCompanyBranchKind | "All") {
		setKindFilterState(value);
		table.setPageIndex(0);
	}

	function setQuery(value: string) {
		setQueryState(value);
		table.setPageIndex(0);
	}

	function setStatusFilter(value: WorkspaceCompanyStatus | "All") {
		setStatusFilterState(value);
		table.setPageIndex(0);
	}

	return {
		kindFilter,
		kindOptions: WorkspaceCompanyBranchKindOptions,
		query,
		resetFilters,
		setKindFilter,
		setQuery,
		setStatusFilter,
		statusFilter,
		statusOptions: WorkspaceCompanyStatusOptions,
		table,
	};
}

export function useWorkspaceBranchUsersTable(
	users: WorkspaceBranchUserRecord[],
) {
	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: 5,
	});
	const [query, setQueryState] = useState("");
	const [roleFilter, setRoleFilterState] = useState<
		WorkspaceBranchUserRole | "All"
	>("All");
	const [statusFilter, setStatusFilterState] = useState<
		WorkspaceCompanyStatus | "All"
	>("All");
	const [sorting, setSorting] = useState<SortingState>([
		{ id: "name", desc: false },
	]);
	const filteredUsers = useMemo(
		() =>
			users.filter((user) => {
				const searchable = [
					user.name,
					user.email,
					user.contactNumber,
					user.role,
					user.status,
					user.assignedAt,
				]
					.filter(Boolean)
					.join(" ")
					.toLowerCase();

				return (
					searchable.includes(query.toLowerCase()) &&
					(roleFilter === "All" || user.role === roleFilter) &&
					(statusFilter === "All" || user.status === statusFilter)
				);
			}),
		[query, roleFilter, statusFilter, users],
	);
	const columns = useMemo<ColumnDef<WorkspaceBranchUserTableRecord>[]>(
		() =>
			WorkspaceBranchUserTableColumns.map((column) => {
				if (!("key" in column)) {
					return createActionColumn(column.label, column.className);
				}

				return createColumn<WorkspaceBranchUserTableRecord>(
					column.key,
					column.label,
					column.className,
				);
			}),
		[],
	);

	// eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table owns table state handlers.
	const table = useReactTable({
		data: filteredUsers,
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
		setRoleFilterState("All");
		setStatusFilterState("All");
		table.setPageIndex(0);
	}

	function setQuery(value: string) {
		setQueryState(value);
		table.setPageIndex(0);
	}

	function setRoleFilter(value: WorkspaceBranchUserRole | "All") {
		setRoleFilterState(value);
		table.setPageIndex(0);
	}

	function setStatusFilter(value: WorkspaceCompanyStatus | "All") {
		setStatusFilterState(value);
		table.setPageIndex(0);
	}

	return {
		query,
		resetFilters,
		roleFilter,
		roleOptions: WorkspaceBranchUserRoleOptions,
		setQuery,
		setRoleFilter,
		setStatusFilter,
		statusFilter,
		statusOptions: WorkspaceCompanyStatusOptions,
		table,
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

function createColumn<TRecord>(
	key:
		| (keyof TRecord & string)
		| WorkspaceCompanyTableColumnKey
		| WorkspaceCompanyUserTableColumnKey
		| WorkspaceCompanyBranchTableColumnKey
		| WorkspaceBranchUserTableColumnKey,
	header: string,
	className: string,
): ColumnDef<TRecord> {
	return {
		accessorKey: key,
		header,
		sortingFn: "alphanumeric",
		meta: { className },
	};
}
