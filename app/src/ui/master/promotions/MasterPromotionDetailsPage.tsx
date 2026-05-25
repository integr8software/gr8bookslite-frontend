import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, Edit3, Tags } from "lucide-react";
import {
	MasterPromotionsHref,
	getMasterPromotionTargetLabel,
	getMasterPromotionEditHref,
} from "@/app/src/constants/master/promotions/MasterPromotionConstants";
import {
	formatMasterPromotionDate,
	formatMasterPromotionValue,
	getMasterPromotionById,
} from "@/app/src/data/master/promotions/MasterPromotionData";
import {
	ModuleHeader,
	moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";
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
				description={record.description}
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
							href={getMasterPromotionEditHref(record.id)}
							className={moduleHeaderActionClassNames.primary}
						>
							<Edit3 className="h-4 w-4" aria-hidden="true" />
							Edit
						</Link>
					</>
				}
			/>
			<div className="grid gap-5 xl:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)]">
				<DetailPanel title="Promotion Details">
					<DetailLine label="Code" value={record.code} />
					<DetailLine label="Type" value={record.type} />
					<DetailLine
						label="Target"
						value={getMasterPromotionTargetLabel(record.target)}
					/>
					<div className="grid gap-2">
						<p className="text-xs font-semibold uppercase tracking-wide text-darknavy/42">
							Status
						</p>
						<MasterPromotionStatusBadge status={record.status} />
					</div>
				</DetailPanel>
				<DetailPanel title="Discount">
					<div className="grid gap-4 md:grid-cols-3">
						<DetailLine
							label={record.discountKind}
							value={formatMasterPromotionValue(record)}
						/>
						<DetailLine
							label="Expires"
							value={formatMasterPromotionDate(record.expiresAt)}
						/>
						<DetailLine
							label="Redemptions"
							value={record.redemptions.toLocaleString("en-US")}
						/>
					</div>
					<div className="mt-5 flex items-start gap-3 rounded-lg border border-darknavy/10 bg-offwhite/45 px-3 py-3">
						<span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-skyblue/12 text-darknavy">
							<Tags className="h-4 w-4" aria-hidden="true" />
						</span>
						<p className="text-sm font-medium leading-6 text-darknavy/70">
							{record.description}
						</p>
					</div>
				</DetailPanel>
			</div>
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
