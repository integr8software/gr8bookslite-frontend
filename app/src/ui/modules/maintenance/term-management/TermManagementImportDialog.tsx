"use client";

import {
	AlertCircle,
	Download,
	Plus,
} from "lucide-react";
import { AppMaxFileUploadSizeLabel } from "@/app/src/constants/shared/app/AppConstants";
import { useTermManagementImportDialog } from "@/app/src/hooks/modules/maintenance/term-management/useTermManagementImportDialog";
import { ClickOrDragDropFile } from "@/app/src/ui/shared/module/ClickOrDragDropFile";
import { ModuleImportDialog } from "@/app/src/ui/shared/module/ModuleImportDialog";
import {
	ModuleImportFooter,
	ModuleImportPaginationBar,
	ModuleImportProgressPanel,
	ModuleImportSelectionHeader,
} from "@/app/src/ui/shared/module/ModuleImportControls";
import {
	ModuleImportResizableColumnHeader,
} from "@/app/src/ui/shared/module/ModuleImportResizableColumnHeader";

import {
	ImportFieldOrder,
	TermImportAcceptedFileExtensions,
	TermImportAcceptedFileLabel,
	TermImportColumnHeaders,
	TermImportPreviewColumnCount,
	TermImportPreviewEmptyMessage,
	TermImportPreviewGridLabel,
	MaxImportFileSizeBytes,
	MinImportFileSizeBytes,
	SelectionColumnWidth,
} from "@/app/src/constants/modules/maintenance/financial-management/term-management/TermManagementConstants";
import type {
	TermManagementImportDialogProps,
} from "@/app/src/types/modules/maintenance/term-management/TermManagementTypes";
import { TermImportPreviewTableRow } from "@/app/src/ui/modules/maintenance/term-management/TermManagementImportPreviewTableRow";
import {
	downloadTermImportTemplate,
	isTermImportGridPasteTarget,
} from "@/app/src/data/modules/maintenance/financial-management/term-management/TermManagementData";
import { formatFileSize } from "@/app/src/utils/file.util";

export function TermManagementImportDialog({
	existingTerms,
	isOpen,
	onClose,
	onImportTerms,
}: TermManagementImportDialogProps) {
	const importDialog = useTermManagementImportDialog({
		existingTerms,
		onClose,
		onImportTerms,
	});

	return (
		<ModuleImportDialog
			isOpen={isOpen}
			isBusy={Boolean(importDialog.progress)}
			title="Import Data"
			titleId="term-management-import-title"
			description="Upload, validate, edit, and import data in queued batches."
			onClose={onClose}
			actions={
				<div className="grid gap-3 lg:grid-cols-[minmax(18rem,1fr)_auto]">
					<ClickOrDragDropFile
						accept={TermImportAcceptedFileExtensions}
						acceptedFileLabel={TermImportAcceptedFileLabel}
						className="inline-flex min-h-20 w-full cursor-pointer flex-col items-center justify-center gap-1.5 rounded-md border border-dashed border-skyblue/35 bg-skyblue/8 px-4 py-3 text-center text-sm font-semibold text-skyblue transition hover:bg-skyblue/12"
						disabled={Boolean(importDialog.progress)}
						isBusy={importDialog.isParsing}
						label="Upload or Drag and Drop Files"
						size="medium"
						stackable
						onFileSelect={(file) => void importDialog.handleFileUpload(file)}
					/>
					<div className="grid grid-cols-2 gap-2 lg:flex lg:items-start lg:justify-end">
						<button
							type="button"
							onClick={() => void downloadTermImportTemplate()}
							disabled={Boolean(importDialog.progress)}
							className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md border border-darknavy/12 bg-white px-3 text-sm font-semibold text-darknavy transition hover:bg-skyblue/8 disabled:cursor-not-allowed disabled:opacity-55 lg:w-auto lg:px-4"
						>
							<Download className="h-4 w-4" aria-hidden="true" />
							Template
						</button>
						<button
							type="button"
							onClick={importDialog.addBlankRow}
							disabled={Boolean(importDialog.progress)}
							className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md border border-darknavy/12 bg-white px-3 text-sm font-semibold text-darknavy transition hover:bg-skyblue/8 disabled:cursor-not-allowed disabled:opacity-55 lg:w-auto lg:px-4"
						>
							<Plus className="h-4 w-4" aria-hidden="true" />
							Add Row
						</button>
					</div>
					<div className="grid gap-2 text-xs font-medium text-darknavy/45 lg:col-span-2 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
						<p className="sm:hidden">
							Accepted: .xlsx, .csv, .tsv, .txt. Maximum size:{" "}
							{AppMaxFileUploadSizeLabel}.
						</p>
						<p className="hidden sm:block">
							Accepted: .xlsx, .csv, .tsv, .txt. Size:{" "}
							{formatFileSize(MinImportFileSizeBytes)} to{" "}
							{formatFileSize(MaxImportFileSizeBytes)}. Upload one file at a
							time; each upload or grid paste adds rows. Duplicate names are not
							accepted.
						</p>
						<div className="flex flex-wrap gap-2 font-semibold text-darknavy/60">
							<span>Rows: {importDialog.validatedRows.length}</span>
							<span>Valid: {importDialog.validRows.length}</span>
							<span>Incorrect: {importDialog.invalidRows.length}</span>
						</div>
					</div>
				</div>
			}
			progress={
				importDialog.progress ? (
					<ModuleImportProgressPanel progress={importDialog.progress} />
				) : null
			}
			footer={
				<ModuleImportFooter
					canImport={importDialog.canImport}
					canImportAllRows={importDialog.canImportAllRows}
					canImportAllValid={importDialog.canImportAllValid}
					canImportSelectedValid={importDialog.canImportSelectedValid}
					importMode={importDialog.importMode}
					isBusy={Boolean(importDialog.progress)}
					isImportMenuOpen={importDialog.isImportMenuOpen}
					selectedValidRowsCount={importDialog.validSelectedRows.length}
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
					onPaste={(event) => {
						if (!isTermImportGridPasteTarget(event.target)) {
							return;
						}

						const text = event.clipboardData.getData("text");

						if (text.trim()) {
							event.preventDefault();
							importDialog.pasteIntoPreviewGrid(text);
						}
					}}
					className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-darknavy/10 outline-none focus:ring-2 focus:ring-skyblue/15"
					aria-label={TermImportPreviewGridLabel}
				>
					<div className="min-h-36 flex-1 overflow-auto">
						<table
							className="table-fixed text-left text-sm text-darknavy"
							style={{ width: `max(100%, ${importDialog.importTableWidth}px)` }}
						>
							<colgroup>
								<col style={{ width: SelectionColumnWidth }} />
								{ImportFieldOrder.map((field) => (
									<col
										key={field}
										style={{ width: importDialog.columnWidths[field] }}
									/>
								))}
							</colgroup>
							<thead className="text-xs uppercase text-darknavy/55">
								<tr>
									<ModuleImportSelectionHeader
										checked={importDialog.selectedRowIds.size > 0}
										disabled={
											importDialog.visibleRows.length === 0 ||
											Boolean(importDialog.progress)
										}
										isOpen={importDialog.isSelectionMenuOpen}
										onClearSelection={importDialog.clearRowSelection}
										onSelectAll={() => importDialog.selectRows("all")}
										onSelectPage={() => importDialog.selectRows("page")}
										onToggleOpen={() =>
											importDialog.setIsSelectionMenuOpen(
												(isOpen) => !isOpen,
											)
										}
									/>
									{TermImportColumnHeaders.map((column) => (
										<ModuleImportResizableColumnHeader
											key={column.id}
											className={column.className}
											left={column.stickyLeft}
											width={importDialog.columnWidths[column.id]}
											onResize={(width) =>
												importDialog.updateColumnWidth(column.id, width)
											}
										>
											{column.label}
										</ModuleImportResizableColumnHeader>
									))}
								</tr>
							</thead>
							<tbody className="divide-y divide-darknavy/8 bg-white">
								{importDialog.visibleRows.length > 0 ? (
									importDialog.visibleRows.map((row) => (
										<TermImportPreviewTableRow
											key={row.id}
											row={row}
											isSelected={importDialog.selectedRowIds.has(row.id)}
											onUpdateCell={importDialog.updatePreviewCell}
											onPasteCell={importDialog.pasteIntoPreviewCell}
											onToggleSelected={importDialog.toggleRowSelection}
										/>
									))
								) : (
									<tr>
										<td
											colSpan={TermImportPreviewColumnCount}
											className="px-3 py-10 text-center text-sm font-medium text-darknavy/45"
										>
											{TermImportPreviewEmptyMessage}
										</td>
									</tr>
								)}
							</tbody>
						</table>
					</div>
					<ModuleImportPaginationBar
						currentPage={importDialog.safePreviewPage}
						selectedCount={
							importDialog.progress ? 0 : importDialog.selectedRowIds.size
						}
						selectedSummary={
							importDialog.selectedRowIds.size > 0
								? `${importDialog.selectedRowIds.size} of ${importDialog.validatedRows.length} selected`
								: null
						}
						totalPages={importDialog.totalPages}
						onNextPage={() =>
							importDialog.setPreviewPage((page) =>
								Math.min(importDialog.totalPages, page + 1),
							)
						}
						onPreviousPage={() =>
							importDialog.setPreviewPage((page) => Math.max(1, page - 1))
						}
						onRemoveSelected={importDialog.removeSelectedRows}
					/>
				</div>
			</div>
		</ModuleImportDialog>
	);
}
