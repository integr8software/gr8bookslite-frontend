"use client";

import Link from "next/link";
import { Building2, ExternalLink } from "lucide-react";
import { WorkspaceCompaniesHref } from "@/app/src/constants/modules/workspace-companies/WorkspaceCompanyConstants";
import { useMasterCompanyManagementPage } from "@/app/src/hooks/master/company-management/useMasterCompanyManagementPage";
import {
	ModuleHeader,
	moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";
import { MasterCompanyManagementSummaryCards } from "@/app/src/ui/master/company-management/MasterCompanyManagementSummaryCards";
import { MasterCompanyManagementTable } from "@/app/src/ui/master/company-management/MasterCompanyManagementTable";

export function MasterCompanyManagementPage() {
	const companyManagement = useMasterCompanyManagementPage();

	return (
		<section className="grid gap-5">
			<ModuleHeader
				variant="card"
				titleAs="h1"
				title="Company Management"
				description="Review subscribed companies across the platform by plan, billing cycle, renewal state, and operating footprint."
				eyebrow={
					<>
						<Building2 className="h-3.5 w-3.5" aria-hidden="true" />
						Master directory
					</>
				}
				actions={
					<Link
						href={WorkspaceCompaniesHref}
						className={moduleHeaderActionClassNames.secondary}
					>
						<ExternalLink className="h-4 w-4" aria-hidden="true" />
						Workspace Companies
					</Link>
				}
			/>
			<MasterCompanyManagementSummaryCards {...companyManagement.metrics} />
			<MasterCompanyManagementTable {...companyManagement} />
		</section>
	);
}
