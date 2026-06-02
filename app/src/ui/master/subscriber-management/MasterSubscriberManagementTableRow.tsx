import Link from "next/link";
import { Edit3, Eye, MoreHorizontal } from "lucide-react";
import {
	getMasterSubscriberManagementEditHref,
	getMasterSubscriberManagementViewHref,
} from "@/app/src/constants/master/subscriber-management/MasterSubscriberManagementConstants";
import type { MasterSubscriberManagementListRecord } from "@/app/src/types/master/subscriber-management/MasterSubscriberManagementTypes";
import {
	MasterSubscriberIcon,
	MasterSubscriberStatusBadge,
} from "@/app/src/ui/master/subscriber-management/MasterSubscriberManagementBadges";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";

type MasterSubscriberManagementTableRowProps = {
	subscriber: MasterSubscriberManagementListRecord;
};

export function MasterSubscriberManagementTableRow({
	subscriber,
}: MasterSubscriberManagementTableRowProps) {
	return (
		<tr className="module-table-row">
			<td className="px-4 py-4">
				<Link
					href={getMasterSubscriberManagementViewHref(subscriber.id)}
					className="flex min-w-0 items-center gap-3 rounded-md transition hover:text-[var(--skyblue)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--skyblue-rgb)/0.2)]"
				>
					<MasterSubscriberIcon
						tone={subscriber.iconTone}
						className="h-10 w-10"
					/>
					<span className="min-w-0">
						<span className="block truncate text-sm font-semibold text-darknavy">
							{subscriber.name}
						</span>
						<span className="mt-0.5 block truncate text-xs font-medium text-darknavy/45">
							{subscriber.subscriberId}
						</span>
					</span>
				</Link>
			</td>
			<td className="px-4 py-4 text-sm font-medium text-darknavy">
				{subscriber.email}
			</td>
			<td className="px-4 py-4 text-sm font-medium text-darknavy">
				{subscriber.contactNumber}
			</td>
			<CenteredNumberCell value={subscriber.companies} />
			<CenteredNumberCell value={subscriber.branches} />
			<CenteredNumberCell value={subscriber.users} />
			<td className="px-4 py-4 text-sm font-medium text-darknavy">
				{subscriber.dateRegisteredLabel}
			</td>
			<td className="px-4 py-4">
				<MasterSubscriberStatusBadge status={subscriber.status} />
			</td>
			<td className="px-4 py-4 text-sm font-medium text-darknavy">
				<span className="block">{subscriber.lastLoginDate}</span>
				<span className="block text-darknavy/70">
					{subscriber.lastLoginTime}
				</span>
			</td>
			<td className="px-4 py-4 text-center">
				<RowActions subscriber={subscriber} />
			</td>
		</tr>
	);
}

function CenteredNumberCell({ value }: { value: number }) {
	return (
		<td className="px-4 py-4 text-center text-sm font-semibold text-darknavy">
			{value}
		</td>
	);
}

function RowActions({ subscriber }: MasterSubscriberManagementTableRowProps) {
	return (
		<details className="group relative inline-block text-left">
			<summary
				className={joinClasses(
					"inline-flex h-9 w-9 list-none items-center justify-center rounded-md border border-transparent text-darknavy transition hover:border-darknavy/10 hover:bg-skyblue/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--skyblue-rgb)/0.2)]",
					"[&::-webkit-details-marker]:hidden",
				)}
				aria-label={`Open actions for ${subscriber.name}`}
			>
				<MoreHorizontal className="h-5 w-5" aria-hidden="true" />
			</summary>
			<div className="absolute right-0 z-20 mt-2 w-44 overflow-hidden rounded-lg border border-darknavy/10 bg-white p-1 text-left shadow-[0_18px_50px_rgba(33,39,56,0.16)]">
				<Link
					href={getMasterSubscriberManagementViewHref(subscriber.id)}
					className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold text-darknavy/75 transition hover:bg-skyblue/10 hover:text-darknavy"
				>
					<Eye className="h-4 w-4" aria-hidden="true" />
					View Details
				</Link>
				<Link
					href={getMasterSubscriberManagementEditHref(subscriber.id)}
					className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold text-darknavy/75 transition hover:bg-skyblue/10 hover:text-darknavy"
				>
					<Edit3 className="h-4 w-4" aria-hidden="true" />
					Edit Subscriber
				</Link>
			</div>
		</details>
	);
}
