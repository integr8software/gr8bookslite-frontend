"use client";

import Image from "next/image";
import { type ChangeEvent } from "react";
import { ImageIcon, PenLine } from "lucide-react";
import {
	ModuleTableActionButton,
	ModuleTableActionLink,
	ModuleTableActions,
} from "@/app/src/ui/shared/module/module-table/ModuleTableActions";
import { FormSignatoryDefaultLabels } from "@/app/src/data/modules/maintenance/form-signatory/FormSignatoryData";
import type { FormSignatoryRow } from "@/app/src/types/modules/maintenance/form-signatory/FormSignatoryTypes";

type FormSignatoryTableRowProps = {
	editHref: string;
	isEditing: boolean;
	row: FormSignatoryRow;
	rowNumber: number;
	onClearSignature: (row: FormSignatoryRow) => void;
	onMakeSignature: (row: FormSignatoryRow) => void;
	onRemoveRow: (rowId: string) => void;
	onSignatureFileChange: (rowId: string, file: File | undefined) => void;
	onUpdateRow: (rowId: string, updates: Partial<FormSignatoryRow>) => void;
};

export function FormSignatoryTableRow({
	editHref,
	isEditing,
	row,
	rowNumber,
	onClearSignature,
	onMakeSignature,
	onRemoveRow,
	onSignatureFileChange,
	onUpdateRow,
}: FormSignatoryTableRowProps) {
	const labelOptions = FormSignatoryDefaultLabels.includes(row.label)
		? FormSignatoryDefaultLabels
		: [row.label, ...FormSignatoryDefaultLabels];

	function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
		onSignatureFileChange(row.id, event.target.files?.[0]);
		event.target.value = "";
	}

	return (
		<tr className="align-middle">
			<td className="align-middle font-semibold text-darknavy">
				{rowNumber}
			</td>
			<td className="align-middle">
				<select
					value={row.label}
					disabled={!isEditing}
					onChange={(event) =>
						onUpdateRow(row.id, { label: event.target.value })
					}
					className={inputClassNames}
				>
					{labelOptions.map((label) => (
						<option key={label} value={label}>
							{label}
						</option>
					))}
				</select>
			</td>
			<td className="align-middle">
				<input
					type="text"
					value={row.name}
					disabled={!isEditing}
					onChange={(event) =>
						onUpdateRow(row.id, { name: event.target.value })
					}
					className={inputClassNames}
				/>
			</td>
			<td className="align-middle">
				<input
					type="text"
					value={row.position}
					disabled={!isEditing}
					onChange={(event) =>
						onUpdateRow(row.id, { position: event.target.value })
					}
					className={inputClassNames}
				/>
			</td>
			<td className="align-middle">
				<label
					className={`flex h-11 items-center overflow-hidden rounded-lg border border-darknavy/12 bg-white text-sm text-darknavy shadow-sm transition ${
						isEditing
							? "cursor-pointer hover:border-skyblue/45"
							: "cursor-not-allowed opacity-65"
					}`}
				>
					<span className="flex h-full w-11 shrink-0 items-center justify-center border-r border-darknavy/10 bg-offwhite text-darknavy/45">
						<ImageIcon className="h-4 w-4" aria-hidden="true" />
					</span>
					<span className="min-w-0 flex-1 truncate px-3 text-darknavy/65">
						{row.signatureName || "No file chosen"}
					</span>
					{row.signaturePreview && isEditing ? (
						<button
							type="button"
							onClick={(event) => {
								event.preventDefault();
								onClearSignature(row);
							}}
							className="h-full shrink-0 border-l border-darknavy/10 px-3 text-xs font-semibold text-coralpink transition hover:bg-coralpink/8"
						>
							Remove
						</button>
					) : null}
					<input
						type="file"
						accept="image/*"
						disabled={!isEditing}
						onChange={handleFileChange}
						className="sr-only"
					/>
				</label>
			</td>
			<td className="align-middle">
				<div className="mx-auto flex h-18 items-center justify-center rounded-lg border border-dashed border-darknavy/14 bg-offwhite">
					{row.signaturePreview ? (
						<Image
							src={row.signaturePreview}
							alt={`${row.label} signature preview`}
							width={160}
							height={56}
							unoptimized
							className="max-h-14 max-w-full object-contain"
						/>
					) : (
						<span className="text-xs font-medium text-darknavy/38">
							No preview
						</span>
					)}
				</div>
			</td>
			<td className="align-middle">
				<ModuleTableActions>
					{isEditing ? (
						<>
							<ModuleTableActionButton
								icon={PenLine}
								label={`Make signature for ${row.label}`}
								onClick={() => onMakeSignature(row)}
							/>
							<ModuleTableActionButton
								label={`Clear signature for ${row.label}`}
								variant="delete"
								disabled={!row.signaturePreview}
								onClick={() => onClearSignature(row)}
							/>
							<ModuleTableActionButton
								label={`Remove ${row.label}`}
								variant="inactive"
								onClick={() => onRemoveRow(row.id)}
							/>
						</>
					) : (
						<ModuleTableActionLink
							variant="edit"
							href={editHref}
							label={`Edit ${row.label}`}
						/>
					)}
				</ModuleTableActions>
			</td>
		</tr>
	);
}

const inputClassNames =
	"h-11 w-full rounded-lg border border-darknavy/12 bg-white px-3 text-sm font-medium text-darknavy shadow-sm outline-none transition focus:border-skyblue/45 focus:ring-4 focus:ring-skyblue/15 disabled:bg-darknavy/5 disabled:text-darknavy/45";
