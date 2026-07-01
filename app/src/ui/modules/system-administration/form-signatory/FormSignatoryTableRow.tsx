"use client";

import Image from "next/image";
import { type ChangeEvent } from "react";
import { ImageIcon, Signature } from "lucide-react";
import {
	ModuleTableActionButton,
	ModuleTableActionLink,
	ModuleTableActions,
} from "@/app/src/ui/shared/module/module-table/ModuleTableActions";
import {
	FormSignatoryLabelOptions,
	FormSignatoryTemporaryOptions,
} from "@/app/src/constants/modules/system-administration/form-signatory/FormSignatoryConstants";
import type { FormSignatoryRow } from "@/app/src/types/modules/system-administration/form-signatory/FormSignatoryTypes";

type FormSignatoryTableRowProps = {
	editHref: string;
	isDeleting: boolean;
	isEditing: boolean;
	row: FormSignatoryRow;
	rowNumber: number;
	showSignatureValidity: boolean;
	onClearSignature: (row: FormSignatoryRow) => void;
	onDeleteRow: (row: FormSignatoryRow) => void;
	onMakeSignature: (row: FormSignatoryRow) => void;
	onSignatureFileChange: (rowId: string, file: File | undefined) => void;
	onUpdateRow: (rowId: string, updates: Partial<FormSignatoryRow>) => void;
};

export function FormSignatoryTableRow({
	editHref,
	isDeleting,
	isEditing,
	row,
	rowNumber,
	showSignatureValidity,
	onClearSignature,
	onDeleteRow,
	onMakeSignature,
	onSignatureFileChange,
	onUpdateRow,
}: FormSignatoryTableRowProps) {
	function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
		onSignatureFileChange(row.id, event.target.files?.[0]);
		event.target.value = "";
	}
	const isTemporarySignature = row.isThisTemporary === true;
	const displayLabel =
		row.isThisTemporary === true ? `Temporary ${row.label}` : row.label;

	return (
		<tr className="align-middle">
			<td className="align-middle font-semibold text-darknavy">
				{rowNumber}
			</td>
			<td className="align-middle">
				{isEditing ? (
					<select
						value={row.label}
						onChange={(event) => {
							onUpdateRow(row.id, {
								label: event.target.value,
							});
						}}
						className={inputClassNames}
					>
						{getLabelOptions(row.label).map((option) => (
							<option key={option.value} value={option.value}>
								{option.label}
							</option>
						))}
					</select>
				) : (
					<input
						type="text"
						value={displayLabel}
						disabled
						readOnly
						className={inputClassNames}
					/>
				)}
			</td>
			<td className="align-middle">
				<select
					value={temporarySelectValue(row.isThisTemporary)}
					disabled={!isEditing}
					onChange={(event) =>
						onUpdateRow(row.id, {
							isThisTemporary: parseTemporarySelectValue(
								event.target.value,
							),
						})
					}
					className={inputClassNames}
				>
					{FormSignatoryTemporaryOptions.map((option) => (
						<option key={option.value} value={option.value}>
							{option.label}
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
					className={`flex h-11 items-center overflow-hidden rounded-lg border border-darknavy/12 bg-white text-sm text-darknavy shadow-sm transition ${isEditing
							? "cursor-pointer hover:border-skyblue/45"
							: "cursor-default"
						}`}
				>
					<span className="flex h-full w-11 shrink-0 items-center justify-center border-r border-darknavy/10 bg-offwhite text-darknavy/45">
						<ImageIcon className="h-4 w-4" aria-hidden="true" />
					</span>
					<span className="min-w-0 flex-1 truncate px-3 text-darknavy/75">
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
							alt={`${displayLabel} signature preview`}
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
			{showSignatureValidity ? (
				<td className="align-middle">
					{isTemporarySignature ? (
						<>
							<input
								type="date"
								value={toDateInputValue(
									row.signatureValidUntil,
								)}
								disabled={!isEditing}
								onChange={(event) =>
									onUpdateRow(row.id, {
										signatureValidUntil: event.target.value,
									})
								}
								className={inputClassNames}
								title="Set the last date this temporary signature can be used"
							/>
							{isSignatureExpired(row.signatureValidUntil) ? (
								<span className="mt-1 block text-xs font-semibold text-coralpink">
									Expired
								</span>
							) : null}
						</>
					) : null}
				</td>
			) : null}
			<td className="sticky right-0 z-10 bg-white align-middle shadow-[-10px_0_18px_-18px_rgba(15,23,42,0.65)]">
				<ModuleTableActions>
					{isEditing ? (
						<>
							<ModuleTableActionButton
								icon={Signature}
								label={`Make signature for ${displayLabel}`}
								onClick={() => onMakeSignature(row)}
							/>
							<ModuleTableActionButton
								variant="delete"
								label={`Delete row ${rowNumber}`}
								disabled={isDeleting}
								isLoading={isDeleting}
								onClick={() => onDeleteRow(row)}
							/>
						</>
					) : (
						<>
							<ModuleTableActionLink
								variant="edit"
								href={editHref}
								label={`Edit ${displayLabel}`}
							/>
							<ModuleTableActionButton
								variant="delete"
								label={`Delete row ${rowNumber}`}
								disabled={isDeleting}
								isLoading={isDeleting}
								onClick={() => onDeleteRow(row)}
							/>
						</>
					)}
				</ModuleTableActions>
			</td>
		</tr>
	);
}

const inputClassNames =
	"h-11 w-full rounded-lg border border-darknavy/12 bg-white px-3 text-sm font-medium text-darknavy shadow-sm outline-none transition focus:border-skyblue/45 focus:ring-4 focus:ring-skyblue/15 disabled:cursor-default disabled:bg-white disabled:text-darknavy/75 disabled:opacity-100";

function getLabelOptions(currentLabel: string) {
	if (
		currentLabel &&
		!FormSignatoryLabelOptions.some(
			(option) => option.value === currentLabel,
		)
	) {
		return [
			{ label: currentLabel, value: currentLabel },
			...FormSignatoryLabelOptions,
		];
	}

	return FormSignatoryLabelOptions;
}

function toDateInputValue(value: string) {
	if (!value) {
		return "";
	}

	return value.slice(0, 10);
}

function temporarySelectValue(value: boolean | null | undefined) {
	if (value === true) {
		return "true";
	}

	if (value === false) {
		return "false";
	}

	return "";
}

function parseTemporarySelectValue(value: string) {
	if (value === "true") {
		return true;
	}

	if (value === "false") {
		return false;
	}

	return null;
}

function isSignatureExpired(value: string) {
	if (!value) {
		return false;
	}

	const validUntil = new Date(`${value.slice(0, 10)}T23:59:59`);

	return !Number.isNaN(validUntil.getTime()) && validUntil < new Date();
}
