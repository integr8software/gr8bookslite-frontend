"use client";

import Link from "next/link";
import {
	Building2,
	GitBranch,
	Plus,
	ShieldCheck,
	UserCog,
	Users,
	type LucideIcon,
} from "lucide-react";
import {
	MasterTenantAccessEntityLabels,
	getMasterTenantAccessAddHref,
} from "@/app/src/constants/master/tenant-access/MasterTenantAccessConstants";
import { useMasterTenantAccessListPage } from "@/app/src/hooks/master/tenant-access/useMasterTenantAccessListPage";
import type { MasterTenantAccessEntity } from "@/app/src/types/master/tenant-access/MasterTenantAccessTypes";
import { MasterTenantAccessTable } from "@/app/src/ui/master/tenant-access/MasterTenantAccessTable";
import {
	ModuleHeader,
	moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";
import { ModuleMetrics } from "@/app/src/ui/shared/module/ModuleMetrics";

type MasterTenantAccessListPageProps = {
	entity: MasterTenantAccessEntity;
};

const MetricIcons = [Building2, Users, GitBranch, ShieldCheck] as const;
const HeaderIcons = {
	branch: GitBranch,
	company: Building2,
	subscriber: Users,
	user: UserCog,
} as const satisfies Record<MasterTenantAccessEntity, LucideIcon>;

export function MasterTenantAccessListPage({
	entity,
}: MasterTenantAccessListPageProps) {
	const page = useMasterTenantAccessListPage(entity);
	const labels = MasterTenantAccessEntityLabels[entity];
	const HeaderIcon = HeaderIcons[entity];

	return (
		<section className="grid gap-5">
			<ModuleHeader
				variant="card"
				titleAs="h1"
				title={labels.header}
				description={labels.description}
				eyebrow={
					<>
						<HeaderIcon className="h-3.5 w-3.5" aria-hidden="true" />
						{labels.listEyebrow}
					</>
				}
				actions={
					<Link
						href={getMasterTenantAccessAddHref(entity)}
						className={moduleHeaderActionClassNames.primary}
					>
						<Plus className="h-4 w-4" aria-hidden="true" />
						{labels.addTitle}
					</Link>
				}
			/>
			<ModuleMetrics
				metrics={page.metrics.map((metric, index) => ({
					...metric,
					icon: MetricIcons[index] ?? ShieldCheck,
					tone: getMetricTone(index),
				}))}
			/>
			<MasterTenantAccessTable entity={entity} {...page} />
		</section>
	);
}

function getMetricTone(index: number) {
	switch (index) {
		case 0:
			return "blue";
		case 1:
			return "cyan";
		case 2:
			return "emerald";
		default:
			return "violet";
	}
}
