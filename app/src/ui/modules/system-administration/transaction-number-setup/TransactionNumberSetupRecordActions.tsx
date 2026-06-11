import { TransactionNumberSetupHref } from "@/app/src/constants/modules/system-administration/transaction-number-setup/TransactionNumberSetupConstants";
import type { TransactionNumberSetupRecord } from "@/app/src/types/modules/system-administration/transaction-number-setup/TransactionNumberSetupTypes";
import {
	ModuleTableActionLink,
	ModuleTableActions,
} from "@/app/src/ui/shared/module/module-table/ModuleTableActions";

type TransactionNumberSetupRecordActionsProps = {
	setup: TransactionNumberSetupRecord;
};

export function TransactionNumberSetupRecordActions({
	setup,
}: TransactionNumberSetupRecordActionsProps) {
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
		</ModuleTableActions>
	);
}
