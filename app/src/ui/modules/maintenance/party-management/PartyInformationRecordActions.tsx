"use client";

import { useState } from "react";
import { PartyManagementHref } from "@/app/src/constants/modules/maintenance/party-management/PartyManagementConstants";
import { usePartyManagementStore } from "@/app/src/hooks/modules/maintenance/party-management/usePartyManagement";
import type {
	PartyInformationStatus,
	PartyInformationTableRecord,
} from "@/app/src/types/modules/maintenance/party-management/PartyManagementTypes";
import { AppDialog } from "@/app/src/ui/shared/app/AppDialog";
import { ModuleTooltip } from "@/app/src/ui/shared/module/ModuleTooltip";
import {
	ModuleTableActionButton,
	ModuleTableActionLink,
	ModuleTableActions,
} from "@/app/src/ui/shared/module/module-table/ModuleTableActions";

export function PartyInformationRecordActions({
	record,
}: {
	record: PartyInformationTableRecord;
}) {
	const [statusToSet, setStatusToSet] =
		useState<PartyInformationStatus | null>(null);
	const { isMutating, updateRecord } = usePartyManagementStore((state) => ({
		isMutating: state.isMutating,
		updateRecord: state.updateRecord,
	}));
	const isStatusDialogOpen = statusToSet !== null;
	const statusLabel = statusToSet?.toLowerCase();

	function handleConfirmStatusChange() {
		if (!statusToSet) {
			return;
		}

		const { addressLabel, name, partyTypesLabel, ...partyRecord } = record;

		updateRecord({
			...partyRecord,
			status: statusToSet,
			updatedAt: new Date().toISOString(),
		});
		setStatusToSet(null);
	}

	return (
		<>
			<ModuleTableActions className="justify-center">
				<ModuleTooltip title="View">
					<ModuleTableActionLink
						variant="view"
						href={`${PartyManagementHref}/view/${record.id}`}
						label={`View ${record.name}`}
					/>
				</ModuleTooltip>
				<ModuleTooltip title="Edit">
					<ModuleTableActionLink
						variant="edit"
						href={`${PartyManagementHref}/edit/${record.id}`}
						label={`Edit ${record.name}`}
					/>
				</ModuleTooltip>
				{record.status === "Active" ? (
					<ModuleTooltip title="Set as Inactive">
						<ModuleTableActionButton
							disabled={isMutating}
							variant="inactive"
							label={`Set ${record.name} as inactive`}
							onClick={() => setStatusToSet("Inactive")}
						/>
					</ModuleTooltip>
				) : (
					<ModuleTooltip title="Set as Active">
						<ModuleTableActionButton
							disabled={isMutating}
							variant="active"
							label={`Set ${record.name} as active`}
							onClick={() => setStatusToSet("Active")}
						/>
					</ModuleTooltip>
				)}
			</ModuleTableActions>
			<AppDialog
				isOpen={isStatusDialogOpen}
				title={`Set party as ${statusLabel}?`}
				description={`This will mark ${record.name} as ${statusLabel}.`}
				confirmLabel={
					statusToSet === "Inactive" ? "Set as Inactive" : "Set as Active"
				}
				tone={statusToSet === "Inactive" ? "danger" : "success"}
				onCancel={() => setStatusToSet(null)}
				onConfirm={handleConfirmStatusChange}
			/>
		</>
	);
}
