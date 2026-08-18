import Link from "next/link";
import type { Row } from "@tanstack/react-table";
import { getMasterAddOnViewHref } from "@/app/src/constants/master/add-ons/MasterAddOnConstants";
import type { MasterAddOnRecord } from "@/app/src/types/master/add-ons/MasterAddOnTypes";
import { MasterAddOnStatusBadge } from "@/app/src/ui/master/add-ons/MasterAddOnBadges";
import { MasterAddOnRecordActions } from "@/app/src/ui/master/add-ons/MasterAddOnRecordActions";

type MasterAddOnTableRowProps = {
	row: Row<MasterAddOnRecord>;
	onToggleStatus: (recordId: string) => void;
};

export function MasterAddOnTableRow({
	row,
	onToggleStatus,
}: MasterAddOnTableRowProps) {
	return (
		<tr className="module-table-row">
			{row.getVisibleCells().map((cell) => (
				<MasterAddOnTableCell
					key={cell.id}
					align={isCenteredColumn(cell.column.id) ? "center" : "left"}
				>
					<MasterAddOnCellContent
						columnId={cell.column.id}
						record={row.original}
						onToggleStatus={onToggleStatus}
					/>
				</MasterAddOnTableCell>
			))}
		</tr>
	);
}

function isCenteredColumn(columnId: string) {
	return ["actions", "status"].includes(columnId);
}

function MasterAddOnCellContent({
	columnId,
	record,
	onToggleStatus,
}: {
	columnId: string;
	record: MasterAddOnRecord;
	onToggleStatus: (recordId: string) => void;
}) {
	switch (columnId) {
		case "name":
			return (
				<div className="min-w-0">
					<Link
						href={getMasterAddOnViewHref(record.id)}
						className="block truncate text-sm font-semibold text-darknavy transition hover:text-skyblue focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-skyblue/20"
					>
						{record.name}
					</Link>
					<div className="mt-2 flex flex-wrap items-center gap-2">
						<span className="rounded-md bg-skyblue/10 px-2 py-1 text-xs font-bold uppercase tracking-wide text-darknavy/60">
							{record.code}
						</span>
					</div>
					<p className="mt-1 line-clamp-2 text-sm leading-5 text-darknavy/52">
						{record.description}
					</p>
				</div>
			);
		case "status":
			return <MasterAddOnStatusBadge status={record.status} />;
		case "pricing":
			return (
				<>
					<p className="text-sm font-semibold text-darknavy">
						PHP {record.pricing.monthlyPrice.toFixed(2)} / month
					</p>
					<p className="mt-1 text-xs font-semibold uppercase tracking-wide text-darknavy/38">
						PHP {record.pricing.yearlyPrice.toFixed(2)} / year
					</p>
				</>
			);
		case "modules":
			return (
				<span className="inline-flex items-center rounded-md bg-offwhite px-2.5 py-1 text-xs font-bold text-darknavy/65">
					{record.featureIds.length} module{record.featureIds.length === 1 ? "" : "s"}
				</span>
			);
		case "actions":
			return (
				<MasterAddOnRecordActions
					record={record}
					onToggleStatus={onToggleStatus}
				/>
			);
		default:
			return null;
	}
}

function MasterAddOnTableCell({
	align = "left",
	children,
}: {
	align?: "center" | "left";
	children: React.ReactNode;
}) {
	return (
		<td
			className={`align-middle text-sm text-darknavy ${
				align === "center" ? "text-center" : "text-left"
			}`}
		>
			{children}
		</td>
	);
}
