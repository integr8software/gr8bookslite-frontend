"use client";

import { Edit3, Eye, ToggleLeft, ToggleRight } from "lucide-react";
import {
	getMasterPlanAndPackageEditHref,
	getMasterPlanAndPackageViewHref,
} from "@/app/src/constants/master/plan-and-packages/MasterPlanAndPackageConstants";
import type { MasterPlanAndPackageRecord } from "@/app/src/types/master/plan-and-packages/MasterPlanAndPackageTypes";
import { ModuleActionMenu } from "@/app/src/ui/shared/module/ModuleActionMenu";

type MasterPlanAndPackageRecordActionsProps = {
	record: MasterPlanAndPackageRecord;
	onToggleStatus: (recordId: string) => void;
};

export function MasterPlanAndPackageRecordActions({
	record,
	onToggleStatus,
}: MasterPlanAndPackageRecordActionsProps) {
	const isActive = record.status === "Active";
	const ToggleIcon = isActive ? ToggleRight : ToggleLeft;

	return (
		<ModuleActionMenu
			className="!justify-center"
			label={`Open actions for ${record.name}`}
			items={[
				{
					href: getMasterPlanAndPackageViewHref(record.id),
					icon: Eye,
					label: "View",
					type: "link",
				},
				{
					href: getMasterPlanAndPackageEditHref(record.id),
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
