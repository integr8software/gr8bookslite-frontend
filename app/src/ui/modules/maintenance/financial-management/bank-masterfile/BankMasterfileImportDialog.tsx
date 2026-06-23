"use client";

import { useMemo, useState } from "react";
import { Download, Upload } from "lucide-react";
import toast from "react-hot-toast";
import { BankMasterfileAccountTypeOptions } from "@/app/src/constants/modules/maintenance/financial-management/bank-masterfile/BankMasterfileConstants";
import type {
	BankMasterfile,
	BankMasterfileFormValues,
	BankMasterfileStatus,
} from "@/app/src/types/modules/maintenance/financial-management/bank-masterfile/BankMasterfileTypes";
import { ModuleImportDialog } from "@/app/src/ui/shared/module/ModuleImportDialog";
import { downloadBlob } from "@/app/src/ui/shared/module/module-table/ModuleTableExportDownload";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";

const TemplateHeaders = [
	"Bank",
	"Branch",
	"Account Number",
	"Account Type",
	"Currency",
	"Exchange Rate",
	"Series Start",
	"Series End",
	"Series Digits",
	"Default",
	"Status",
];

export function BankMasterfileImportDialog({
	existingBanks,
	isOpen,
	onClose,
	onImportBanks,
}: {
	existingBanks: BankMasterfile[];
	isOpen: boolean;
	onClose: () => void;
	onImportBanks: (banks: BankMasterfileFormValues[]) => Promise<BankMasterfile[]>;
}) {
	const [rawText, setRawText] = useState("");
	const [isImporting, setIsImporting] = useState(false);
	const previewRows = useMemo(() => parseBankImportText(rawText), [rawText]);
	const validatedRows = useMemo(
		() => validateRows(previewRows, existingBanks),
		[existingBanks, previewRows],
	);
	const validRows = validatedRows.filter((row) => row.errors.length === 0);
	const canImport = validRows.length > 0 && !isImporting;

	function resetAndClose() {
		if (isImporting) return;
		setRawText("");
		onClose();
	}

	async function handleImport() {
		if (!canImport) return;

		setIsImporting(true);
		try {
			await onImportBanks(validRows.map((row) => row.values));
			toast.success(`${validRows.length} bank account${validRows.length === 1 ? "" : "s"} imported.`);
			setRawText("");
			onClose();
		} finally {
			setIsImporting(false);
		}
	}

	return (
		<ModuleImportDialog
			title="Import Bank Masterfile"
			titleId="bank-masterfile-import-title"
			description="Paste CSV or tab-separated bank account rows, then import valid rows."
			isBusy={isImporting}
			isOpen={isOpen}
			onClose={resetAndClose}
			actions={
				<button
					type="button"
					onClick={downloadTemplate}
					className="inline-flex h-10 items-center gap-2 rounded-md border border-darknavy/10 bg-white px-3 text-sm font-semibold text-darknavy transition hover:bg-darknavy/5"
				>
					<Download className="h-4 w-4" aria-hidden="true" />
					Template
				</button>
			}
			footer={
				<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
					<p className="text-sm text-darknavy/60">
						{validRows.length} valid of {validatedRows.length} row{validatedRows.length === 1 ? "" : "s"}
					</p>
					<div className="flex justify-end gap-2">
						<button
							type="button"
							onClick={resetAndClose}
							disabled={isImporting}
							className="inline-flex h-10 items-center justify-center rounded-md border border-darknavy/10 bg-white px-4 text-sm font-semibold text-darknavy transition hover:bg-darknavy/5 disabled:cursor-not-allowed disabled:opacity-60"
						>
							Cancel
						</button>
						<button
							type="button"
							onClick={() => void handleImport()}
							disabled={!canImport}
							className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-skyblue px-4 text-sm font-semibold text-white transition hover:bg-skyblue/90 disabled:cursor-not-allowed disabled:opacity-60"
						>
							<Upload className="h-4 w-4" aria-hidden="true" />
							{isImporting ? "Importing..." : "Import Valid Rows"}
						</button>
					</div>
				</div>
			}
		>
			<div className="grid h-full min-h-0 gap-4 lg:grid-cols-[minmax(18rem,0.85fr)_minmax(24rem,1.15fr)]">
				<textarea
					value={rawText}
					onChange={(event) => setRawText(event.target.value)}
					disabled={isImporting}
					placeholder={TemplateHeaders.join(",")}
					className="min-h-64 rounded-lg border border-darknavy/10 bg-white p-3 font-mono text-sm text-darknavy outline-none transition placeholder:text-darknavy/35 focus:border-skyblue/60 focus:ring-4 focus:ring-skyblue/10 disabled:cursor-not-allowed disabled:bg-darknavy/[0.03]"
				/>
				<div className="min-h-0 overflow-auto rounded-lg border border-darknavy/10">
					<table className="min-w-[58rem] w-full text-left text-sm text-darknavy">
						<thead className="bg-darknavy/[0.03] text-xs uppercase text-darknavy/55">
							<tr>
								<th className="px-3 py-2">Row</th>
								<th className="px-3 py-2">Bank</th>
								<th className="px-3 py-2">Branch</th>
								<th className="px-3 py-2">Account Number</th>
								<th className="px-3 py-2">Status</th>
								<th className="px-3 py-2">Validation</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-darknavy/10">
							{validatedRows.length === 0 ? (
								<tr>
									<td className="px-3 py-8 text-center text-darknavy/55" colSpan={6}>
										No rows to preview.
									</td>
								</tr>
							) : (
								validatedRows.slice(0, 50).map((row) => (
									<tr key={row.rowNumber}>
										<td className="px-3 py-2 font-mono text-darknavy/60">{row.rowNumber}</td>
										<td className="px-3 py-2 font-medium">{row.values.bankName}</td>
										<td className="px-3 py-2">{row.values.branch}</td>
										<td className="px-3 py-2 font-mono">{row.values.accountNumber}</td>
										<td className="px-3 py-2">{row.values.status}</td>
										<td className="px-3 py-2">
											<span
												className={joinClasses(
													"inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
													row.errors.length === 0
														? "bg-emerald-50 text-emerald-700"
														: "bg-coralpink/10 text-coralpink",
												)}
											>
												{row.errors.length === 0 ? "Valid" : row.errors.join(", ")}
											</span>
										</td>
									</tr>
								))
							)}
						</tbody>
					</table>
				</div>
			</div>
		</ModuleImportDialog>
	);
}

type ParsedRow = {
	rowNumber: number;
	values: BankMasterfileFormValues;
};

type ValidatedRow = ParsedRow & { errors: string[] };

function parseBankImportText(text: string): ParsedRow[] {
	return text
		.split(/\r?\n/)
		.map((line) => line.trim())
		.filter(Boolean)
		.filter((line, index) => index > 0 || !looksLikeHeader(line))
		.map((line, index) => {
			const columns = splitImportLine(line);
			return {
				rowNumber: index + 1,
				values: {
					bankName: columns[0]?.trim() ?? "",
					branch: columns[1]?.trim() ?? "",
					accountNumber: columns[2]?.trim() ?? "",
					accountType: columns[3]?.trim() || "Checking",
					currencyCode: columns[4]?.trim() || "PHP",
					currencyExchangeRate: columns[5]?.trim() ?? "",
					seriesStart: columns[6]?.trim() ?? "",
					seriesEnd: columns[7]?.trim() ?? "",
					seriesDigits: columns[8]?.trim() ?? "",
					isDefault: parseBoolean(columns[9]),
					status: parseStatus(columns[10]),
				},
			};
		});
}

function validateRows(rows: ParsedRow[], existingBanks: BankMasterfile[]): ValidatedRow[] {
	const existingKeys = new Set(existingBanks.map(getBankKey));
	const seenKeys = new Set<string>();

	return rows.map((row) => {
		const errors: string[] = [];
		const key = getBankKey(row.values);

		if (!row.values.bankName.trim()) errors.push("Bank required");
		if (!row.values.accountNumber.trim()) errors.push("Account required");
		if (!BankMasterfileAccountTypeOptions.includes(row.values.accountType as never)) {
			errors.push("Invalid type");
		}
		if (existingKeys.has(key)) errors.push("Already exists");
		if (seenKeys.has(key)) errors.push("Duplicate row");
		seenKeys.add(key);

		return { ...row, errors };
	});
}

function splitImportLine(line: string) {
	return line.includes("\t") ? line.split("\t") : line.split(",");
}

function looksLikeHeader(line: string) {
	return line.toLowerCase().includes("bank") && line.toLowerCase().includes("account number");
}

function parseBoolean(value: string | undefined) {
	return ["yes", "true", "1", "default"].includes((value ?? "").trim().toLowerCase());
}

function parseStatus(value: string | undefined): BankMasterfileStatus {
	return (value ?? "").trim().toLowerCase() === "inactive" ? "Inactive" : "Active";
}

function getBankKey(bank: Pick<BankMasterfileFormValues, "bankName" | "branch" | "accountNumber">) {
	return [bank.bankName, bank.branch, bank.accountNumber]
		.map((value) => value.trim().toLowerCase())
		.join("|");
}

function downloadTemplate() {
	downloadBlob(
		new Blob([`${TemplateHeaders.join(",")}\nBDO,Makati,1234567890,Checking,PHP,,,,,No,Active\n`], {
			type: "text/csv;charset=utf-8",
		}),
		"bank-masterfile-import-template.csv",
	);
}