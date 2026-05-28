"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Building2, Edit3, GitBranch, Trash2 } from "lucide-react";
import {
	WorkspaceCompaniesHref,
	WorkspaceCompanyNotFoundDescription,
	getWorkspaceCompanyEditHref,
} from "@/app/src/constants/workspace/WorkspaceCompanyConstants";
import {
	useWorkspaceCompanyContext,
	useWorkspaceCompanyManagementStore,
} from "@/app/src/hooks/workspace/companies/useWorkspaceCompanyManagement";
import { AppDialog } from "@/app/src/ui/shared/app/AppDialog";
import {
	ModuleHeader,
	moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";
import {
	WorkspaceCompanyAvatar,
	WorkspacePlanBadge,
	WorkspaceStatusBadge,
	WorkspaceTextBadge,
} from "@/app/src/ui/workspace/shared/WorkspaceBadges";
import { ModuleNotFound } from "@/app/src/ui/shared/module/ModuleNotFound";

export function CompanyInformationPage() {
	const router = useRouter();
	const { company, companyBranches } = useWorkspaceCompanyContext();
	const deleteCompany = useWorkspaceCompanyManagementStore(
		(state) => state.deleteCompany,
	);
	const isMutating = useWorkspaceCompanyManagementStore(
		(state) => state.isMutating,
	);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

	if (!company) {
		return (
			<ModuleNotFound
				actionHref={WorkspaceCompaniesHref}
				actionLabel="Back"
				align="center"
				description={WorkspaceCompanyNotFoundDescription}
				title="Company Not Found"
			/>
		);
	}

	async function handleDeleteCompany() {
		if (!company) {
			return;
		}

		try {
			await deleteCompany(company.id);
			setIsDeleteDialogOpen(false);
			router.push(WorkspaceCompaniesHref);
		} catch {
			// The mutation owns the toast message; keep the dialog open.
		}
	}

	return (
		<section className="grid gap-5">
			<ModuleHeader
				variant="panel"
				titleAs="h1"
				title={company.name}
				description="Review company details, branch counts, and assigned users."
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
						<button
							type="button"
							onClick={() => setIsDeleteDialogOpen(true)}
							className={moduleHeaderActionClassNames.danger}
						>
							<Trash2 className="h-4 w-4" aria-hidden="true" />
							Delete Company
						</button>
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
								<WorkspaceTextBadge>
									{company.companyType}
								</WorkspaceTextBadge>
							</div>
							<h2 className="mt-4 text-lg font-semibold text-darknavy">
								{company.name}
							</h2>
							<p className="mt-1 text-sm text-darknavy/58">
								{company.address}
							</p>
							<div className="mt-5 grid gap-x-6 gap-y-4 sm:grid-cols-2 xl:grid-cols-3">
								<Detail
									label="Primary Contact"
									value={company.primaryContact}
								/>
								<Detail label="Email" value={company.email} />
								<Detail
									label="Contact No."
									value={company.contactNumber}
								/>
								<Detail label="TIN" value={company.tin} />
								<Detail
									label="Taxpayer Type"
									value={formatTaxpayerType(
										company.taxpayerType,
									)}
								/>
								<Detail
									label="Organization Type"
									value={
										company.nonIndividualType ??
										company.companyType
									}
								/>
								<Detail
									label="Website"
									value={company.website}
								/>
								<Detail
									label="Report Start"
									value={company.reportStartDate}
								/>
								<Detail
									label="Report End"
									value={company.reportEndDate}
								/>
								<Detail
									label="Created By"
									value={company.createdByUser?.name}
								/>
								<Detail
									label="Creator Email"
									value={company.createdByUser?.email}
								/>
								<Detail
									label="Created"
									value={company.createdAt}
								/>
							</div>
						</div>
					</div>
					<div className="rounded-lg border border-darknavy/10 bg-offwhite/50 p-4">
						<div className="flex items-start gap-3">
							<span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-skyblue/15 text-darknavy">
								<GitBranch
									className="h-5 w-5"
									aria-hidden="true"
								/>
							</span>
							<div className="min-w-0">
								<p className="text-sm font-semibold text-darknavy">
									Branch Management
								</p>
								<p className="mt-1 text-sm leading-6 text-darknavy/58">
									Branches and satellites live inside this
									company. User access is assigned from
									Workspace Users Management.
								</p>
							</div>
						</div>
						<div className="mt-5 grid grid-cols-2 gap-3">
							<Detail
								label="Branches"
								value={String(companyBranches.length)}
							/>
							<Detail
								label="Users"
								value={String(company.totalUsers ?? 0)}
							/>
						</div>
					</div>
				</div>
			</article>
			<AppDialog
				isOpen={isDeleteDialogOpen}
				isPending={isMutating}
				title="Delete company?"
				description={`This will mark ${company.name} as inactive while keeping users and branch records available.`}
				confirmLabel="Delete Company"
				tone="danger"
				onCancel={() => setIsDeleteDialogOpen(false)}
				onConfirm={() => void handleDeleteCompany()}
			/>
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
