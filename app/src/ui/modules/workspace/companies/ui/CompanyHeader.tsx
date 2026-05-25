import Link from "next/link";
import { Building2, Plus } from "lucide-react";
import { WorkspaceCompaniesHref } from "@/app/src/constants/modules/workspace-companies/WorkspaceCompanyConstants";
import { ModuleHeader } from "@/app/src/ui/shared/module/ModuleHeader";
import { WorkspaceCompaniesActionClassName } from "@/app/src/ui/modules/workspace/companies/ui/WorkspaceCompanyListPrimitives";

export function CompanyHeader() {
	return (
		<ModuleHeader
			variant="card"
			titleAs="h1"
			title="Companies"
			description="Manage companies, plans, branches, and company users."
			eyebrow={
				<>
					<Building2 className="h-3.5 w-3.5" aria-hidden="true" />
					Workspace directory
				</>
			}
			actions={
				<Link
					href={`${WorkspaceCompaniesHref}/add`}
					className={`${WorkspaceCompaniesActionClassName} bg-skyblue text-white shadow-sm shadow-skyblue/20 hover:opacity-90`}
				>
					<Plus className="h-4 w-4" aria-hidden="true" />
					Add Company
				</Link>
			}
		/>
	);
}
