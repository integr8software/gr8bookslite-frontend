import Link from "next/link";
import type { Row } from "@tanstack/react-table";
import type { ReactNode } from "react";
import {
	CheckCircle2,
	CircleOff,
	Edit3,
	Eye,
	ListTree,
	ToggleLeft,
	ToggleRight,
} from "lucide-react";
import {
	getMasterModuleSystemEditHref,
	getMasterModuleSystemSidebarHref,
	getMasterModuleSystemViewHref,
} from "@/app/src/constants/master/module-systems/MasterModuleSystemConstants";
import type { MasterModuleSystem } from "@/app/src/services/master/module-systems/MasterModuleSystemApi";
import { ModuleActionMenu } from "@/app/src/ui/shared/module/ModuleActionMenu";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";

type MasterModuleSystemTableRowProps = {
	row: Row<MasterModuleSystem>;
	onToggleStatus: (record: MasterModuleSystem) => void;
};

export function MasterModuleSystemTableRow({
	row,
	onToggleStatus,
}: MasterModuleSystemTableRowProps) {
	return (
		<tr className="module-table-row">
			{row.getVisibleCells().map((cell) => (
				<MasterModuleSystemTableCell
					key={cell.id}
					align={isCenteredColumn(cell.column.id) ? "center" : "left"}
				>
					<MasterModuleSystemCellContent
						columnId={cell.column.id}
						record={row.original}
						onToggleStatus={onToggleStatus}
					/>
				</MasterModuleSystemTableCell>
			))}
		</tr>
	);
}

function isCenteredColumn(columnId: string) {
	return ["actions", "isActive", "modules"].includes(columnId);
}

function MasterModuleSystemCellContent({
	columnId,
	record,
	onToggleStatus,
}: {
	columnId: string;
	record: MasterModuleSystem;
	onToggleStatus: (record: MasterModuleSystem) => void;
}) {
	const ToggleIcon = record.isActive ? ToggleRight : ToggleLeft;

	switch (columnId) {
		case "name":
			return (
				<Link
					href={getMasterModuleSystemViewHref(record.id)}
					className="block max-w-full truncate text-left text-sm font-semibold text-darknavy transition hover:text-skyblue focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-skyblue/20"
				>
					{record.name}
				</Link>
			);
		case "description":
			return (
				<p className="line-clamp-2 text-sm text-darknavy/60">
					{record.description || "No description"}
				</p>
			);
		case "modules":
			return (
				<p className="text-sm font-semibold text-darknavy">
					{record.moduleCount}
				</p>
			);
		case "isActive":
			return (
				<span
					className={joinClasses(
						"inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold",
						record.isActive
							? "bg-emerald-50 text-emerald-700"
							: "bg-coralpink/10 text-coralpink",
					)}
				>
					{record.isActive ? (
						<CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
					) : (
						<CircleOff className="h-3.5 w-3.5" aria-hidden="true" />
					)}
					{record.isActive ? "Active" : "Inactive"}
				</span>
			);
		case "actions":
			return (
				<ModuleActionMenu
					className="!justify-center"
					label={`Open actions for ${record.name}`}
					items={[
						{
							href: getMasterModuleSystemViewHref(record.id),
							icon: Eye,
							label: "View",
							type: "link",
						},
						{
							href: getMasterModuleSystemEditHref(record.id),
							icon: Edit3,
							label: "Edit",
							type: "link",
						},
						{
							href: getMasterModuleSystemSidebarHref(record.id),
							icon: ListTree,
							label: "Configure Sidebar",
							type: "link",
						},
						{
							icon: ToggleIcon,
							label: record.isActive ? "Inactivate" : "Activate",
							onSelect: () => onToggleStatus(record),
							tone: record.isActive ? "danger" : "default",
							type: "button",
						},
					]}
				/>
			);
		default:
			return null;
	}
}

function MasterModuleSystemTableCell({
	align = "left",
	children,
}: {
	align?: "center" | "left";
	children: ReactNode;
}) {
	return (
		<td
			className={joinClasses(
				"px-4 py-4 align-middle text-sm text-darknavy",
				align === "center" ? "text-center" : "text-left",
			)}
		>
			{children}
		</td>
	);
}
