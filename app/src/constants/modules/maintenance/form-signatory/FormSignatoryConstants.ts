import type { ColumnDef } from "@tanstack/react-table";
import type { FormSignatoryRow } from "@/app/src/types/modules/maintenance/form-signatory/FormSignatoryTypes";

export const FormSignatoryHref = "/maintenance/form-signatory";
export const FormSignatoryStorageKey = "gr8books.formSignatorySetups";
export const FormSignatoryPaginationStorageKey = "maintenance-form-signatory";
export const FormSignatoryMaxRows = 5;

export const FormSignatoryTableColumns: ColumnDef<FormSignatoryRow>[] = [
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
		meta: { className: "min-w-64" },
	},
	{
		accessorKey: "name",
		header: "Name",
		enableSorting: false,
		meta: { className: "min-w-72" },
	},
	{
		accessorKey: "position",
		header: "Position",
		enableSorting: false,
		meta: { className: "min-w-72" },
	},
	{
		accessorKey: "signatureName",
		header: "Signature",
		enableSorting: false,
		meta: { className: "min-w-96" },
	},
	{
		id: "preview",
		header: "Preview",
		enableSorting: false,
		meta: { className: "min-w-56" },
	},
	{
		id: "actions",
		header: "Actions",
		enableSorting: false,
		meta: { className: "w-28 text-right" },
	},
];
