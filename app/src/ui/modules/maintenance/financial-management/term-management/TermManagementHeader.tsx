import { CalendarDays, Plus, Upload } from "lucide-react";
import {
	TermManagementDescription,
	TermManagementParentLabel,
	TermManagementTitle,
} from "@/app/src/constants/modules/maintenance/financial-management/term-management/TermManagementConstants";
import {
	ModuleHeader,
	moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";

export function TermManagementHeader({
	onAdd,
	onImport,
}: {
	onAdd: () => void;
	onImport: () => void;
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
					<button
						type="button"
						onClick={onImport}
						className={`${moduleHeaderActionClassNames.secondary} order-2 lg:order-1`}
					>
						<Upload className="h-4 w-4" aria-hidden="true" />
						Import
					</button>
					<button
						type="button"
						onClick={onAdd}
						className={`${moduleHeaderActionClassNames.primary} order-1 lg:order-2`}
					>
						<Plus className="h-4 w-4" aria-hidden="true" />
						Add Term
					</button>
				</>
			}
		/>
	);
}
