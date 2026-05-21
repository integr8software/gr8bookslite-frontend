import Link from "next/link";
import { Building2, Download, Plus, Upload } from "lucide-react";
import { WorkspaceCompaniesHref } from "@/app/src/constants/modules/workspace-companies/WorkspaceCompanyConstants";
import {
	ModuleHeader,
	moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";

export function CompanyHeader() {
	return (
		<ModuleHeader
			variant="panel"
			titleAs="h1"
			title="Companies"
			description="Manage companies, plans, branches, and company-level user access from the workspace."
			eyebrow={
				<>
					<Building2 className="h-3.5 w-3.5" aria-hidden="true" />
					Workspace directory
				</>
			}
			actions={
				<>
					<button type="button" className={moduleHeaderActionClassNames.secondary}>
						<Upload className="h-4 w-4" aria-hidden="true" />
						Import
					</button>
					<button type="button" className={moduleHeaderActionClassNames.secondary}>
						<Download className="h-4 w-4" aria-hidden="true" />
						Export
					</button>
					<Link
						href={`${WorkspaceCompaniesHref}/add`}
						className={moduleHeaderActionClassNames.primary}
					>
						<Plus className="h-4 w-4" aria-hidden="true" />
						Add Company
					</Link>
				</>
			}
		/>
	);
}
