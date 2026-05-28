import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, Edit3 } from "lucide-react";
import {
	MasterPromotionsHref,
	getMasterPromotionTargetLabels,
	getMasterPromotionEditFromViewHref,
} from "@/app/src/constants/master/promotions/MasterPromotionConstants";
import {
	formatMasterPromotionDate,
	formatMasterPromotionLimit,
	formatMasterPromotionStartDate,
	formatMasterPromotionValue,
	getMasterPromotionById,
} from "@/app/src/data/master/promotions/MasterPromotionData";
import {
	ModuleHeader,
	moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";
import type { MasterPromotionStatus } from "@/app/src/types/master/promotions/MasterPromotionTypes";
import { ModuleNotFound } from "@/app/src/ui/shared/module/ModuleNotFound";
import { MasterPromotionStatusBadge } from "@/app/src/ui/master/promotions/MasterPromotionBadges";

type MasterPromotionDetailsPageProps = {
	recordId: string;
};

export function MasterPromotionDetailsPage({
	recordId,
}: MasterPromotionDetailsPageProps) {
	const record = getMasterPromotionById(recordId);

	if (!record) {
		return (
			<ModuleNotFound
				title="Promotion not found"
				description="The selected promotion record is not available in the promotions list."
				actionHref={MasterPromotionsHref}
				actionLabel="Back to promotions"
			/>
		);
	}

	return (
		<section className="grid gap-5">
			<ModuleHeader
				variant="card"
				titleAs="h1"
				eyebrow="Discounts"
				title={record.name}
				description="Review the promotion identity, cycle coverage, target plan, value, usage limit, expiration, and status."
				actions={
					<>
						<Link
							href={MasterPromotionsHref}
							className={moduleHeaderActionClassNames.secondary}
						>
							<ArrowLeft className="h-4 w-4" aria-hidden="true" />
							Back
						</Link>
						<Link
							href={getMasterPromotionEditFromViewHref(record.id)}
							className={moduleHeaderActionClassNames.primary}
						>
							<Edit3 className="h-4 w-4" aria-hidden="true" />
							Edit
						</Link>
					</>
				}
			/>
			<DetailPanel title="Promotion Details">
				<div className="grid gap-4 md:grid-cols-2">
					<DetailLine label="Name" value={record.name} />
					<DetailLine label="Code" value={record.code} />
				</div>
				<div className="grid gap-4 md:grid-cols-2">
					<DetailLine label="Type" value={record.type} />
					<DetailLine
						label="Number of Billing Cycle covered"
						value={record.billingCycle}
					/>
				</div>
				<DetailLine label="Description" value={record.description} />
				<DetailPlanList
					labels={getMasterPromotionTargetLabels(record.targetPlanIds)}
				/>
				<div className="grid gap-4 md:grid-cols-2">
					<DetailLine label="Discount" value={record.discountKind} />
					<DetailLine
						label="Value"
						value={formatMasterPromotionValue(record)}
					/>
				</div>
				<div className="grid gap-4 md:grid-cols-2">
					<DetailLine
						label="Usage Limit"
						value={record.redemptionLimit === null ? "Unlimited" : "Limited"}
					/>
					<DetailLine
						label="Limit"
						value={formatMasterPromotionLimit(record)}
					/>
				</div>
				<div className="grid gap-4 md:grid-cols-2">
					<DetailLine
						label="Expiration"
						value={record.expiresAt ? "With expiration" : "No expiration"}
					/>
					<DetailLine
						label="Expiration Date"
						value={formatMasterPromotionDate(record.expiresAt)}
					/>
				</div>
				<div className="grid gap-4 md:grid-cols-2">
					<DetailLine
						label="Starting date"
						value={formatMasterPromotionStartDate(record.startsAt)}
					/>
					<DetailStatusLine status={record.status} />
				</div>
			</DetailPanel>
		</section>
	);
}

function DetailPanel({
	children,
	title,
}: {
	children: ReactNode;
	title: string;
}) {
	return (
		<section className="rounded-lg border border-darknavy/10 bg-white p-5 shadow-sm">
			<h2 className="text-base font-semibold text-darknavy">{title}</h2>
			<div className="mt-4 grid gap-4">{children}</div>
		</section>
	);
}

function DetailLine({ label, value }: { label: string; value: string }) {
	return (
		<div className="grid gap-1">
			<p className="text-xs font-semibold uppercase tracking-wide text-darknavy/42">
				{label}
			</p>
			<p className="text-sm font-semibold text-darknavy">{value}</p>
		</div>
	);
}

function DetailStatusLine({ status }: { status: MasterPromotionStatus }) {
	return (
		<div className="grid gap-2">
			<p className="text-xs font-semibold uppercase tracking-wide text-darknavy/42">
				Status
			</p>
			<MasterPromotionStatusBadge status={status} />
		</div>
	);
}

function DetailPlanList({ labels }: { labels: string[] }) {
	const displayLabels = labels.length > 0 ? labels : ["No target plans"];

	return (
		<div className="grid gap-2">
			<p className="text-xs font-semibold uppercase tracking-wide text-darknavy/42">
				Target Plan
			</p>
			<div className="flex flex-wrap gap-2">
				{displayLabels.map((label) => (
					<span
						key={label}
						className="rounded-md bg-skyblue/12 px-2.5 py-1 text-xs font-semibold text-darknavy ring-1 ring-skyblue/22"
					>
						{label}
					</span>
				))}
			</div>
		</div>
	);
}
