"use client";

import { useState } from "react";
import { PartyManagementHref } from "@/app/src/constants/modules/party-management/PartyManagementConstants";
import { createPartyInformationRecordFromTableRecord } from "@/app/src/data/modules/party-management/PartyManagementData";
import { usePartyManagementStore } from "@/app/src/hooks/modules/party-management/usePartyManagement";
import type {
	PartyInformationRecordActionsProps,
	PartyInformationStatus,
} from "@/app/src/types/modules/party-management/PartyManagementTypes";
import { AppDialog } from "@/app/src/ui/shared/app/AppDialog";
import { ModuleTooltip } from "@/app/src/ui/shared/module/ModuleTooltip";
import {
	ModuleTableActionButton,
	ModuleTableActionLink,
	ModuleTableActions,
} from "@/app/src/ui/shared/module/module-table/ModuleTableActions";

export function PartyInformationRecordActions({
	record,
}: PartyInformationRecordActionsProps) {
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

		updateRecord({
			...createPartyInformationRecordFromTableRecord(record),
			status: statusToSet,
			updatedAt: new Date().toISOString(),
		});
		setStatusToSet(null);
	}

	return (
		<>
			<ModuleTableActions className="w-full !justify-center">
				<ModuleTooltip align="end" position="top" title="View">
					<ModuleTableActionLink
						variant="view"
						href={`${PartyManagementHref}/view/${record.id}`}
						label={`View ${record.name}`}
					/>
				</ModuleTooltip>
				<ModuleTooltip align="end" position="top" title="Edit">
					<ModuleTableActionLink
						variant="edit"
						href={`${PartyManagementHref}/edit/${record.id}`}
						label={`Edit ${record.name}`}
					/>
				</ModuleTooltip>
				{record.status === "Active" ? (
					<ModuleTooltip align="end" position="top" title="Set as Inactive">
						<ModuleTableActionButton
							disabled={isMutating}
							variant="inactive"
							label={`Set ${record.name} as inactive`}
							onClick={() => setStatusToSet("Inactive")}
						/>
					</ModuleTooltip>
				) : (
					<ModuleTooltip align="end" position="top" title="Set as Active">
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
				tone={statusToSet === "Inactive" ? "deactivate" : "activate"}
				onCancel={() => setStatusToSet(null)}
				onConfirm={handleConfirmStatusChange}
			/>
		</>
	);
}
