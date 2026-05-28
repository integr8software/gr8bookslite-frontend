import Link from "next/link";
import { Eye } from "lucide-react";
import { getWorkspaceCompanyHref } from "@/app/src/constants/workspace/WorkspaceCompanyConstants";
import {
	formatMasterCompanyCurrency,
	formatMasterCompanyDate,
} from "@/app/src/data/master/company-management/MasterCompanyManagementData";
import type { MasterCompanyManagementRecord } from "@/app/src/types/master/company-management/MasterCompanyManagementTypes";
import {
	MasterCompanyCycleBadge,
	MasterCompanyPlanBadge,
	MasterCompanyStatusBadge,
} from "@/app/src/ui/master/company-management/MasterCompanyManagementBadges";

type MasterCompanyManagementTableRowProps = {
	company: MasterCompanyManagementRecord;
};

type MasterCompanyManagementGroupRowProps = {
	colSpan: number;
	count: number;
	label: string;
	value: string;
};

export function MasterCompanyManagementTableRow({
	company,
}: MasterCompanyManagementTableRowProps) {
	return (
		<tr className="module-table-row">
			<td className="px-4 py-4">
				<div className="min-w-0">
					<Link
						href={getWorkspaceCompanyHref(company.workspaceCompanyId)}
						className="block truncate text-sm font-semibold text-darknavy transition hover:text-skyblue focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-skyblue/20"
					>
						{company.name}
					</Link>
					<p className="mt-1 truncate text-sm text-darknavy/50">
						{company.email}
					</p>
				</div>
			</td>
			<td className="px-4 py-4">
				<MasterCompanyPlanBadge plan={company.plan} />
			</td>
			<td className="px-4 py-4">
				<MasterCompanyStatusBadge status={company.status} />
			</td>
			<td className="px-4 py-4">
				<MasterCompanyCycleBadge billingCycle={company.billingCycle} />
			</td>
			<td className="px-4 py-4 text-sm font-semibold text-darknavy">
				{company.activeUsers}
			</td>
			<td className="px-4 py-4 text-sm font-semibold text-darknavy">
				{company.branchCount}
			</td>
			<td className="px-4 py-4 text-sm font-semibold text-darknavy">
				{formatMasterCompanyCurrency(company.monthlyRecurringRevenue)}
			</td>
			<td className="px-4 py-4 text-sm text-darknavy/65">
				{formatMasterCompanyDate(company.renewalDate)}
			</td>
			<td className="px-4 py-4">
				<div className="flex items-center justify-center">
					<Link
						href={getWorkspaceCompanyHref(company.workspaceCompanyId)}
						aria-label={`Open ${company.name}`}
						className="flex h-10 w-10 items-center justify-center rounded-lg text-darknavy/65 transition hover:bg-skyblue/10 hover:text-darknavy focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-skyblue/15"
					>
						<Eye className="h-4 w-4" aria-hidden="true" />
					</Link>
				</div>
			</td>
		</tr>
	);
}

export function MasterCompanyManagementGroupRow({
	colSpan,
	count,
	label,
	value,
}: MasterCompanyManagementGroupRowProps) {
	return (
		<tr className="bg-offwhite">
			<td colSpan={colSpan} className="px-4 py-3">
				<div className="flex items-center gap-2 text-sm font-semibold text-darknavy">
					<span>{label}</span>
					<span className="text-darknavy/45">/</span>
					<span>{value}</span>
					<span className="ml-auto rounded-md bg-white px-2.5 py-1 text-xs text-darknavy/55 ring-1 ring-darknavy/10">
						{count} {count === 1 ? "company" : "companies"}
					</span>
				</div>
			</td>
		</tr>
	);
}
