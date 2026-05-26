import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, Edit3, Package } from "lucide-react";
import {
	MasterPlanAndPackagesHref,
	getMasterPlanAndPackageEditHref,
} from "@/app/src/constants/master/plan-and-packages/MasterPlanAndPackageConstants";
import {
	formatMasterPlanAndPackageScalePricing,
	formatMasterPlanAndPackagePricing,
	getMasterPlanAndPackageFeatureLabels,
	getMasterPlanAndPackageById,
	getMasterPlanAndPackagePricingSupportingText,
	getMasterPlanAndPackageScaleSupportingText,
} from "@/app/src/data/master/plan-and-packages/MasterPlanAndPackageData";
import {
	ModuleHeader,
	moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";
import { ModuleNotFound } from "@/app/src/ui/shared/module/ModuleNotFound";
import { MasterPlanAndPackageStatusBadge } from "@/app/src/ui/master/plan-and-packages/MasterPlanAndPackageBadges";

type MasterPlanAndPackageDetailsPageProps = {
	recordId: string;
};

export function MasterPlanAndPackageDetailsPage({
	recordId,
}: MasterPlanAndPackageDetailsPageProps) {
	const record = getMasterPlanAndPackageById(recordId);

	if (!record) {
		return (
			<ModuleNotFound
				title="Plan not found"
				description="The selected plan record is not available in the master plan list."
				actionHref={MasterPlanAndPackagesHref}
				actionLabel="Back to plans"
			/>
		);
	}

	return (
		<section className="grid gap-5">
			<ModuleHeader
				variant="card"
				titleAs="h1"
				eyebrow="Subscription & Billing"
				title={record.name}
				description={record.description}
				actions={
					<>
						<Link
							href={MasterPlanAndPackagesHref}
							className={moduleHeaderActionClassNames.secondary}
						>
							<ArrowLeft className="h-4 w-4" aria-hidden="true" />
							Back
						</Link>
						<Link
							href={getMasterPlanAndPackageEditHref(record.id)}
							className={moduleHeaderActionClassNames.primary}
						>
							<Edit3 className="h-4 w-4" aria-hidden="true" />
							Edit
						</Link>
					</>
				}
			/>
			<div className="grid gap-5 xl:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
				<div className="grid content-start gap-4">
					<DetailPanel title="Plan Details">
						<DetailLine label="Plan code" value={record.code} />
						<DetailLine
							label="Trial period"
							value={`${record.trialDays} trial days`}
						/>
						<div className="grid gap-2">
							<p className="text-xs font-semibold uppercase tracking-wide text-darknavy/42">
								Status
							</p>
							<MasterPlanAndPackageStatusBadge status={record.status} />
						</div>
					</DetailPanel>
					<DetailPanel title="Pricing">
						<DetailLine
							label={getMasterPlanAndPackagePricingSupportingText(
								record.pricing,
							)}
							value={formatMasterPlanAndPackagePricing(record.pricing)}
						/>
					</DetailPanel>
					<DetailPanel title="Scale Pricing">
						<DetailLine
							label={getMasterPlanAndPackageScaleSupportingText(
								record.scalePricing,
							)}
							value={formatMasterPlanAndPackageScalePricing(
								record.scalePricing,
							)}
						/>
					</DetailPanel>
				</div>
				<DetailPanel title="Included Module Features">
					<div className="grid gap-3">
						{getMasterPlanAndPackageFeatureLabels(record.featureIds).map((feature) => (
							<div
								key={feature}
								className="flex items-start gap-3 rounded-lg border border-darknavy/10 bg-offwhite/45 px-3 py-2"
							>
								<span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-skyblue/12 text-darknavy">
									<Package className="h-3.5 w-3.5" aria-hidden="true" />
								</span>
								<p className="text-sm font-medium leading-6 text-darknavy/72">
									{feature}
								</p>
							</div>
						))}
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
