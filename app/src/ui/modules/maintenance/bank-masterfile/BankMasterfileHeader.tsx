import { Landmark, Plus, Upload } from "lucide-react";
import {
	BankMasterfileDescription,
	BankMasterfileParentLabel,
	BankMasterfileTitle,
} from "@/app/src/constants/modules/maintenance/financial-management/bank-masterfile/BankMasterfileConstants";
import type { BankMasterfilePermissions } from "@/app/src/services/modules/maintenance/bank-masterfile/BankMasterfileApi";
import {
	ModuleHeader,
	moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";

export function BankMasterfileHeader({
	onAdd,
	onImport,
	permissions,
}: {
	onAdd: () => void;
	onImport: () => void;
	permissions: BankMasterfilePermissions;
}) {
	return (
		<ModuleHeader
			variant="panel"
			titleAs="h1"
			title={BankMasterfileTitle}
			description={BankMasterfileDescription}
			actionsClassName="w-full justify-start sm:ml-auto sm:w-auto sm:justify-end sm:self-start"
			eyebrow={
				<>
					<Landmark className="h-3.5 w-3.5" aria-hidden="true" />
					{BankMasterfileParentLabel}
				</>
			}
			actions={
				<>
					{permissions.canImport ? (
						<button
							type="button"
							onClick={onImport}
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
							className={`${moduleHeaderActionClassNames.primary} order-1 lg:order-2`}
						>
							<Plus className="h-4 w-4" aria-hidden="true" />
							Add Bank
						</button>
					) : null}
				</>
			}
		/>
	);
}