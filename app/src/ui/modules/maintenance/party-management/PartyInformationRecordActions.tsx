"use client";

import { useState } from "react";
import { PartyManagementHref } from "@/app/src/constants/modules/maintenance/party-management/PartyManagementConstants";
import { usePartyManagementStore } from "@/app/src/hooks/modules/maintenance/party-management/usePartyManagement";
import type {
	PartyInformationRecord,
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
				tone={statusToSet === "Inactive" ? "danger" : "success"}
				onCancel={() => setStatusToSet(null)}
				onConfirm={handleConfirmStatusChange}
			/>
		</>
	);
}

function createPartyInformationRecordFromTableRecord(
	record: PartyInformationTableRecord,
): PartyInformationRecord {
	return {
		address: record.address,
		addresses: record.addresses,
		atcCode: record.atcCode,
		classification: record.classification,
		contactNo: record.contactNo,
		createdAt: record.createdAt,
		customerAdvanceAccount: record.customerAdvanceAccount,
		defaultPayableAccount: record.defaultPayableAccount,
		defaultReceivableAccount: record.defaultReceivableAccount,
		email: record.email,
		employeeAdvanceAccount: record.employeeAdvanceAccount,
		employeePayableAccount: record.employeePayableAccount,
		firstName: record.firstName,
		id: record.id,
		lastName: record.lastName,
		middleName: record.middleName,
		partyCodeNo: record.partyCodeNo,
		partyName: record.partyName,
		partyTypes: record.partyTypes,
		status: record.status,
		suffixName: record.suffixName,
		termId: record.termId,
		termName: record.termName,
		tin: record.tin,
		tradeName: record.tradeName,
		updatedAt: record.updatedAt,
		vendorAdvanceAccount: record.vendorAdvanceAccount,
		vatRegistrationType: record.vatRegistrationType,
	};
}
