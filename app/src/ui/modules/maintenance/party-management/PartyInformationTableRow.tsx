import type { ReactNode } from "react";
import type {
	PartyInformationTableRecord,
	PartyInformationTableRowProps,
} from "@/app/src/types/modules/maintenance/party-management/PartyManagementTypes";
import { PartyInformationRecordActions } from "@/app/src/ui/modules/maintenance/party-management/PartyInformationRecordActions";

export function PartyInformationTableRow({
	row,
}: PartyInformationTableRowProps) {
	return (
		<tr className="module-table-row">
			{row.getVisibleCells().map((cell) => (
				<PartyInformationTableCell
					key={cell.id}
					align={isCenteredColumn(cell.column.id) ? "center" : "left"}
				>
					<PartyInformationCellContent
						columnId={cell.column.id}
						record={row.original}
					/>
				</PartyInformationTableCell>
			))}
		</tr>
	);
}

function isCenteredColumn(columnId: string) {
	return columnId === "actions" || columnId === "status";
}

function PartyInformationCellContent({
	columnId,
	record,
}: {
	columnId: string;
	record: PartyInformationTableRecord;
}) {
	switch (columnId) {
		case "name":
			return (
				<div className="min-w-0">
					<p className="truncate text-sm font-semibold text-darknavy">
						{record.name}
					</p>
				</div>
			);
		case "classification":
			return <span className="text-sm text-darknavy">{record.classification}</span>;
		case "partyTypesLabel":
			return (
				<div className="flex flex-wrap items-center gap-1.5">
					{record.partyTypes.map((partyType) => (
						<span
							key={partyType}
							className="inline-flex min-h-6 items-center rounded bg-darknavy/5 px-2 text-xs font-semibold text-darknavy/70 ring-1 ring-darknavy/10"
						>
							{partyType}
						</span>
					))}
				</div>
			);
		case "addressLabel":
			return <span className="text-sm text-darknavy/75">{record.addressLabel}</span>;
		case "status":
			return (
				<span
					className={
						record.status === "Active"
							? "inline-flex rounded-md bg-emerald-50 px-2 py-1 text-sm font-semibold text-emerald-700"
							: "inline-flex rounded-md bg-darknavy/5 px-2 py-1 text-sm font-semibold text-darknavy/55"
					}
				>
					{record.status}
				</span>
			);
		case "actions":
			return <PartyInformationRecordActions record={record} />;
		default:
			return null;
	}
}

function PartyInformationTableCell({
	align = "left",
	children,
}: {
	align?: "center" | "left";
	children: ReactNode;
}) {
	return (
		<td
			className={`px-4 py-3 align-middle text-sm text-darknavy first:pl-5 last:pr-5 ${align === "center" ? "text-center" : "text-left"
				}`}
		>
			{children}
		</td>
	);
}
