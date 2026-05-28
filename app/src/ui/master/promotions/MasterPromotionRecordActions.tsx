"use client";

import { Edit3, Eye, Trash2 } from "lucide-react";
import {
	getMasterPromotionEditHref,
	getMasterPromotionViewHref,
} from "@/app/src/constants/master/promotions/MasterPromotionConstants";
import type { MasterPromotionRecord } from "@/app/src/types/master/promotions/MasterPromotionTypes";
import { ModuleActionMenu } from "@/app/src/ui/shared/module/ModuleActionMenu";

type MasterPromotionRecordActionsProps = {
	record: MasterPromotionRecord;
	onDeleteRecord: (record: MasterPromotionRecord) => void;
};

export function MasterPromotionRecordActions({
	onDeleteRecord,
	record,
}: MasterPromotionRecordActionsProps) {
	return (
		<ModuleActionMenu
			label={`Open actions for ${record.name}`}
			items={[
				{
					href: getMasterPromotionViewHref(record.id),
					icon: Eye,
					label: "View",
					type: "link",
				},
				{
					href: getMasterPromotionEditHref(record.id),
					icon: Edit3,
					label: "Edit",
					type: "link",
				},
				{
					icon: Trash2,
					label: "Delete",
					onSelect: () => onDeleteRecord(record),
					tone: "danger",
					type: "button",
				},
			]}
		/>
	);
}
