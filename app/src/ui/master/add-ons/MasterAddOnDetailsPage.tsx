"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, Edit3, Puzzle } from "lucide-react";
import {
	MasterAddOnsHref,
	getMasterAddOnEditHref,
} from "@/app/src/constants/master/add-ons/MasterAddOnConstants";
import { MasterAddOnMockRecords } from "@/app/src/data/master/add-ons/MasterAddOnMockData";
import {
	ModuleHeader,
	moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";
import { ModuleNotFound } from "@/app/src/ui/shared/module/ModuleNotFound";
import { MasterAddOnStatusBadge } from "@/app/src/ui/master/add-ons/MasterAddOnBadges";

type MasterAddOnDetailsPageProps = {
	recordId: string;
};

export function MasterAddOnDetailsPage({
	recordId,
}: MasterAddOnDetailsPageProps) {
	const record = MasterAddOnMockRecords.find(
		(candidate) => candidate.id === recordId,
	);

	if (!record) {
		return (
			<ModuleNotFound
				title="Add-on not found"
				description="The selected add-on record is not available in the master add-on list."
				actionHref={MasterAddOnsHref}
				actionLabel="Back to add-ons"
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
							href={MasterAddOnsHref}
							className={moduleHeaderActionClassNames.secondary}
						>
							<ArrowLeft
								className="h-4 w-4"
								aria-hidden="true"
							/>
							Back
						</Link>
						<Link
							href={getMasterAddOnEditHref(record.id)}
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
					<DetailPanel title="Add-On Details">
						<DetailLine label="Code" value={record.code} />
						<div className="grid gap-2">
							<p className="text-xs font-semibold uppercase tracking-wide text-darknavy/42">
								Status
							</p>
							<MasterAddOnStatusBadge status={record.status} />
						</div>
					</DetailPanel>
					<DetailPanel title="Pricing">
						<div className="grid gap-3">
							<div className="rounded-lg border border-darknavy/5 bg-offwhite/45 p-3">
								<p className="text-xs font-semibold uppercase tracking-wide text-darknavy/42">
									Monthly
								</p>
								<div className="mt-1.5 flex items-center gap-2">
									<p className="text-sm font-semibold text-darknavy">
										PHP{" "}
										{record.pricing.monthlyPrice.toFixed(2)}{" "}
										/ month
									</p>
								</div>
							</div>
							<div className="rounded-lg border border-darknavy/5 bg-offwhite/45 p-3">
								<p className="text-xs font-semibold uppercase tracking-wide text-darknavy/42">
									Yearly
								</p>
								<div className="mt-1.5 flex items-center gap-2">
									<p className="text-sm font-semibold text-darknavy">
										PHP{" "}
										{record.pricing.yearlyPrice.toFixed(2)} /
										year
									</p>
								</div>
							</div>
						</div>
					</DetailPanel>
				</div>
				<DetailPanel title="Included Modules">
					<div className="grid gap-3">
						{record.featureIds.map((featureId) => (
							<div
								key={featureId}
								className="flex items-start gap-3 rounded-lg border border-darknavy/10 bg-offwhite/45 px-3 py-2"
							>
								<span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-skyblue/12 text-darknavy">
									<Puzzle
										className="h-3.5 w-3.5"
										aria-hidden="true"
									/>
								</span>
								<p className="text-sm font-medium leading-6 text-darknavy/72">
									{featureId}
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
