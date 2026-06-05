"use client";

import { FormSignatoryPaginationStorageKey } from "@/app/src/constants/modules/maintenance/form-signatory/FormSignatoryConstants";
import type { useFormSignatoryMaintenancePage } from "@/app/src/hooks/modules/maintenance/form-signatory/useFormSignatoryMaintenancePage";
import { ModuleTable } from "@/app/src/ui/shared/module/module-table/ModuleTable";
import { FormSignatoryTableRow } from "@/app/src/ui/modules/maintenance/form-signatory/FormSignatoryTableRow";
import { FormSignatoryToolbar } from "@/app/src/ui/modules/maintenance/form-signatory/FormSignatoryToolbar";

type FormSignatoryTableProps = Pick<
	ReturnType<typeof useFormSignatoryMaintenancePage>,
	| "branch"
	| "branchOptions"
	| "currentSetupId"
	| "deletingRowId"
	| "handleAddRow"
	| "handleDeleteRow"
	| "handleSignatureFile"
	| "handleReset"
	| "isEditing"
	| "isLoading"
	| "isScopedRowEdit"
	| "maxRows"
	| "module"
	| "moduleOptions"
	| "rows"
	| "setBranch"
	| "setModule"
	| "setSignatoryFilterLabel"
	| "setPendingClearSignatureRow"
	| "setSignatureMakerRow"
	| "showSignatureValidityColumn"
	| "signatoryFilterLabel"
	| "table"
	| "updateRow"
>;

export function FormSignatoryTable({
	branch,
	branchOptions,
	currentSetupId,
	deletingRowId,
	handleAddRow,
	handleDeleteRow,
	handleSignatureFile,
	handleReset,
	isEditing,
	isLoading,
	isScopedRowEdit,
	maxRows,
	module,
	moduleOptions,
	rows,
	setBranch,
	setModule,
	setSignatoryFilterLabel,
	setPendingClearSignatureRow,
	setSignatureMakerRow,
	showSignatureValidityColumn,
	signatoryFilterLabel,
	table,
	updateRow,
}: FormSignatoryTableProps) {
	return (
		<ModuleTable
			variant="standalone"
			emptyDescription={getEmptyDescription(signatoryFilterLabel)}
			emptyTitle={getEmptyTitle(signatoryFilterLabel)}
			isLoading={isLoading}
			minWidthClassName="min-w-[96rem]"
			paginationLabel="signatories"
			paginationStorageKey={FormSignatoryPaginationStorageKey}
			pageSizeOptions={[5]}
			table={table}
			toolbar={
				<FormSignatoryToolbar
					branch={branch}
					branchOptions={branchOptions}
					isEditing={isEditing}
					isLoading={isLoading}
					isScopedRowEdit={isScopedRowEdit}
					maxRows={maxRows}
					module={module}
					moduleOptions={moduleOptions}
					signatoryFilterLabel={signatoryFilterLabel}
					signatoryCount={rows.length}
					onAddRow={handleAddRow}
					onBranchChange={setBranch}
					onModuleChange={setModule}
					onReset={handleReset}
					onSignatoryFilterChange={setSignatoryFilterLabel}
				/>
			}
			renderRow={(row) => (
				<FormSignatoryTableRow
					key={row.id}
					isDeleting={deletingRowId === row.original.id}
					isEditing={isEditing}
					row={row.original}
					rowNumber={
						table.getState().pagination.pageIndex *
							table.getState().pagination.pageSize +
						row.index +
						1
					}
					showSignatureValidity={showSignatureValidityColumn}
					onClearSignature={setPendingClearSignatureRow}
					editHref={
						row.original.setupId
							? `/maintenance/form-signatory/edit/${row.original.setupId}?rowId=${encodeURIComponent(row.original.id)}`
							: currentSetupId
							? `/maintenance/form-signatory/edit/${currentSetupId}?rowId=${encodeURIComponent(row.original.id)}`
							: "/maintenance/form-signatory/add"
					}
					onMakeSignature={setSignatureMakerRow}
					onDeleteRow={handleDeleteRow}
					onSignatureFileChange={handleSignatureFile}
					onUpdateRow={updateRow}
				/>
			)}
		/>
	);
}

function getEmptyTitle(signatoryFilterLabel: string) {
	return signatoryFilterLabel
		? `No ${signatoryFilterLabel} signatory`
		: "No signatories configured";
}

function getEmptyDescription(signatoryFilterLabel: string) {
	return signatoryFilterLabel
		? "Add or edit a signatory row with this label, then save the setup."
		: "Add a signatory to prepare this form setup.";
}
