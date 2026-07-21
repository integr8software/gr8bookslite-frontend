"use client";

import { AlertCircle } from "lucide-react";
import { AppMaxFileUploadSizeLabel } from "@/app/src/constants/shared/app/AppConstants";
import {
	getModuleImportDataColumnWidth,
	ModuleImportFixedColumnsWidth,
	ModuleImportRowNumberColumnWidth,
	ModuleImportSelectionColumnWidth,
} from "@/app/src/constants/shared/module/ModuleImportConstants";
import {
	UnitOfMeasurementImportAcceptedFileExtensions,
	UnitOfMeasurementImportAcceptedFileLabel,
	UnitOfMeasurementImportColumnHeaders,
	UnitOfMeasurementImportFieldOrder,
	UnitOfMeasurementImportPreviewColumnCount,
	UnitOfMeasurementImportPreviewGridLabel,
} from "@/app/src/constants/modules/maintenance/unit-of-measurement/UnitOfMeasurementConstants";
import {
	downloadUnitOfMeasurementImportTemplate,
	isUnitOfMeasurementImportGridPasteTarget,
} from "@/app/src/data/modules/maintenance/unit-of-measurement/UnitOfMeasurementData";
import { useUnitOfMeasurementImportDialog } from "@/app/src/hooks/modules/maintenance/unit-of-measurement/useUnitOfMeasurementImportDialog";
import type { UnitOfMeasurementImportDialogProps } from "@/app/src/types/modules/maintenance/unit-of-measurement/UnitOfMeasurementTypes";
import { ModuleImportDialog } from "@/app/src/ui/shared/module/ModuleImportDialog";
import {
	ModuleImportFooter,
	ModuleImportEmptyDropzone,
	ModuleImportHeaderActions,
	ModuleImportPaginationBar,
	ModuleImportProgressPanel,
	ModuleImportRowNumberHeader,
	ModuleImportSelectionHeader,
} from "@/app/src/ui/shared/module/ModuleImportControls";
import { ModuleImportResizableColumnHeader } from "@/app/src/ui/shared/module/ModuleImportResizableColumnHeader";
import { UnitOfMeasurementImportPreviewTableRow } from "@/app/src/ui/modules/maintenance/unit-of-measurement/UnitOfMeasurementImportPreviewTableRow";

export function UnitOfMeasurementImportDialog({
	existingRecords,
	isOpen,
	onClose,
	onImportRecords,
}: UnitOfMeasurementImportDialogProps) {
	const importDialog = useUnitOfMeasurementImportDialog({
		existingRecords,
		onClose,
		onImportRecords,
	});

	return (
		<ModuleImportDialog
			isOpen={isOpen}
			isBusy={Boolean(importDialog.progress)}
			title="Import Units of Measurement"
			titleId="unit-of-measurement-import-title"
			description="Upload, validate, edit, and import units of measurement in queued batches."
			onClose={onClose}
			actions={
				<ModuleImportHeaderActions
					accept={UnitOfMeasurementImportAcceptedFileExtensions}
					disabled={Boolean(importDialog.progress)}
					isParsing={importDialog.isParsing}
					onDownloadTemplate={() =>
						void downloadUnitOfMeasurementImportTemplate()
					}
					onFileSelect={(file) =>
						void importDialog.handleFileUpload(file)
					}
				/>
			}
			progress={
				importDialog.progress ? (
					<ModuleImportProgressPanel
						progress={importDialog.progress}
					/>
				) : null
			}
			footer={
				<ModuleImportFooter
					canImportAllRows={importDialog.canImportAllRows}
					canImportAllValid={importDialog.canImportAllValid}
					canImportSelectedValid={importDialog.canImportSelectedValid}
					importLabel="Import Units of Measurement"
					importMode={importDialog.importMode}
					isBusy={Boolean(importDialog.progress)}
					isImportMenuOpen={importDialog.isImportMenuOpen}
					selectedValidRowsCount={
						importDialog.validSelectedRows.length
					}
					totalRowsCount={importDialog.validatedRows.length}
					validRowsCount={importDialog.validRows.length}
					onCancel={onClose}
					onImport={(mode) => void importDialog.handleImport(mode)}
					onReset={importDialog.resetImportState}
					onSetImportMode={importDialog.setImportSelection}
					onToggleImportMenu={() =>
						importDialog.setIsImportMenuOpen((isOpen) => !isOpen)
					}
				/>
			}
		>
			<div className="flex h-full min-h-0 flex-col gap-3">
				{importDialog.importError ? (
					<div className="flex gap-2 rounded-md border border-coralpink/25 bg-coralpink/8 px-3 py-2 text-sm font-medium text-coralpink">
						<AlertCircle
							className="mt-0.5 h-4 w-4 shrink-0"
							aria-hidden="true"
						/>
						<span>{importDialog.importError}</span>
					</div>
				) : null}

				<div
					tabIndex={0}
					onDragOver={(event) => {
						if (!importDialog.progress) event.preventDefault();
					}}
					onDrop={(event) => {
						event.preventDefault();
						if (!importDialog.progress)
							void importDialog.handleFileUpload(
								event.dataTransfer.files[0],
							);
					}}
					onPaste={(event) => {
						if (
							!isUnitOfMeasurementImportGridPasteTarget(
								event.target,
							)
						) {
							return;
						}

						const text = event.clipboardData.getData("text");

						if (text.trim()) {
							event.preventDefault();
							importDialog.pasteIntoPreviewGrid(text);
						}
					}}
					className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-purple-200 shadow-[0_0_0_2px_rgba(168,85,247,0.08)] outline-none focus:ring-2 focus:ring-purple-500/15"
					aria-label={UnitOfMeasurementImportPreviewGridLabel}
				>
					<div className="min-h-36 flex-1 overflow-auto">
						<table
							className="module-import-preview-table table-fixed text-left text-sm text-darknavy"
							style={{
								width: `max(100%, ${importDialog.importTableWidth}px)`,
							}}
						>
							<colgroup>
								<col
									style={{
										width: ModuleImportSelectionColumnWidth,
									}}
								/>
								<col
									style={{
										width: ModuleImportRowNumberColumnWidth,
									}}
								/>
								{UnitOfMeasurementImportFieldOrder.map(
									(field) => (
										<col
											key={field}
											style={{
												width: getModuleImportDataColumnWidth(
													importDialog.columnWidths[field],
													Object.values(importDialog.columnWidths).reduce((total, width) => total + width, 0),
												),
											}}
										/>
									),
								)}
							</colgroup>
							<thead className="text-xs uppercase text-darknavy/55">
								<tr>
									<ModuleImportSelectionHeader
										checked={
											importDialog.selectedRowIds.size > 0
										}
										disabled={
											importDialog.visibleRows.length ===
												0 ||
											Boolean(importDialog.progress)
										}
										isOpen={
											importDialog.isSelectionMenuOpen
										}
										onClearSelection={
											importDialog.clearRowSelection
										}
										onSelectAll={() =>
											importDialog.selectRows("all")
										}
										onSelectPage={() =>
											importDialog.selectRows("page")
										}
										onToggleOpen={() =>
											importDialog.setIsSelectionMenuOpen(
												(isOpen) => !isOpen,
											)
										}
									/>
									<ModuleImportRowNumberHeader />
									{UnitOfMeasurementImportColumnHeaders.map(
										(column) => (
											<ModuleImportResizableColumnHeader
												key={column.id}
												className={column.className}
												left={
													column.stickyLeft ===
													undefined
														? undefined
														: ModuleImportFixedColumnsWidth
												}
												width={
													importDialog.columnWidths[
														column.id
													]
												}
												onResize={(width) =>
													importDialog.updateColumnWidth(
														column.id,
														width,
													)
												}
											>
												{column.label}
											</ModuleImportResizableColumnHeader>
										),
									)}
								</tr>
							</thead>
							<tbody className="divide-y divide-darknavy/8 bg-white">
								{importDialog.visibleRows.length > 0 ? (
									importDialog.visibleRows.map((row) => (
										<UnitOfMeasurementImportPreviewTableRow
											key={row.id}
											row={row}
											isSelected={importDialog.selectedRowIds.has(
												row.id,
											)}
											onUpdateCell={
												importDialog.updatePreviewCell
											}
											onPasteCell={
												importDialog.pasteIntoPreviewCell
											}
											onMoveRow={
												importDialog.movePreviewRow
											}
											onToggleSelected={
												importDialog.toggleRowSelection
											}
										/>
									))
								) : (
									<tr>
										<td
											colSpan={
												UnitOfMeasurementImportPreviewColumnCount +
												1
											}
											className="module-import-empty-cell px-3 py-10 text-center text-sm font-medium text-darknavy/45"
										>
											<ModuleImportEmptyDropzone
												accept={
													UnitOfMeasurementImportAcceptedFileExtensions
												}
												acceptedFileLabel={
													UnitOfMeasurementImportAcceptedFileLabel
												}
												disabled={Boolean(
													importDialog.progress,
												)}
												isParsing={
													importDialog.isParsing
												}
												maxFileSizeLabel={
													AppMaxFileUploadSizeLabel
												}
												onFileSelect={(file) =>
													void importDialog.handleFileUpload(
														file,
													)
												}
											/>
										</td>
									</tr>
								)}
							</tbody>
						</table>
					</div>
					<ModuleImportPaginationBar
						currentPage={importDialog.safePreviewPage}
						invalidCount={importDialog.invalidRows.length}
						isBusy={Boolean(importDialog.progress)}
						selectedCount={
							importDialog.progress
								? 0
								: importDialog.selectedRowIds.size
						}
						totalRowsCount={importDialog.validatedRows.length}
						totalPages={importDialog.totalPages}
						onAddRow={importDialog.addBlankRow}
						onGoToPage={importDialog.setPreviewPage}
						onNextPage={() =>
							importDialog.setPreviewPage((page) =>
								Math.min(importDialog.totalPages, page + 1),
							)
						}
						onPreviousPage={() =>
							importDialog.setPreviewPage((page) =>
								Math.max(1, page - 1),
							)
						}
						onRemoveSelected={importDialog.removeSelectedRows}
					/>
				</div>
			</div>
		</ModuleImportDialog>
	);
}
