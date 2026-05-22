import Link from "next/link";
import {
	CheckCircle2,
	CircleOff,
	Edit3,
	Eye,
	Search,
} from "lucide-react";
import {
	WorkspaceCompaniesTablePaginationStorageKey,
	getWorkspaceCompanyEditHref,
	getWorkspaceCompanyHref,
} from "@/app/src/constants/modules/workspace-companies/WorkspaceCompanyConstants";
import {
	getNextWorkspaceCompanyStatus,
} from "@/app/src/data/modules/workspace/companies/WorkspaceCompanyData";
import {
	useWorkspaceCompaniesTable,
} from "@/app/src/hooks/modules/workspace/companies/useWorkspaceCompanyManagement";
import type {
	WorkspaceCompanyBranchRecord,
	WorkspaceCompanyPlan,
	WorkspaceCompanyRecord,
	WorkspaceCompanyStatus,
	WorkspaceCompanyTableRecord,
	WorkspaceCompanyType,
	WorkspaceCompanyUserRecord,
} from "@/app/src/types/modules/workspace-companies/WorkspaceCompanyTypes";
import { ModuleTable } from "@/app/src/ui/shared/module/module-table/ModuleTable";
import {
	WorkspaceCompanyAvatar,
	WorkspacePlanBadge,
	WorkspaceStatusBadge,
	WorkspaceTextBadge,
} from "./WorkspaceCompanyBadges";
import {
	WorkspaceCompaniesFilterBar,
	WorkspaceCompaniesFilterSelect,
	WorkspaceCompaniesIconLink,
	WorkspaceCompaniesResetButton,
	WorkspaceCompaniesSearchInput,
	WorkspaceCompaniesTableCell,
} from "./WorkspaceCompanyListPrimitives";

export function CompanyTable({
	branches,
	companies,
	isLoading,
	users,
	onStatusChange,
}: {
	branches: WorkspaceCompanyBranchRecord[];
	companies: WorkspaceCompanyRecord[];
	isLoading: boolean;
	users: WorkspaceCompanyUserRecord[];
	onStatusChange: (company: WorkspaceCompanyRecord) => void;
}) {
	const companyList = useWorkspaceCompaniesTable({
		branches,
		companies,
		users,
	});

	return (
		<div className="overflow-hidden rounded-lg border border-darknavy/10 bg-white shadow-sm">
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

			<ModuleTable
				emptyDescription="Try adjusting search, status, type, or plan filters."
				emptyIcon={<Search className="h-5 w-5" aria-hidden="true" />}
				emptyTitle="No companies found"
				isLoading={isLoading}
				minWidthClassName="min-w-[72rem]"
				paginationStorageKey={WorkspaceCompaniesTablePaginationStorageKey}
				table={companyList.table}
				renderRow={({ id, original }) => (
					<CompanyTableRow
						key={id}
						company={original}
						onStatusChange={onStatusChange}
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
		<WorkspaceCompaniesFilterBar className="lg:grid-cols-[1fr_11rem_11rem_15rem_auto]">
			<WorkspaceCompaniesSearchInput
				value={query}
				onChange={onQueryChange}
				placeholder="Search companies"
			/>
			<WorkspaceCompaniesFilterSelect
				label="Status"
				value={statusFilter}
				options={statusOptions}
				onChange={(value) =>
					onStatusFilterChange(value as WorkspaceCompanyStatus | "All")
				}
			/>
			<WorkspaceCompaniesFilterSelect
				label="Type"
				value={typeFilter}
				options={typeOptions}
				onChange={(value) =>
					onTypeFilterChange(value as WorkspaceCompanyType | "All")
				}
			/>
			<WorkspaceCompaniesFilterSelect
				label="Plan"
				value={planFilter}
				options={planOptions}
				onChange={(value) =>
					onPlanFilterChange(value as WorkspaceCompanyPlan | "All")
				}
			/>
			<WorkspaceCompaniesResetButton onClick={onResetFilters} />
		</WorkspaceCompaniesFilterBar>
	);
}

function CompanyTableRow({
	company,
	onStatusChange,
}: {
	company: WorkspaceCompanyTableRecord;
	onStatusChange: (company: WorkspaceCompanyRecord) => void;
}) {
	return (
		<tr className="module-table-row">
			<td className="px-5 py-4">
				<Link
					href={getWorkspaceCompanyHref(company.id)}
					className="flex min-w-0 items-center gap-3 rounded-lg transition hover:text-skyblue focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-skyblue/20"
				>
					<WorkspaceCompanyAvatar
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
			<WorkspaceCompaniesTableCell>
				<WorkspaceTextBadge>{company.totalBranches}</WorkspaceTextBadge>
			</WorkspaceCompaniesTableCell>
			<WorkspaceCompaniesTableCell>
				<WorkspaceTextBadge>{company.totalUsers}</WorkspaceTextBadge>
			</WorkspaceCompaniesTableCell>
			<WorkspaceCompaniesTableCell>{company.companyType}</WorkspaceCompaniesTableCell>
			<WorkspaceCompaniesTableCell>
				<WorkspacePlanBadge plan={company.plan} />
			</WorkspaceCompaniesTableCell>
			<WorkspaceCompaniesTableCell>
				<WorkspaceStatusBadge status={company.status} />
			</WorkspaceCompaniesTableCell>
			<WorkspaceCompaniesTableCell align="center">
				<CompanyRecordActions
					company={company}
					onStatusChange={() => onStatusChange(company)}
				/>
			</WorkspaceCompaniesTableCell>
		</tr>
	);
}

function CompanyRecordActions({
	company,
	onStatusChange,
}: {
	company: WorkspaceCompanyTableRecord;
	onStatusChange: () => void;
}) {
	const nextStatus = getNextWorkspaceCompanyStatus(company.status);
	const StatusIcon = nextStatus === "Inactive" ? CircleOff : CheckCircle2;

	return (
		<div className="flex items-center justify-center gap-1.5">
			<IconLink href={getWorkspaceCompanyHref(company.id)} label={`Open ${company.name}`}>
				<Eye className="h-4 w-4" aria-hidden="true" />
			</IconLink>
			<IconLink href={getWorkspaceCompanyEditHref(company.id)} label={`Edit ${company.name}`}>
				<Edit3 className="h-4 w-4" aria-hidden="true" />
			</IconLink>
			<button
				type="button"
				onClick={onStatusChange}
				aria-label={`Set ${company.name} as ${nextStatus.toLowerCase()}`}
				className={
					nextStatus === "Inactive"
						? "flex h-10 w-10 items-center justify-center rounded-lg text-coralpink transition hover:bg-coralpink/10 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-coralpink/15"
						: "flex h-10 w-10 items-center justify-center rounded-lg text-emerald-700 transition hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/15"
				}
			>
				<StatusIcon className="h-4 w-4" aria-hidden="true" />
			</button>
		</div>
	);
}

function IconLink({
	children,
	href,
	label,
}: {
	children: React.ReactNode;
	href: string;
	label: string;
}) {
	return (
		<WorkspaceCompaniesIconLink href={href} label={label}>
			{children}
		</WorkspaceCompaniesIconLink>
	);
}
