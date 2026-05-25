"use client";

import Link from "next/link";
import { Edit3, Eye, ToggleLeft, ToggleRight } from "lucide-react";
import {
	getMasterPlanAndPackageEditHref,
	getMasterPlanAndPackageViewHref,
} from "@/app/src/constants/master/plan-and-packages/MasterPlanAndPackageConstants";
import type { MasterPlanAndPackageRecord } from "@/app/src/types/master/plan-and-packages/MasterPlanAndPackageTypes";

const RecordActionClassName =
	"inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-darknavy/10 bg-white px-3 text-xs font-semibold text-darknavy/70 transition hover:bg-skyblue/10 hover:text-darknavy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/25";

type MasterPlanAndPackageRecordActionsProps = {
	record: MasterPlanAndPackageRecord;
	onToggleStatus: (recordId: string) => void;
};

export function MasterPlanAndPackageRecordActions({
	record,
	onToggleStatus,
}: MasterPlanAndPackageRecordActionsProps) {
	const isActive = record.status === "Active";

	return (
		<div className="flex flex-wrap justify-end gap-2">
			<Link
				href={getMasterPlanAndPackageViewHref(record.id)}
				className={RecordActionClassName}
			>
				<Eye className="h-3.5 w-3.5" aria-hidden="true" />
				View
			</Link>
			<Link
				href={getMasterPlanAndPackageEditHref(record.id)}
				className={RecordActionClassName}
			>
				<Edit3 className="h-3.5 w-3.5" aria-hidden="true" />
				Edit
			</Link>
			<button
				type="button"
				onClick={() => onToggleStatus(record.id)}
				className={RecordActionClassName}
			>
				{isActive ? (
					<ToggleRight className="h-3.5 w-3.5" aria-hidden="true" />
				) : (
					<ToggleLeft className="h-3.5 w-3.5" aria-hidden="true" />
				)}
				{isActive ? "Inactivate" : "Activate"}
			</button>
		</div>
	);
}
