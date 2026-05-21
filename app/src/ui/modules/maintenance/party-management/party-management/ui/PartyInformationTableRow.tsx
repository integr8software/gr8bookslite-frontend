import type { PartyInformationTableRecord } from "@/app/src/types/modules/party-management/PartyManagementTypes";
import { PartyInformationRecordActions } from "./PartyInformationRecordActions";

export function PartyInformationTableRow({
	record,
}: {
	record: PartyInformationTableRecord;
}) {
	return (
		<tr className="module-table-row">
			<PartyInformationTableCell>
				<span className="font-semibold">{record.partyCodeNo}</span>
			</PartyInformationTableCell>
			<td className="px-4 py-3">
				<div className="min-w-0">
					<p className="truncate text-xs font-semibold text-darknavy">
						{record.name}
					</p>
					<p className="mt-0.5 truncate text-xs text-darknavy/50">
						{record.tin || "No TIN"}
					</p>
				</div>
			</td>
			<PartyInformationTableCell>
				<span className="inline-flex min-h-6 items-center rounded bg-skyblue/12 px-2.5 text-xs font-semibold text-darknavy ring-1 ring-skyblue/20">
					{record.classification}
				</span>
			</PartyInformationTableCell>
			<PartyInformationTableCell>
				{record.partyTypesLabel}
			</PartyInformationTableCell>
			<PartyInformationTableCell>{record.atcCode}</PartyInformationTableCell>
			<PartyInformationTableCell>{record.contact}</PartyInformationTableCell>
			<PartyInformationTableCell align="center">
				<PartyInformationRecordActions id={record.id} name={record.name} />
			</PartyInformationTableCell>
		</tr>
	);
}

function PartyInformationTableCell({
	align = "left",
	children,
}: {
	align?: "center" | "left";
	children: React.ReactNode;
}) {
	return (
		<td
			className={`px-4 py-3 align-middle text-xs text-darknavy first:pl-5 last:pr-5 ${
				align === "center" ? "text-center" : "text-left"
			}`}
		>
			{children}
		</td>
	);
}
