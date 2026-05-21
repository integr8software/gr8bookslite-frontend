"use client";

import Link from "next/link";
import { Building2, Edit3, GitBranch, Plus, Users } from "lucide-react";
import {
	WorkspaceCompaniesHref,
	getWorkspaceCompanyBranchesHref,
	getWorkspaceCompanyEditHref,
	getWorkspaceCompanyUsersHref,
} from "@/app/src/constants/modules/workspace-companies/WorkspaceCompanyConstants";
import {
	useWorkspaceCompanyContext,
} from "@/app/src/hooks/modules/workspace/companies/useWorkspaceCompanyManagement";
import {
	ModuleHeader,
	moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";
import {
	WorkspaceCompanyAvatar,
	WorkspacePlanBadge,
	WorkspaceStatusBadge,
	WorkspaceTextBadge,
} from "./WorkspaceCompanyBadges";
import { WorkspaceCompanyNotFound } from "./WorkspaceCompanyNotFound";

export function WorkspaceCompanyDashboard() {
	const {
		company,
		companyBranches,
		companyBranchUsers,
		companyUsers,
	} = useWorkspaceCompanyContext();

	if (!company) {
		return (
			<WorkspaceCompanyNotFound
				href={WorkspaceCompaniesHref}
				title="Company Not Found"
			/>
		);
	}

	const usersHref = getWorkspaceCompanyUsersHref(company.id);
	const branchesHref = getWorkspaceCompanyBranchesHref(company.id);

	return (
		<section className="grid gap-5">
			<ModuleHeader
				variant="panel"
				titleAs="h1"
				title={company.name}
				description="Open company users, branch management, and branch-specific user assignments."
				eyebrow={
					<>
						<Building2 className="h-3.5 w-3.5" aria-hidden="true" />
						Workspace company
					</>
				}
				actions={
					<>
						<Link
							href={getWorkspaceCompanyEditHref(company.id)}
							className={moduleHeaderActionClassNames.secondary}
						>
							<Edit3 className="h-4 w-4" aria-hidden="true" />
							Edit Company
						</Link>
						<Link
							href={`${usersHref}/add`}
							className={moduleHeaderActionClassNames.secondary}
						>
							<Plus className="h-4 w-4" aria-hidden="true" />
							Add User
						</Link>
						<Link
							href={`${branchesHref}/add`}
							className={moduleHeaderActionClassNames.primary}
						>
							<Plus className="h-4 w-4" aria-hidden="true" />
							Add Branch
						</Link>
					</>
				}
			/>

			<section className="grid gap-4 xl:grid-cols-[1fr_1.2fr]">
				<article className="rounded-lg border border-darknavy/10 bg-white p-5 shadow-sm">
					<div className="flex flex-col gap-4 sm:flex-row sm:items-start">
						<WorkspaceCompanyAvatar
							initials={company.initials}
							logoUrl={company.logoUrl}
							name={company.name}
						/>
						<div className="min-w-0 flex-1">
							<div className="flex flex-wrap items-center gap-2">
								<WorkspaceStatusBadge status={company.status} />
								<WorkspacePlanBadge plan={company.plan} />
								<WorkspaceTextBadge>{company.companyType}</WorkspaceTextBadge>
							</div>
							<h2 className="mt-4 text-lg font-semibold text-darknavy">
								{company.name}
							</h2>
							<p className="mt-1 text-sm text-darknavy/58">
								{company.address}
							</p>
							<div className="mt-4 grid gap-3 sm:grid-cols-2">
								<Detail label="Primary Contact" value={company.primaryContact} />
								<Detail label="Email" value={company.email} />
								<Detail label="Contact No." value={company.contactNumber} />
								<Detail label="Created" value={company.createdAt} />
							</div>
						</div>
					</div>
				</article>

				<section className="grid gap-3 sm:grid-cols-3">
					<MetricCard label="Company Users" value={companyUsers.length} />
					<MetricCard label="Branches" value={companyBranches.length} />
					<MetricCard label="Branch Users" value={companyBranchUsers.length} />
				</section>
			</section>

			<section className="grid gap-4 xl:grid-cols-2">
				<ModuleLinkCard
					description="Company-level users can access the company shell and may have different branch assignments later."
					href={usersHref}
					icon={Users}
					label="Users Module"
					primaryAction="Open Users"
					secondaryText={`${companyUsers.length} users`}
				/>
				<ModuleLinkCard
					description="Branches and satellites live inside the company. Each branch has a separate user list."
					href={branchesHref}
					icon={GitBranch}
					label="Branch Management"
					primaryAction="Open Branches"
					secondaryText={`${companyBranches.length} branches`}
				/>
			</section>

			<section className="grid gap-4 xl:grid-cols-2">
				<PreviewList
					emptyText="No company users yet."
					href={usersHref}
					items={companyUsers.map((user) => ({
						id: user.id,
						meta: user.status,
						title: user.name,
					}))}
					title="Recent Company Users"
				/>
				<PreviewList
					emptyText="No branches yet."
					href={branchesHref}
					items={companyBranches.map((branch) => ({
						id: branch.id,
						meta: branch.isMain ? "Head Office" : branch.branchType,
						title: branch.name,
					}))}
					title="Branches"
				/>
			</section>
		</section>
	);
}

function Detail({ label, value }: { label: string; value: string }) {
	return (
		<div>
			<p className="text-xs font-semibold uppercase tracking-wide text-darknavy/45">
				{label}
			</p>
			<p className="mt-1 truncate text-sm font-semibold text-darknavy">
				{value}
			</p>
		</div>
	);
}

function MetricCard({ label, value }: { label: string; value: number }) {
	return (
		<article className="rounded-lg border border-darknavy/10 bg-white p-4 shadow-sm">
			<p className="text-sm font-medium text-darknavy/55">{label}</p>
			<p className="mt-3 text-3xl font-semibold text-darknavy">{value}</p>
		</article>
	);
}

function ModuleLinkCard({
	description,
	href,
	icon: Icon,
	label,
	primaryAction,
	secondaryText,
}: {
	description: string;
	href: string;
	icon: typeof Users;
	label: string;
	primaryAction: string;
	secondaryText: string;
}) {
	return (
		<Link
			href={href}
			className="group rounded-lg border border-darknavy/10 bg-white p-5 shadow-sm transition hover:border-skyblue/45 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/35"
		>
			<div className="flex items-start justify-between gap-4">
				<span className="flex h-11 w-11 items-center justify-center rounded-lg bg-skyblue/15 text-darknavy">
					<Icon className="h-5 w-5" aria-hidden="true" />
				</span>
				<span className="rounded bg-darknavy/5 px-2 py-1 text-xs font-semibold text-darknavy/55">
					{secondaryText}
				</span>
			</div>
			<h2 className="mt-5 text-lg font-semibold text-darknavy">{label}</h2>
			<p className="mt-2 text-sm leading-6 text-darknavy/58">{description}</p>
			<p className="mt-5 text-sm font-semibold text-skyblue group-hover:text-darknavy">
				{primaryAction}
			</p>
		</Link>
	);
}

function PreviewList({
	emptyText,
	href,
	items,
	title,
}: {
	emptyText: string;
	href: string;
	items: Array<{ id: string; meta: string; title: string }>;
	title: string;
}) {
	return (
		<section className="rounded-lg border border-darknavy/10 bg-white p-5 shadow-sm">
			<div className="flex items-center justify-between gap-3">
				<h2 className="text-base font-semibold text-darknavy">{title}</h2>
				<Link href={href} className="text-sm font-semibold text-skyblue">
					View all
				</Link>
			</div>
			<div className="mt-4 grid gap-2">
				{items.length ? (
					items.slice(0, 4).map((item) => (
						<div
							key={item.id}
							className="flex items-center justify-between gap-3 rounded-md border border-darknavy/10 px-3 py-2"
						>
							<span className="truncate text-sm font-semibold text-darknavy">
								{item.title}
							</span>
							<span className="shrink-0 rounded bg-darknavy/5 px-2 py-1 text-xs font-semibold text-darknavy/55">
								{item.meta}
							</span>
						</div>
					))
				) : (
					<p className="rounded-md border border-dashed border-darknavy/15 px-3 py-4 text-sm text-darknavy/55">
						{emptyText}
					</p>
				)}
			</div>
		</section>
	);
}
