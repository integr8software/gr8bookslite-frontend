import { History, X } from "lucide-react";
import { moduleHeaderActionClassNames } from "@/app/src/ui/shared/module/ModuleHeader";
import type { InventoryCountUploadHistoryEntry } from "@/app/src/types/modules/inventory/inventory-count/InventoryCountTypes";
import { TableCell, TableHeaderCell } from "./InventoryCountItemsTable";

type InventoryCountUploadHistoryDialogProps = {
	isOpen: boolean;
	onClose: () => void;
	rows: InventoryCountUploadHistoryEntry[];
};

export function InventoryCountUploadHistoryDialog({
	isOpen,
	onClose,
	rows,
}: InventoryCountUploadHistoryDialogProps) {
	if (!isOpen) {
		return null;
	}

	return (
		<div
			className="fixed inset-0 z-[130] flex items-end justify-center bg-slate-950/45 px-3 py-3 backdrop-blur-sm sm:items-center sm:px-4 sm:py-6"
			onClick={onClose}
		>
			<section
				aria-modal="true"
				role="dialog"
				aria-labelledby="inventory-count-upload-history-table-title"
				className="w-full max-w-5xl overflow-hidden rounded-lg border border-darknavy/10 bg-white shadow-2xl shadow-slate-950/20"
				onClick={(event) => event.stopPropagation()}
			>
				<header className="flex items-start justify-between gap-4 border-b border-darknavy/10 px-5 py-4">
					<div className="flex items-center gap-2">
						<span className="grid h-8 w-8 place-items-center rounded-md bg-offwhite text-darknavy/70">
							<History className="h-4 w-4" aria-hidden="true" />
						</span>
						<h2
							id="inventory-count-upload-history-table-title"
							className="text-base font-bold text-darknavy"
						>
							Upload Count History
						</h2>
					</div>
					<button
						type="button"
						aria-label="Close upload count history dialog"
						className="rounded-md border border-darknavy/10 p-2 text-darknavy/65 transition hover:bg-offwhite hover:text-darknavy"
						onClick={onClose}
					>
						<X className="h-4 w-4" aria-hidden="true" />
					</button>
				</header>
				<div className="p-4">
					<InventoryCountUploadHistoryTable rows={rows} />
				</div>
				<footer className="flex justify-end border-t border-darknavy/10 px-5 py-4">
					<button
						type="button"
						className={moduleHeaderActionClassNames.secondary}
						onClick={onClose}
					>
						Close
					</button>
				</footer>
			</section>
		</div>
	);
}

function InventoryCountUploadHistoryTable({
	rows,
}: {
	rows: InventoryCountUploadHistoryEntry[];
}) {
	return (
		<section className="overflow-hidden rounded-md border border-darknavy/10 bg-white shadow-sm shadow-darknavy/5">
			<div className="overflow-x-auto">
				<table className="w-full min-w-[46rem] table-fixed border-collapse text-left text-xs text-darknavy">
					<colgroup>
						<col className="w-[17%]" />
						<col className="w-[17%]" />
						<col className="w-[16%]" />
						<col className="w-[26%]" />
						<col className="w-[10%]" />
						<col className="w-[14%]" />
					</colgroup>
					<thead>
						<tr className="bg-[#f59e0b] text-white">
							<TableHeaderCell>Inventory Count No.</TableHeaderCell>
							<TableHeaderCell>Uploaded At</TableHeaderCell>
							<TableHeaderCell>Uploader</TableHeaderCell>
							<TableHeaderCell>File</TableHeaderCell>
							<TableHeaderCell className="text-right">Rows</TableHeaderCell>
							<TableHeaderCell>Status</TableHeaderCell>
						</tr>
					</thead>
					<tbody>
						{rows.map((row) => (
							<tr key={row.id} className="border-b border-darknavy/10 last:border-b-0 even:bg-offwhite/55">
								<TableCell>{row.countNo}</TableCell>
								<TableCell>{row.uploadedAt}</TableCell>
								<TableCell>{row.uploader}</TableCell>
								<TableCell>{row.fileName}</TableCell>
								<TableCell className="text-right tabular-nums">
									{row.rowCount}
								</TableCell>
								<TableCell>
									<span className="rounded-full bg-[#f59e0b]/12 px-2 py-0.5 text-[11px] font-semibold text-[#b45309]">
										{row.status}
									</span>
								</TableCell>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</section>
	);
}
