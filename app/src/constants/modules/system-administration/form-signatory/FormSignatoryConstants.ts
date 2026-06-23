import type { ColumnDef } from "@tanstack/react-table";
import type { FormSignatoryRow } from "@/app/src/types/modules/system-administration/form-signatory/FormSignatoryTypes";

export const FormSignatoryHref = "/system-administration/form-signatory";
export const FormSignatoryPaginationStorageKey = "system-administration-form-signatory";
export const FormSignatoryMaxRows = 5;
// TODO: Handle existing rows with label = "Temporary Signature" through a manual cleanup path.
export const FormSignatoryTemporarySignatureLabel = "Temporary Signature";
export const FormSignatoryLabelOptions = [
	{ label: "Prepared by", value: "Prepared by" },
	{ label: "Approved by", value: "Approved by" },
];
export const FormSignatoryTemporaryOptions = [
	{ label: "Select", value: "" },
	{ label: "Yes", value: "true" },
	{ label: "No", value: "false" },
];
export const FormSignatoryFilterOptions = [
	{ label: "All signatories", value: "" },
	...FormSignatoryLabelOptions,
];

const FormSignatoryTableColumns: ColumnDef<FormSignatoryRow>[] = [
	{
		id: "number",
		header: "No.",
		enableSorting: false,
		meta: { className: "w-16" },
	},
	{
		accessorKey: "label",
		header: "Label",
		enableSorting: false,
		meta: { className: "min-w-56" },
	},
	{
		accessorKey: "isThisTemporary",
		header: "Temporary?",
		enableSorting: false,
		meta: { className: "min-w-40" },
	},
	{
		accessorKey: "name",
		header: "Name",
		enableSorting: false,
		meta: { className: "min-w-60" },
	},
	{
		accessorKey: "position",
		header: "Position",
		enableSorting: false,
		meta: { className: "min-w-60" },
	},
	{
		accessorKey: "signatureName",
		header: "Signature",
		enableSorting: false,
		meta: { className: "min-w-72" },
	},
	{
		id: "preview",
		header: "Preview",
		enableSorting: false,
		meta: { className: "min-w-48" },
	},
	{
		accessorKey: "signatureValidUntil",
		header: "Valid Until",
		enableSorting: false,
		meta: { className: "min-w-44" },
	},
	{
		id: "actions",
		header: "Actions",
		enableSorting: false,
		meta: {
			className:
				"sticky right-0 z-20 w-36 bg-slate-50 text-right shadow-[-10px_0_18px_-18px_rgba(15,23,42,0.65)]",
		},
	},
];

export function getFormSignatoryTableColumns(showSignatureValidity: boolean) {
	return showSignatureValidity
		? FormSignatoryTableColumns
		: FormSignatoryTableColumns.filter(
				(column) =>
					!("accessorKey" in column) ||
					column.accessorKey !== "signatureValidUntil",
			);
}
