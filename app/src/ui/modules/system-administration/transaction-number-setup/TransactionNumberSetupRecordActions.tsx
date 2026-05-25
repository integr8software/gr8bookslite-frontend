import { Play } from "lucide-react";
import { TransactionNumberSetupHref } from "@/app/src/constants/modules/system-administration/transaction-number-setup/TransactionNumberSetupConstants";
import type { TransactionNumberSetupRecord } from "@/app/src/types/modules/system-administration/transaction-number-setup/TransactionNumberSetupTypes";
import {
	ModuleTableActionButton,
	ModuleTableActionLink,
	ModuleTableActions,
} from "@/app/src/ui/shared/module/ModuleTableActions";

type TransactionNumberSetupRecordActionsProps = {
	setup: TransactionNumberSetupRecord;
	onGenerateNumber: (setupId: string) => void;
	onSetInactive: (setup: TransactionNumberSetupRecord) => void;
};

export function TransactionNumberSetupRecordActions({
	onGenerateNumber,
	onSetInactive,
	setup,
}: TransactionNumberSetupRecordActionsProps) {
	const isInactive = setup.status === "Inactive";

	return (
		<ModuleTableActions>
			<ModuleTableActionLink
				variant="view"
				href={`${TransactionNumberSetupHref}/view/${setup.id}`}
				label={`View ${setup.moduleName}`}
			/>
			<ModuleTableActionLink
				variant="edit"
				href={`${TransactionNumberSetupHref}/edit/${setup.id}`}
				label={`Edit ${setup.moduleName}`}
			/>
			<ModuleTableActionButton
				icon={Play}
				disabled={isInactive}
				onClick={() => onGenerateNumber(setup.id)}
				label={`Generate next ${setup.moduleName} number`}
			/>
			<ModuleTableActionButton
				variant="inactive"
				disabled={isInactive}
				onClick={() => onSetInactive(setup)}
				label={`Set ${setup.moduleName} setup as inactive`}
			/>
		</ModuleTableActions>
	);
}
