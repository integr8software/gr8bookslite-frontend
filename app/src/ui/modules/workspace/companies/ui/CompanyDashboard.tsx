"use client";

import Link from "next/link";
import { Building2, Edit3, GitBranch, Plus } from "lucide-react";
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
} from "@/app/src/ui/modules/workspace/companies/ui/WorkspaceCompanyBadges";
import { WorkspaceCompanyNotFound } from "@/app/src/ui/modules/workspace/companies/ui/WorkspaceCompanyNotFound";

export function WorkspaceCompanyDashboard() {
	const {
		company,
		companyBranches,
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

			<article className="rounded-lg border border-darknavy/10 bg-white p-5 shadow-sm">
				<div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
					<div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-start">
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
							<div className="mt-5 grid gap-x-6 gap-y-4 sm:grid-cols-2 xl:grid-cols-3">
								<Detail label="Primary Contact" value={company.primaryContact} />
								<Detail label="Email" value={company.email} />
								<Detail label="Contact No." value={company.contactNumber} />
								<Detail label="TIN" value={company.tin} />
								<Detail label="Taxpayer Type" value={formatTaxpayerType(company.taxpayerType)} />
								<Detail label="Organization Type" value={company.nonIndividualType ?? company.companyType} />
								<Detail label="Website" value={company.website} />
								<Detail label="Report Start" value={company.reportStartDate} />
								<Detail label="Report End" value={company.reportEndDate} />
								<Detail label="Created By" value={company.createdByUser?.name} />
								<Detail label="Creator Email" value={company.createdByUser?.email} />
								<Detail label="Created" value={company.createdAt} />
							</div>
						</div>
					</div>
					<div className="rounded-lg border border-darknavy/10 bg-offwhite/50 p-4">
						<div className="flex items-start gap-3">
							<span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-skyblue/15 text-darknavy">
								<GitBranch className="h-5 w-5" aria-hidden="true" />
							</span>
							<div className="min-w-0">
								<p className="text-sm font-semibold text-darknavy">
									Branch Management
								</p>
								<p className="mt-1 text-sm leading-6 text-darknavy/58">
									Branches and satellites live inside this company. User access is assigned from Workspace Users Management.
								</p>
							</div>
						</div>
						<div className="mt-5 grid grid-cols-2 gap-3">
							<Detail label="Branches" value={String(companyBranches.length)} />
							<Detail label="Users" value={String(company.totalUsers ?? 0)} />
						</div>
						<Link
							href={branchesHref}
							className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-skyblue px-4 text-sm font-semibold text-white shadow-sm shadow-skyblue/20 transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-skyblue/20"
						>
							<GitBranch className="h-4 w-4" aria-hidden="true" />
							Open Branches
						</Link>
					</div>
				</div>
			</article>
		</section>
	);
}

function Detail({ label, value }: { label: string; value?: string }) {
	const displayValue = value?.trim() || "-";

	return (
		<div className="min-w-0">
			<p className="text-xs font-semibold uppercase tracking-wide text-darknavy/45">
				{label}
			</p>
			<p className="mt-1 break-words text-sm font-semibold text-darknavy">
				{displayValue}
			</p>
		</div>
	);
}

function formatTaxpayerType(value?: "individual" | "non-individual") {
	if (value === "individual") {
		return "Individual";
	}

	if (value === "non-individual") {
		return "Non-Individual";
	}

	return undefined;
}
