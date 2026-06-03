"use client";

import { FormSignatoryPaginationStorageKey } from "@/app/src/constants/modules/maintenance/form-signatory/FormSignatoryConstants";
import type { useFormSignatoryMaintenancePage } from "@/app/src/hooks/modules/maintenance/form-signatory/useFormSignatoryMaintenancePage";
import { ModuleTable } from "@/app/src/ui/shared/module/module-table/ModuleTable";
import { FormSignatoryTableRow } from "@/app/src/ui/modules/maintenance/form-signatory/FormSignatoryTableRow";
import { FormSignatoryToolbar } from "@/app/src/ui/modules/maintenance/form-signatory/FormSignatoryToolbar";

type FormSignatoryTableProps = Pick<
	ReturnType<typeof useFormSignatoryMaintenancePage>,
	| "branch"
	| "currentSetupId"
	| "handleAddRow"
	| "handleSignatureFile"
	| "handleRemoveRow"
	| "handleReset"
	| "isEditing"
	| "maxRows"
	| "mode"
	| "module"
	| "rows"
	| "setBranch"
	| "setModule"
	| "setPendingClearSignatureRow"
	| "setSignatureMakerRow"
	| "table"
	| "updateRow"
>;

export function FormSignatoryTable({
	branch,
	currentSetupId,
	handleAddRow,
	handleSignatureFile,
	handleRemoveRow,
	handleReset,
	isEditing,
	maxRows,
	mode,
	module,
	rows,
	setBranch,
	setModule,
	setPendingClearSignatureRow,
	setSignatureMakerRow,
	table,
	updateRow,
}: FormSignatoryTableProps) {
	return (
		<ModuleTable
			variant="standalone"
			emptyDescription="Select the number of signatories to prepare a form signatory setup."
			emptyTitle="No signatories configured"
			minWidthClassName="min-w-[104rem]"
			paginationLabel="signatories"
			paginationStorageKey={FormSignatoryPaginationStorageKey}
			pageSizeOptions={[5]}
			table={table}
			toolbar={
				<FormSignatoryToolbar
					branch={branch}
					isEditing={isEditing}
					maxRows={maxRows}
					mode={mode}
					module={module}
					signatoryCount={rows.length}
					onAddRow={handleAddRow}
					onBranchChange={setBranch}
					onModuleChange={setModule}
					onReset={handleReset}
				/>
			}
			renderRow={(row) => (
				<FormSignatoryTableRow
					key={row.id}
					isEditing={isEditing}
					row={row.original}
					rowNumber={
						table.getState().pagination.pageIndex *
							table.getState().pagination.pageSize +
						row.index +
						1
					}
					onClearSignature={setPendingClearSignatureRow}
					editHref={`/maintenance/form-signatory/edit/${currentSetupId}`}
					onMakeSignature={setSignatureMakerRow}
					onRemoveRow={handleRemoveRow}
					onSignatureFileChange={handleSignatureFile}
					onUpdateRow={updateRow}
				/>
			)}
		/>
	);
}
