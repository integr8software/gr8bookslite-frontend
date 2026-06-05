import type { PartyInformationTableRecord } from "@/app/src/types/modules/maintenance/party-management/PartyManagementTypes";
import { PartyInformationRecordActions } from "@/app/src/ui/modules/maintenance/party-management/PartyInformationRecordActions";

export function PartyInformationTableRow({
	record,
}: {
	record: PartyInformationTableRecord;
}) {
	return (
		<tr className="module-table-row">
			<td className="px-4 py-3">
				<div className="min-w-0">
					<p className="truncate text-xs font-semibold text-darknavy">
						{record.name}
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
			<PartyInformationTableCell>
				<span
					className={
						record.status === "Active"
							? "inline-flex rounded-md bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700"
							: "inline-flex rounded-md bg-darknavy/5 px-2 py-1 text-xs font-semibold text-darknavy/55"
					}
				>
					{record.status}
				</span>
			</PartyInformationTableCell>
			<PartyInformationTableCell>{record.addressLabel}</PartyInformationTableCell>
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
			className={`px-4 py-3 align-middle text-xs text-darknavy first:pl-5 last:pr-5 ${align === "center" ? "text-center" : "text-left"
				}`}
		>
			{children}
		</td>
	);
}
