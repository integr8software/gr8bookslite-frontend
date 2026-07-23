import { FileCog, Plus } from "lucide-react";
import {
	DefaultAccountDescription,
	DefaultAccountParentLabel,
	DefaultAccountTitle,
} from "@/app/src/constants/modules/financial-maintenance/default-account/DefaultAccountConstants";
import type { DefaultAccountPermissions } from "@/app/src/types/modules/financial-maintenance/default-account/DefaultAccountTypes";
import {
	ModuleHeader,
	moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";

export function DefaultAccountHeader({
	onAdd,
	permissions,
}: {
	onAdd: () => void;
	permissions: DefaultAccountPermissions;
}) {
	return (
		<ModuleHeader
			variant="panel"
			titleAs="h1"
			title={DefaultAccountTitle}
			description={DefaultAccountDescription}
			actionsClassName="w-full justify-start sm:ml-auto sm:w-auto sm:justify-end sm:self-start"
			eyebrow={
				<>
					<FileCog className="h-3.5 w-3.5" aria-hidden="true" />
					{DefaultAccountParentLabel}
				</>
			}
			actions={
				permissions.canCreate ? (
					<button
						type="button"
						onClick={onAdd}
						className={moduleHeaderActionClassNames.primary}
					>
						<Plus className="h-4 w-4" aria-hidden="true" />
						Add Default Account
					</button>
				) : null
			}
		/>
	);
}

