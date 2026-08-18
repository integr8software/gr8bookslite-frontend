"use client";

import { Edit3, Eye, ToggleLeft, ToggleRight } from "lucide-react";
import {
	getMasterAddOnEditHref,
	getMasterAddOnViewHref,
} from "@/app/src/constants/master/add-ons/MasterAddOnConstants";
import type { MasterAddOnRecord } from "@/app/src/types/master/add-ons/MasterAddOnTypes";
import { ModuleActionMenu } from "@/app/src/ui/shared/module/ModuleActionMenu";

type MasterAddOnRecordActionsProps = {
	record: MasterAddOnRecord;
	onToggleStatus: (recordId: string) => void;
};

export function MasterAddOnRecordActions({
	record,
	onToggleStatus,
}: MasterAddOnRecordActionsProps) {
	const isActive = record.status === "Active";
	const ToggleIcon = isActive ? ToggleRight : ToggleLeft;

	return (
		<ModuleActionMenu
			className="!justify-center"
			label={`Open actions for ${record.name}`}
			items={[
				{
					href: getMasterAddOnViewHref(record.id),
					icon: Eye,
					label: "View",
					type: "link",
				},
				{
					href: getMasterAddOnEditHref(record.id),
					icon: Edit3,
					label: "Edit",
					type: "link",
				},
				{
					icon: ToggleIcon,
					label: isActive ? "Inactivate" : "Activate",
					onSelect: () => onToggleStatus(record.id),
					tone: isActive ? "danger" : "default",
					type: "button",
				},
			]}
		/>
	);
}
