"use client";

import type { PickListFormValues } from "@/app/src/types/modules/inventory/pick-list/PickListTypes";
import {
	InventoryReportDocument,
	formatInventoryReportDate,
	formatInventoryReportNumber,
	type InventoryReportTableColumn,
} from "@/app/src/ui/modules/inventory/shared/report/InventoryReportLayout";
import { ReportPreviewDrawer } from "@/app/src/ui/shared/reports/Reports";

type PickListReportPreviewProps = {
	isOpen: boolean;
	onClose: () => void;
	onGeneratePdf: () => void;
	values: PickListFormValues;
};

export function PickListReportPreview({
	isOpen,
	onClose,
	onGeneratePdf,
	values,
}: PickListReportPreviewProps) {
	return (
		<ReportPreviewDrawer
			isOpen={isOpen}
			eyebrow="Inventory"
			title="Pick List Preview"
			description="Review the printable pick list layout."
			onClose={onClose}
			onGeneratePdf={onGeneratePdf}
		>
			<InventoryReportDocument
				title=""
				afterTitle={
					<div className="text-[11px] font-bold">
						Date: {formatInventoryReportDate(values.documentDate)}
					</div>
				}
				signatures={[
					{ label: "PREPARED BY" },
					{ label: "APPROVED BY" },
					{ label: "RELEASED BY" },
					{ label: "RECEIVED BY" },
				]}
				infoRows={[{ label: values.cluster || "Cluster", value: "" }]}
				tableColumns={PickListReportColumns}
				tableRows={values.lineEntries
					.filter((entry) => entry.vceCode || entry.vceName)
					.map((entry) => ({
						code: entry.vceCode,
						name: entry.vceName,
						cs: "0.00",
						pcS: "0.00",
						po: "0.00",
						add: "",
						ttl: "",
						sales: "",
						return: "",
						discount: "",
					}))}
			/>
		</ReportPreviewDrawer>
	);
}

export const PickListReportColumns = [
	{ key: "code", label: "Code" },
	{ key: "name", label: "Name" },
	{ key: "cs", label: "CS", align: "right" },
	{ key: "pcS", label: "Pc/S", align: "right" },
	{ key: "po", label: "PO", align: "right" },
	{ key: "add", label: "Add" },
	{ key: "ttl", label: "TTL" },
	{ key: "sales", label: "Sales" },
	{ key: "return", label: "Return" },
	{ key: "discount", label: "Discount" },
] satisfies InventoryReportTableColumn[];

export function formatPickListReportNumber(value: string) {
	return formatInventoryReportNumber(value);
}
