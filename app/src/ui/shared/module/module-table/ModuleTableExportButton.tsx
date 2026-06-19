"use client";

import {
	useEffect,
	useRef,
	useState,
	type ComponentPropsWithoutRef,
	type ReactNode,
} from "react";
import type { Table } from "@tanstack/react-table";
import { Check, Download, FileDown, FileSpreadsheet, FileText } from "lucide-react";
import { ModuleTooltip } from "@/app/src/ui/shared/module/ModuleTooltip";
import { createCsv } from "@/app/src/ui/shared/module/module-table/ModuleTableExportCsv";
import { downloadBlob } from "@/app/src/ui/shared/module/module-table/ModuleTableExportDownload";
import { createXlsxWorkbook } from "@/app/src/ui/shared/module/module-table/ModuleTableExportExcel";
import { createSimplePdf } from "@/app/src/ui/shared/module/module-table/ModuleTableExportPdf";
import {
	createExportFileName,
	createExportRows,
	getExportColumns,
} from "@/app/src/ui/shared/module/module-table/ModuleTableExportRows";
import type {
	ModuleTableExportColumn,
	ModuleTableExportColumnScope,
	ModuleTableExportFormat,
	ModuleTableExportScope,
} from "@/app/src/ui/shared/module/module-table/ModuleTableExportTypes";
import {
	joinClasses,
	moduleAccentClassNames,
} from "@/app/src/ui/shared/module/module-table/utils";

export type {
	ModuleTableExportColumn,
	ModuleTableExportColumnScope,
	ModuleTableExportFormat,
	ModuleTableExportScope,
} from "@/app/src/ui/shared/module/module-table/ModuleTableExportTypes";

type ModuleTableExportButtonProps<TData> = Omit<
	ComponentPropsWithoutRef<"div">,
	"children"
> & {
	allRows: TData[];
	columns: ModuleTableExportColumn<TData>[];
	fileName?: string;
	filteredRows?: TData[];
	isFiltered?: boolean;
	label?: string;
	table?: Table<TData>;
	title?: string;
};

const ExportFormats: Array<{
	format: ModuleTableExportFormat;
	icon: typeof FileText;
	label: string;
}> = [
	{ format: "csv", icon: FileText, label: "CSV" },
	{ format: "excel", icon: FileSpreadsheet, label: "Excel" },
	{ format: "pdf", icon: FileDown, label: "PDF" },
];

const ExportScopes: Array<{ label: string; scope: ModuleTableExportScope }> = [
	{ label: "All records", scope: "all" },
	{ label: "Based on filter", scope: "filtered" },
];

export function ModuleTableExportButton<TData>({
	allRows,
	className,
	columns,
	fileName = "table-export",
	filteredRows,
	isFiltered = false,
	label = "Export",
	table,
	title = "Export",
	...props
}: ModuleTableExportButtonProps<TData>) {
	const [isOpen, setIsOpen] = useState(false);
	const [columnScope, setColumnScope] =
		useState<ModuleTableExportColumnScope>("visible");
	const [recordScope, setRecordScope] = useState<ModuleTableExportScope>("all");
	const containerRef = useRef<HTMLDivElement>(null);
	const safeFilteredRows = filteredRows ?? allRows;
	const hasRows = allRows.length > 0 || safeFilteredRows.length > 0;
	const canExportFiltered = isFiltered && safeFilteredRows.length > 0;
	const selectedRecordScope =
		recordScope === "filtered" && canExportFiltered ? "filtered" : "all";

	useEffect(() => {
		if (!isOpen) {
			return;
		}

		function handlePointerDown(event: PointerEvent) {
			const target = event.target;

			if (target instanceof Node && !containerRef.current?.contains(target)) {
				setIsOpen(false);
			}
		}

		function handleKeyDown(event: KeyboardEvent) {
			if (event.key === "Escape") {
				setIsOpen(false);
			}
		}

		document.addEventListener("pointerdown", handlePointerDown);
		document.addEventListener("keydown", handleKeyDown);

		return () => {
			document.removeEventListener("pointerdown", handlePointerDown);
			document.removeEventListener("keydown", handleKeyDown);
		};
	}, [isOpen]);

	async function handleExport(format: ModuleTableExportFormat) {
		const rows = selectedRecordScope === "all" ? allRows : safeFilteredRows;
		const exportColumns = getExportColumns({
			columnScope,
			columns,
			table,
		});
		const exportRows = createExportRows(rows, exportColumns);
		const exportFileName = createExportFileName({
			columnScope,
			fileName,
			recordScope: selectedRecordScope,
		});

		setIsOpen(false);

		if (format === "csv") {
			downloadBlob(
				new Blob([createCsv(exportRows)], {
					type: "text/csv;charset=utf-8",
				}),
				`${exportFileName}.csv`,
			);
			return;
		}

		if (format === "excel") {
			const buffer = await createXlsxWorkbook(exportRows, title);

			downloadBlob(
				new Blob([buffer], {
					type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
				}),
				`${exportFileName}.xlsx`,
			);
			return;
		}

		downloadBlob(
			new Blob([createSimplePdf(title, exportRows)], {
				type: "application/pdf",
			}),
			`${exportFileName}.pdf`,
		);
	}

	return (
		<div
			ref={containerRef}
			className={joinClasses("relative min-w-0", isOpen && "z-70", className)}
			{...props}
		>
			<ModuleTooltip className="w-full" title={label} position="top">
				<button
					type="button"
					aria-expanded={isOpen}
					aria-haspopup="menu"
					aria-label={label}
					disabled={!hasRows || columns.length === 0}
					onClick={() => setIsOpen((current) => !current)}
					className={joinClasses(
						"inline-flex h-12 w-full items-center justify-center rounded-lg border border-darknavy/10 bg-white px-3 text-sm font-semibold text-darknavy/70 shadow-sm shadow-darknavy/5 transition hover:text-darknavy focus-visible:outline-none focus-visible:ring-4 disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:bg-white",
						moduleAccentClassNames.hoverBorder,
						moduleAccentClassNames.hoverSoftBackground,
						moduleAccentClassNames.focusRing,
					)}
				>
					<Download className="h-4 w-4" aria-hidden="true" />
				</button>
			</ModuleTooltip>

			{isOpen ? (
				<div
					role="menu"
					className="absolute right-0 top-full z-[80] mt-2 w-72 overflow-hidden rounded-lg border border-darknavy/10 bg-white text-darknavy shadow-[0_18px_50px_rgba(33,39,56,0.18)]"
				>
					<div className="border-b border-darknavy/10 px-3 py-2">
						<span className="text-xs font-bold uppercase tracking-wide text-darknavy/55">
							Export
						</span>
					</div>
					<div className="grid gap-3 p-2">
						<ExportChoiceGroup title="Records">
							{ExportScopes.map((scope) => {
								const isDisabled =
									scope.scope === "filtered" && !canExportFiltered;

								return (
									<ExportChoiceButton
										key={scope.scope}
										disabled={isDisabled}
										isSelected={selectedRecordScope === scope.scope && !isDisabled}
										label={
											scope.scope === "filtered" && !isFiltered
												? "Based on filter"
												: scope.label
										}
										description={
											scope.scope === "filtered" && !isFiltered
												? "No filter applied"
												: undefined
										}
										onClick={() => setRecordScope(scope.scope)}
									/>
								);
							})}
						</ExportChoiceGroup>
						<ExportChoiceGroup title="Columns">
							<ExportChoiceButton
								isSelected={columnScope === "visible"}
								label="Current columns"
								description="Uses column order and visibility"
								onClick={() => setColumnScope("visible")}
							/>
							<ExportChoiceButton
								isSelected={columnScope === "all"}
								label="All columns"
								onClick={() => setColumnScope("all")}
							/>
						</ExportChoiceGroup>
						<div className="grid grid-cols-3 gap-1.5 rounded-md bg-darknavy/[0.025] p-2">
							{ExportFormats.map((format) => {
								const Icon = format.icon;

								return (
									<button
										key={format.format}
										type="button"
										role="menuitem"
										onClick={() => void handleExport(format.format)}
										className={joinClasses(
											"inline-flex h-9 items-center justify-center gap-1.5 rounded-md px-2 text-xs font-semibold text-darknavy/70 transition hover:bg-skyblue/10 hover:text-darknavy focus-visible:outline-none focus-visible:ring-2",
											moduleAccentClassNames.focusRing,
										)}
									>
										<Icon className="h-3.5 w-3.5" aria-hidden="true" />
										{format.label}
									</button>
								);
							})}
						</div>
					</div>
				</div>
			) : null}
		</div>
	);
}

function ExportChoiceGroup({
	children,
	title,
}: {
	children: ReactNode;
	title: string;
}) {
	return (
		<div className="rounded-md bg-darknavy/[0.025] p-2">
			<div className="mb-1.5 text-xs font-semibold text-darknavy/55">
				{title}
			</div>
			<div className="grid gap-1">{children}</div>
		</div>
	);
}

function ExportChoiceButton({
	description,
	disabled,
	isSelected,
	label,
	onClick,
}: {
	description?: string;
	disabled?: boolean;
	isSelected: boolean;
	label: string;
	onClick: () => void;
}) {
	return (
		<button
			type="button"
			disabled={disabled}
			onClick={onClick}
			className={joinClasses(
				"flex min-h-9 items-center gap-2 rounded-md px-2 text-left text-xs font-semibold text-darknavy/70 transition hover:bg-skyblue/10 hover:text-darknavy focus-visible:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:bg-transparent",
				moduleAccentClassNames.focusRing,
			)}
		>
			<span
				className={joinClasses(
					"inline-flex h-4 w-4 shrink-0 items-center justify-center rounded border",
					isSelected
						? "border-skyblue bg-skyblue text-white"
						: "border-darknavy/15 bg-white text-transparent",
				)}
			>
				<Check className="h-3 w-3" aria-hidden="true" />
			</span>
			<span className="min-w-0">
				<span className="block truncate">{label}</span>
				{description ? (
					<span className="block truncate text-[0.68rem] font-medium text-darknavy/45">
						{description}
					</span>
				) : null}
			</span>
		</button>
	);
}
