import type { ReactNode } from "react";
import type {
	PartyInformationTableRecord,
	PartyInformationTableRowProps,
} from "@/app/src/types/modules/maintenance/party-management/PartyManagementTypes";
import { PartyInformationRecordActions } from "@/app/src/ui/modules/maintenance/party-management/PartyInformationRecordActions";
import { getColumnMetaClassName } from "@/app/src/ui/shared/module/module-table/utils";
import { formatDateTime } from "@/app/src/utils/date.util";

export function PartyInformationTableRow({
	row,
}: PartyInformationTableRowProps) {
	return (
		<tr className="module-table-row">
			{row.getVisibleCells().map((cell) => (
				<PartyInformationTableCell
					key={cell.id}
					className={getColumnMetaClassName(cell.column.columnDef.meta)}
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

function PartyInformationCellContent({
	columnId,
	record,
}: {
	columnId: string;
	record: PartyInformationTableRecord;
}) {
	switch (columnId) {
		case "partyCodeNo":
			return <span className="font-medium text-darknavy">{record.partyCodeNo}</span>;
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
		case "email":
			return <TextCell value={record.email} />;
		case "contactNo":
			return <TextCell value={record.contactNo} />;
		case "landline":
			return <TextCell value={record.landline ?? ""} />;
		case "gender":
			return <TextCell value={record.gender ?? ""} />;
		case "civilStatus":
			return <TextCell value={record.civilStatus ?? ""} />;
		case "nationality":
			return <TextCell value={record.nationality ?? ""} />;
		case "memberRegistrationDate":
			return (
				<TextCell
					value={
						record.memberRegistrationDate
							? formatDateTime(record.memberRegistrationDate, {
									emptyValue: "",
									locale: "en-US",
								})
							: ""
					}
				/>
			);
		case "homeAddressLabel":
			return <AddressCell value={record.homeAddressLabel} />;
		case "billingAddressLabel":
			return <AddressCell value={record.billingAddressLabel} />;
		case "deliveryAddressLabel":
			return <AddressCell value={record.deliveryAddressLabel} />;
		case "tin":
			return <TextCell value={record.tin} />;
		case "vatRegistrationType":
			return <TextCell value={record.vatRegistrationType} />;
		case "createdBy":
			return <TextCell value={record.createdBy ?? ""} />;
		case "createdAt":
			return <TextCell value={formatDateTime(record.createdAt)} />;
		case "updatedBy":
			return <TextCell value={record.updatedBy ?? ""} />;
		case "updatedAt":
			return <TextCell value={formatDateTime(record.updatedAt)} />;
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

function TextCell({ value }: { value: string }) {
	return <span className="text-sm text-darknavy/75">{value || ""}</span>;
}

function AddressCell({ value }: { value: string }) {
	return (
		<span className="block truncate text-sm text-darknavy/75" title={value}>
			{value || ""}
		</span>
	);
}

function PartyInformationTableCell({
	className = "text-left",
	children,
}: {
	className?: string;
	children: ReactNode;
}) {
	return (
		<td
			className={`px-4 py-3 align-middle text-sm text-darknavy first:pl-5 last:pr-5 ${className}`}
		>
			{children}
		</td>
	);
}
