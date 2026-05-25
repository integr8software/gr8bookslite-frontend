import Link from "next/link";
import { getMasterPlanAndPackageViewHref } from "@/app/src/constants/master/plan-and-packages/MasterPlanAndPackageConstants";
import {
	formatMasterPlanAndPackagePricing,
	formatMasterPlanAndPackageScalePricing,
	getMasterPlanAndPackagePricingSupportingText,
	getMasterPlanAndPackageScaleSupportingText,
} from "@/app/src/data/master/plan-and-packages/MasterPlanAndPackageData";
import type { MasterPlanAndPackageRecord } from "@/app/src/types/master/plan-and-packages/MasterPlanAndPackageTypes";
import { MasterPlanAndPackageStatusBadge } from "@/app/src/ui/master/plan-and-packages/MasterPlanAndPackageBadges";
import { MasterPlanAndPackageRecordActions } from "@/app/src/ui/master/plan-and-packages/MasterPlanAndPackageRecordActions";

type MasterPlanAndPackageTableRowProps = {
	record: MasterPlanAndPackageRecord;
	onToggleStatus: (recordId: string) => void;
};

export function MasterPlanAndPackageTableRow({
	record,
	onToggleStatus,
}: MasterPlanAndPackageTableRowProps) {
	return (
		<tr className="module-table-row">
			<td className="px-4 py-4">
				<div className="min-w-0">
					<Link
						href={getMasterPlanAndPackageViewHref(record.id)}
						className="block truncate text-sm font-semibold text-darknavy transition hover:text-skyblue focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-skyblue/20"
					>
						{record.name}
					</Link>
					<p className="mt-1 line-clamp-2 text-sm leading-5 text-darknavy/52">
						{record.description}
					</p>
				</div>
			</td>
			<td className="px-4 py-4">
				<MasterPlanAndPackageStatusBadge status={record.status} />
			</td>
			<td className="px-4 py-4">
				<p className="text-sm font-semibold text-darknavy">
					{formatMasterPlanAndPackagePricing(record.pricing)}
				</p>
				<p className="mt-1 text-xs font-semibold uppercase tracking-wide text-darknavy/38">
					{getMasterPlanAndPackagePricingSupportingText(record.pricing)}
				</p>
			</td>
			<td className="px-4 py-4">
				<p className="text-sm font-semibold text-darknavy">
					{formatMasterPlanAndPackageScalePricing(record.scalePricing)}
				</p>
				<p className="mt-1 text-xs font-semibold uppercase tracking-wide text-darknavy/38">
					{getMasterPlanAndPackageScaleSupportingText(record.scalePricing)}
				</p>
			</td>
			<td className="px-4 py-4">
				<MasterPlanAndPackageRecordActions
					record={record}
					onToggleStatus={onToggleStatus}
				/>
			</td>
		</tr>
	);
}
