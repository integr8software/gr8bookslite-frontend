import Link from "next/link";
import type { ReactNode } from "react";
import {
	Search,
} from "lucide-react";
import {
	WorkspaceCompaniesTablePaginationStorageKey,
	getWorkspaceCompanyEditHref,
	getWorkspaceCompanyHref,
} from "@/app/src/constants/workspace/WorkspaceCompanyConstants";
import {
	useWorkspaceCompaniesTable,
} from "@/app/src/hooks/workspace/companies/useWorkspaceCompanyManagement";
import type {
	WorkspaceCompanyBranchRecord,
	WorkspaceCompanyPlan,
	WorkspaceCompanyRecord,
	WorkspaceCompanyStatus,
	WorkspaceCompanyTableRecord,
	WorkspaceCompanyType,
	WorkspaceCompanyUserRecord,
} from "@/app/src/types/workspace/WorkspaceCompanyTypes";
import { ModuleTable } from "@/app/src/ui/shared/module/module-table/ModuleTable";
import {
	ModuleTableActionButton,
	ModuleTableActionLink,
	ModuleTableActions,
} from "@/app/src/ui/shared/module/ModuleTableActions";
import {
	ModuleTableFilterSelect,
	ModuleTableResetButton,
	ModuleTableSearch,
	ModuleTableToolbar,
} from "@/app/src/ui/shared/module/ModuleTableToolbar";
import {
	WorkspaceManagementCompanyAvatar,
	WorkspaceManagementPlanBadge,
	WorkspaceManagementStatusBadge,
	WorkspaceManagementSummaryBadge,
} from "@/app/src/ui/workspace/WorkspaceManagementBadges";

export function CompanyTable({
	branches,
	companies,
	isLoading,
	users,
	onDeactivate,
}: {
	branches: WorkspaceCompanyBranchRecord[];
	companies: WorkspaceCompanyRecord[];
	isLoading: boolean;
	users: WorkspaceCompanyUserRecord[];
	onDeactivate: (company: WorkspaceCompanyRecord) => void;
}) {
	const companyList = useWorkspaceCompaniesTable({
		branches,
		companies,
		users,
	});

	return (
		<div className="overflow-hidden rounded-lg border border-darknavy/10 bg-white shadow-sm">
			<ModuleTable
				variant="embedded"
				emptyDescription="Try adjusting search, status, type, or plan filters."
				emptyIcon={<Search className="h-5 w-5" aria-hidden="true" />}
				emptyTitle="No companies found"
				isLoading={isLoading}
				minWidthClassName="min-w-[72rem]"
				paginationStorageKey={WorkspaceCompaniesTablePaginationStorageKey}
				table={companyList.table}
				toolbar={
					<CompanyTableFilters
						planFilter={companyList.planFilter}
						planOptions={companyList.planOptions}
						query={companyList.query}
						statusFilter={companyList.statusFilter}
						statusOptions={companyList.statusOptions}
						typeFilter={companyList.typeFilter}
						typeOptions={companyList.typeOptions}
						onPlanFilterChange={companyList.setPlanFilter}
						onQueryChange={companyList.setQuery}
						onResetFilters={companyList.resetFilters}
						onStatusFilterChange={companyList.setStatusFilter}
						onTypeFilterChange={companyList.setTypeFilter}
					/>
				}
				renderRow={({ id, original }) => (
					<CompanyTableRow
						key={id}
						company={original}
						onDeactivate={onDeactivate}
					/>
				)}
			/>
		</div>
	);
}

function CompanyTableFilters({
	planFilter,
	planOptions,
	query,
	statusFilter,
	statusOptions,
	typeFilter,
	typeOptions,
	onPlanFilterChange,
	onQueryChange,
	onResetFilters,
	onStatusFilterChange,
	onTypeFilterChange,
}: {
	planFilter: WorkspaceCompanyPlan | "All";
	planOptions: readonly WorkspaceCompanyPlan[];
	query: string;
	statusFilter: WorkspaceCompanyStatus | "All";
	statusOptions: readonly WorkspaceCompanyStatus[];
	typeFilter: WorkspaceCompanyType | "All";
	typeOptions: readonly WorkspaceCompanyType[];
	onPlanFilterChange: (value: WorkspaceCompanyPlan | "All") => void;
	onQueryChange: (value: string) => void;
	onResetFilters: () => void;
	onStatusFilterChange: (value: WorkspaceCompanyStatus | "All") => void;
	onTypeFilterChange: (value: WorkspaceCompanyType | "All") => void;
}) {
	return (
		<ModuleTableToolbar className="rounded-none border-x-0 border-t-0 shadow-none lg:grid-cols-[minmax(24rem,2.5fr)_minmax(11rem,1fr)_minmax(11rem,1fr)_minmax(15rem,1fr)_minmax(11rem,1fr)]">
			<ModuleTableSearch
				label="Search companies"
				value={query}
				onChange={onQueryChange}
				placeholder="Search companies"
			/>
			<ModuleTableFilterSelect
				label="Status"
				value={statusFilter}
				options={getFilterOptions(statusOptions)}
				onChange={(value) =>
					onStatusFilterChange(value as WorkspaceCompanyStatus | "All")
				}
			/>
			<ModuleTableFilterSelect
				label="Type"
				value={typeFilter}
				options={getFilterOptions(typeOptions)}
				onChange={(value) =>
					onTypeFilterChange(value as WorkspaceCompanyType | "All")
				}
			/>
			<ModuleTableFilterSelect
				label="Plan"
				value={planFilter}
				options={getFilterOptions(planOptions)}
				onChange={(value) =>
					onPlanFilterChange(value as WorkspaceCompanyPlan | "All")
				}
			/>
			<ModuleTableResetButton onClick={onResetFilters}>
				Reset
			</ModuleTableResetButton>
		</ModuleTableToolbar>
	);
}

function CompanyTableRow({
	company,
	onDeactivate,
}: {
	company: WorkspaceCompanyTableRecord;
	onDeactivate: (company: WorkspaceCompanyRecord) => void;
}) {
	return (
		<tr className="module-table-row">
			<td className="px-5 py-4">
				<Link
					href={getWorkspaceCompanyHref(company.id)}
					className="flex min-w-0 items-center gap-3 rounded-lg transition hover:text-skyblue focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-skyblue/20"
				>
					<WorkspaceManagementCompanyAvatar
						initials={company.initials}
						logoUrl={company.logoUrl}
						name={company.name}
					/>
					<span className="min-w-0">
						<span className="block truncate text-sm font-semibold text-darknavy">
							{company.name}
						</span>
						<span className="mt-1 block truncate text-sm text-darknavy/50">
							{company.email}
						</span>
					</span>
				</Link>
			</td>
			<CompanyTableCell>
				<WorkspaceManagementSummaryBadge>{company.totalBranches}</WorkspaceManagementSummaryBadge>
			</CompanyTableCell>
			<CompanyTableCell>
				<WorkspaceManagementSummaryBadge>{company.totalUsers}</WorkspaceManagementSummaryBadge>
			</CompanyTableCell>
			<CompanyTableCell>{company.companyType}</CompanyTableCell>
			<CompanyTableCell>
				<WorkspaceManagementPlanBadge plan={company.plan} />
			</CompanyTableCell>
			<CompanyTableCell>
				<WorkspaceManagementStatusBadge status={company.status} />
			</CompanyTableCell>
			<CompanyTableCell align="center">
				<CompanyRecordActions
					company={company}
					onDeactivate={() => onDeactivate(company)}
				/>
			</CompanyTableCell>
		</tr>
	);
}

function CompanyTableCell({
	align = "left",
	children,
}: {
	align?: "center" | "left";
	children: ReactNode;
}) {
	return (
		<td
			className={`px-4 py-4 align-middle text-sm text-darknavy first:pl-5 last:pr-5 ${
				align === "center" ? "text-center" : "text-left"
			}`}
		>
			{children}
		</td>
	);
}

function getFilterOptions(options: readonly string[]) {
	return [
		{ label: "All", value: "All" },
		...options.map((option) => ({ label: option, value: option })),
	];
}

function CompanyRecordActions({
	company,
	onDeactivate,
}: {
	company: WorkspaceCompanyTableRecord;
	onDeactivate: () => void;
}) {
	return (
		<ModuleTableActions className="justify-center">
			<ModuleTableActionLink
				variant="view"
				href={getWorkspaceCompanyHref(company.id)}
				label={`Open ${company.name}`}
			/>
			<ModuleTableActionLink
				variant="edit"
				href={getWorkspaceCompanyEditHref(company.id)}
				label={`Edit ${company.name}`}
			/>
			<ModuleTableActionButton
				variant="inactive"
				onClick={onDeactivate}
				label={`Deactivate ${company.name}`}
			/>
		</ModuleTableActions>
	);
}
