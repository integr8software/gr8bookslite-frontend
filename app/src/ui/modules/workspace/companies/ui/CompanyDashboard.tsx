"use client";

import Link from "next/link";
import { Building2, Edit3, GitBranch, Plus, type LucideIcon } from "lucide-react";
import {
	WorkspaceCompaniesHref,
	getWorkspaceCompanyBranchesHref,
	getWorkspaceCompanyEditHref,
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
	} = useWorkspaceCompanyContext();

	if (!company) {
		return (
			<WorkspaceCompanyNotFound
				href={WorkspaceCompaniesHref}
				title="Company Not Found"
			/>
		);
	}

	const branchesHref = getWorkspaceCompanyBranchesHref(company.id);

	return (
		<section className="grid gap-5">
			<ModuleHeader
				variant="panel"
				titleAs="h1"
				title={company.name}
				description="Review company details and manage branches or satellites."
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

				<section className="grid gap-3 sm:grid-cols-2">
					<MetricCard label="Branches" value={companyBranches.length} />
					<MetricCard label="Branch Users" value={companyBranchUsers.length} />
				</section>
			</section>

			<section className="grid gap-4">
				<ModuleLinkCard
					description="Branches and satellites live inside the company. Each branch has a separate user list."
					href={branchesHref}
					icon={GitBranch}
					label="Branch Management"
					primaryAction="Open Branches"
					secondaryText={`${companyBranches.length} branches`}
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
	icon: LucideIcon;
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
