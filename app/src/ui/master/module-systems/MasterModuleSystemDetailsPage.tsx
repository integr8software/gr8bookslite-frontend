"use client";

import { useMemo, type ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, Edit3, ListTree } from "lucide-react";
import {
	MasterModuleSystemsHref,
	getMasterModuleSystemEditHref,
	getMasterModuleSystemSidebarHref,
} from "@/app/src/constants/master/module-systems/MasterModuleSystemConstants";
import { useMasterModuleSystemListPage } from "@/app/src/hooks/master/module-systems/useMasterModuleSystemListPage";
import {
	ModuleHeader,
	moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";
import { ModuleNotFound } from "@/app/src/ui/shared/module/ModuleNotFound";
import { ModuleSystemPageSkeleton } from "@/app/src/ui/master/module-systems/ModuleSystemPageSkeleton";

export function MasterModuleSystemDetailsPage({ recordId }: { recordId: string }) {
	const systemsQuery = useMasterModuleSystemListPage();
	const record = useMemo(
		() => systemsQuery.records.find((candidate) => candidate.id === Number(recordId)),
		[recordId, systemsQuery.records],
	);

	if (systemsQuery.isLoading) return <ModuleSystemPageSkeleton />;

	if (!record) {
		return (
			<ModuleNotFound
				title="System not found"
				description="The selected module system is not available in the master system list."
				actionHref={MasterModuleSystemsHref}
				actionLabel="Back to systems"
			/>
		);
	}

	return (
		<section className="grid gap-5">
			<ModuleHeader
				variant="card"
				titleAs="h1"
				eyebrow="Master"
				title={record.name}
				description={record.description || "No description"}
				actions={
					<>
						<Link
							href={MasterModuleSystemsHref}
							className={moduleHeaderActionClassNames.secondary}
						>
							<ArrowLeft className="h-4 w-4" aria-hidden="true" />
							Back
						</Link>
						<Link
							href={getMasterModuleSystemSidebarHref(record.id)}
							className={moduleHeaderActionClassNames.secondary}
						>
							<ListTree className="h-4 w-4" aria-hidden="true" />
							Sidebar
						</Link>
						<Link
							href={getMasterModuleSystemEditHref(record.id)}
							className={moduleHeaderActionClassNames.primary}
						>
							<Edit3 className="h-4 w-4" aria-hidden="true" />
							Edit
						</Link>
					</>
				}
			/>
			<div className="grid gap-5 xl:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)]">
				<DetailPanel title="System Details">
					<DetailLine label="Sort order" value={String(record.sortOrder)} />
					<DetailLine label="Status" value={record.isActive ? "Active" : "Inactive"} />
					<DetailLine
						label="Sidebar template"
						value={
							record.sidebar.length
								? `${record.sidebar.length} root items`
								: "Fallback alphabetical links"
						}
					/>
				</DetailPanel>
				<DetailPanel title="Assigned Modules">
					<div className="grid gap-2 md:grid-cols-2">
						{record.modules.map((module) => (
							<div
								key={module.id}
								className="rounded-lg border border-darknavy/10 bg-offwhite/45 px-3 py-2"
							>
								<p className="text-sm font-semibold text-darknavy">
									{module.name}
								</p>
								<p className="mt-1 text-xs font-bold uppercase text-darknavy/42">
									{module.code}
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
		<section className="grid content-start gap-4 rounded-lg border border-darknavy/10 bg-white p-4 shadow-sm">
			<h2 className="text-base font-semibold text-darknavy">{title}</h2>
			{children}
		</section>
	);
}

function DetailLine({ label, value }: { label: string; value: string }) {
	return (
		<div className="grid gap-1">
			<p className="text-xs font-semibold uppercase text-darknavy/42">
				{label}
			</p>
			<p className="text-sm font-semibold text-darknavy">{value}</p>
		</div>
	);
}
