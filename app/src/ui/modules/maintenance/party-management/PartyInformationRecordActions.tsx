import { PartyManagementHref } from "@/app/src/constants/modules/maintenance/party-management/PartyManagementConstants";
import {
	ModuleTableActionLink,
	ModuleTableActions,
} from "@/app/src/ui/shared/module/ModuleTableActions";

export function PartyInformationRecordActions({
	id,
	name,
}: {
	id: string;
	name: string;
}) {
	return (
		<ModuleTableActions className="justify-center">
			<ModuleTableActionLink
				variant="view"
				href={`${PartyManagementHref}/view/${id}`}
				label={`View ${name}`}
			/>
			<ModuleTableActionLink
				variant="edit"
				href={`${PartyManagementHref}/edit/${id}`}
				label={`Edit ${name}`}
			/>
		</ModuleTableActions>
	);
}
