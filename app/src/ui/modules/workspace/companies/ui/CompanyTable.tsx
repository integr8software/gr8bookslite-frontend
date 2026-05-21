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
				minWidthClassName="min-w-[80rem]"
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
		<div className="grid gap-3 border-b border-darknavy/10 bg-white p-4 lg:grid-cols-[1fr_12rem_12rem_14rem_auto]">
			<label className="flex min-h-11 items-center gap-2 rounded-lg border border-darknavy/10 px-3 text-sm text-darknavy shadow-sm">
				<Search className="h-4 w-4 text-darknavy/35" aria-hidden="true" />
				<input
					value={query}
					onChange={(event) => onQueryChange(event.target.value)}
					className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-darknavy/35"
					placeholder="Search companies"
				/>
			</label>
			<FilterSelect
				label="Status"
				value={statusFilter}
				options={statusOptions}
				onChange={(value) =>
					onStatusFilterChange(value as WorkspaceCompanyStatus | "All")
				}
			/>
			<FilterSelect
				label="Type"
				value={typeFilter}
				options={typeOptions}
				onChange={(value) =>
					onTypeFilterChange(value as WorkspaceCompanyType | "All")
				}
			/>
			<FilterSelect
				label="Plan"
				value={planFilter}
				options={planOptions}
				onChange={(value) =>
					onPlanFilterChange(value as WorkspaceCompanyPlan | "All")
				}
			/>
			<button
				type="button"
				onClick={onResetFilters}
				className="inline-flex h-11 items-center justify-center rounded-lg border border-darknavy/10 px-4 text-sm font-semibold text-darknavy transition hover:bg-skyblue/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/35"
			>
				Reset
			</button>
		</div>
	);
}

function FilterSelect({
	label,
	options,
	value,
	onChange,
}: {
	label: string;
	options: readonly string[];
	value: string;
	onChange: (value: string) => void;
}) {
	return (
		<label className="grid gap-1">
			<span className="text-xs font-semibold uppercase tracking-wide text-darknavy/45">
				{label}
			</span>
			<select
				value={value}
				onChange={(event) => onChange(event.target.value)}
				className="h-11 rounded-lg border border-darknavy/10 bg-white px-3 text-sm font-semibold text-darknavy outline-none transition focus:border-skyblue focus:ring-2 focus:ring-skyblue/20"
			>
				<option value="All">All</option>
				{options.map((option) => (
					<option key={option} value={option}>
						{option}
					</option>
				))}
			</select>
		</label>
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
			<td className="px-4 py-3">
				<Link
					href={getWorkspaceCompanyHref(company.id)}
					className="flex min-w-0 items-center gap-3 rounded-md transition hover:text-skyblue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/35"
				>
					<WorkspaceCompanyAvatar
						initials={company.initials}
						logoUrl={company.logoUrl}
						name={company.name}
					/>
					<span className="min-w-0">
						<span className="block truncate text-xs font-semibold text-darknavy">
							{company.name}
						</span>
						<span className="mt-1 block truncate text-xs text-darknavy/50">
							{company.email}
						</span>
					</span>
				</Link>
			</td>
			<CompanyTableCell>
				<WorkspaceTextBadge>{company.totalBranches}</WorkspaceTextBadge>
			</CompanyTableCell>
			<CompanyTableCell>
				<WorkspaceTextBadge>{company.totalUsers}</WorkspaceTextBadge>
			</CompanyTableCell>
			<CompanyTableCell>{company.companyType}</CompanyTableCell>
			<CompanyTableCell>
				<WorkspacePlanBadge plan={company.plan} />
			</CompanyTableCell>
			<CompanyTableCell>
				<WorkspaceStatusBadge status={company.status} />
			</CompanyTableCell>
			<CompanyTableCell align="center">
				<CompanyRecordActions
					company={company}
					onStatusChange={() => onStatusChange(company)}
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
	children: React.ReactNode;
}) {
	return (
		<td
			className={`px-4 py-3 align-middle text-xs text-darknavy first:pl-5 last:pr-5 ${
				align === "center" ? "text-center" : "text-left"
			}`}
		>
			{children}
		</td>
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
		<div className="flex items-center justify-center gap-1">
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
						? "flex h-9 w-9 items-center justify-center rounded-md text-coralpink transition hover:bg-coralpink/10"
						: "flex h-9 w-9 items-center justify-center rounded-md text-emerald-700 transition hover:bg-emerald-50"
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
		<Link
			href={href}
			aria-label={label}
			className="flex h-9 w-9 items-center justify-center rounded-md text-darknavy/65 transition hover:bg-darknavy/5"
		>
			{children}
		</Link>
	);
}
