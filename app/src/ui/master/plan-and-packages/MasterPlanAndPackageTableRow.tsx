import Link from "next/link";
import type { Row } from "@tanstack/react-table";
import { getMasterPlanAndPackageViewHref } from "@/app/src/constants/master/plan-and-packages/MasterPlanAndPackageConstants";
import {
	formatMasterPlanAndPackagePricing,
	formatMasterPlanAndPackageScalePricing,
	formatMasterPlanAndPackageScope,
	getMasterPlanAndPackagePricingSupportingText,
} from "@/app/src/data/master/plan-and-packages/MasterPlanAndPackageData";
import type { MasterPlanAndPackageRecord } from "@/app/src/types/master/plan-and-packages/MasterPlanAndPackageTypes";
import { MasterPlanAndPackageStatusBadge } from "@/app/src/ui/master/plan-and-packages/MasterPlanAndPackageBadges";
import { MasterPlanAndPackageRecordActions } from "@/app/src/ui/master/plan-and-packages/MasterPlanAndPackageRecordActions";

type MasterPlanAndPackageTableRowProps = {
	row: Row<MasterPlanAndPackageRecord>;
	onToggleStatus: (recordId: string) => void;
};

export function MasterPlanAndPackageTableRow({
	row,
	onToggleStatus,
}: MasterPlanAndPackageTableRowProps) {
	return (
		<tr className="module-table-row">
			{row.getVisibleCells().map((cell) => (
				<MasterPlanAndPackageTableCell
					key={cell.id}
					align={isCenteredColumn(cell.column.id) ? "center" : "left"}
				>
					<MasterPlanAndPackageCellContent
						columnId={cell.column.id}
						record={row.original}
						onToggleStatus={onToggleStatus}
					/>
				</MasterPlanAndPackageTableCell>
			))}
		</tr>
	);
}

function isCenteredColumn(columnId: string) {
	return ["actions", "status"].includes(columnId);
}

function MasterPlanAndPackageCellContent({
	columnId,
	record,
	onToggleStatus,
}: {
	columnId: string;
	record: MasterPlanAndPackageRecord;
	onToggleStatus: (recordId: string) => void;
}) {
	switch (columnId) {
		case "name":
			return (
				<div className="min-w-0">
					<Link
						href={getMasterPlanAndPackageViewHref(record.id)}
						className="block truncate text-sm font-semibold text-darknavy transition hover:text-skyblue focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-skyblue/20"
					>
						{record.name}
					</Link>
					<div className="mt-2 flex flex-wrap items-center gap-2">
						{record.trialDays > 0 ? (
							<span className="rounded-md bg-offwhite px-2 py-1 text-xs font-bold text-darknavy/48">
								{record.trialDays} trial days
							</span>
						) : null}
						<span className="rounded-md bg-citron/35 px-2 py-1 text-xs font-bold text-darknavy/58">
							{formatMasterPlanAndPackageScope(record.scope)}
						</span>
					</div>
					<p className="mt-1 line-clamp-2 text-sm leading-5 text-darknavy/52">
						{record.description}
					</p>
				</div>
			);
		case "status":
			return <MasterPlanAndPackageStatusBadge status={record.status} />;
		case "pricing":
			return (
				<>
					<p className="text-sm font-semibold text-darknavy">
						{formatMasterPlanAndPackagePricing(record.pricing)}
					</p>
					<p className="mt-1 text-xs font-semibold uppercase tracking-wide text-darknavy/38">
						{getMasterPlanAndPackagePricingSupportingText(record.pricing)}
					</p>
				</>
			);
		case "actions":
			return (
				<MasterPlanAndPackageRecordActions
					record={record}
					onToggleStatus={onToggleStatus}
				/>
			);
		default:
			return null;
	}
}

function MasterPlanAndPackageTableCell({
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
