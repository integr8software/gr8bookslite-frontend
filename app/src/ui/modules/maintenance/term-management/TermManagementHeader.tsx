import { CalendarDays, Plus, Upload } from "lucide-react";
import {
	TermManagementDescription,
	TermManagementParentLabel,
	TermManagementTitle,
} from "@/app/src/constants/modules/maintenance/term-management/TermManagementConstants";
import type { TermManagementPermissions } from "@/app/src/types/modules/maintenance/term-management/TermManagementTypes";
import {
	ModuleHeader,
	moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";

export function TermManagementHeader({
	onAdd,
	onImport,
	permissions,
}: {
	onAdd: () => void;
	onImport: () => void;
	permissions: TermManagementPermissions;
}) {
	return (
		<ModuleHeader
			variant="panel"
			titleAs="h1"
			title={TermManagementTitle}
			description={TermManagementDescription}
			actionsClassName="w-full justify-start sm:ml-auto sm:w-auto sm:justify-end sm:self-start"
			eyebrow={
				<>
					<CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
					{TermManagementParentLabel}
				</>
			}
			actions={
				<>
					{permissions.canImport ? (
						<button
							type="button"
							onClick={onImport}
							data-spotlight-id="maintenance-import-records"
							className={`${moduleHeaderActionClassNames.secondary} order-2 lg:order-1`}
						>
							<Upload className="h-4 w-4" aria-hidden="true" />
							Import
						</button>
					) : null}
					{permissions.canCreate ? (
						<button
							type="button"
							onClick={onAdd}
							data-spotlight-id="maintenance-create-record"
							className={`${moduleHeaderActionClassNames.primary} order-1 lg:order-2`}
						>
							<Plus className="h-4 w-4" aria-hidden="true" />
							Add Term
						</button>
					) : null}
				</>
			}
		/>
	);
}

