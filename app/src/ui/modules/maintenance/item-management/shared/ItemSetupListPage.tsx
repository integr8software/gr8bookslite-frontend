"use client";

import Link from "next/link";
import {
	CheckCircle2,
	CirclePause,
	Layers,
	ListTree,
	Network,
	Plus,
	Tags,
} from "lucide-react";
import type { ReactNode } from "react";
import {
	ItemSetupConfigByKind,
	ItemStatusOptions,
} from "@/app/src/constants/modules/maintenance/item-management/ItemManagementConstants";
import { useItemSetupListPage } from "@/app/src/hooks/modules/maintenance/item-management/useItemSetupListPage";
import type { ItemSetupKind } from "@/app/src/types/modules/maintenance/item-management/ItemManagementTypes";
import { AppDialog } from "@/app/src/ui/shared/app/AppDialog";
import {
	ModuleHeader,
	moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";
import {
	type ModuleMetricItem,
	ModuleMetrics,
} from "@/app/src/ui/shared/module/ModuleMetrics";
import {
	ModuleTableResetButton,
	ModuleTableFilterSelect,
	ModuleTableSearch,
	ModuleTableToolbar,
} from "@/app/src/ui/shared/module/ModuleTableToolbar";
import { ItemSetupTable } from "@/app/src/ui/modules/maintenance/item-management/shared/ItemSetupTable";

export function ItemSetupListPage({ kind }: { kind: ItemSetupKind }) {
	const config = ItemSetupConfigByKind[kind];
	const page = useItemSetupListPage(kind);
	const childConfig = page.childKind
		? ItemSetupConfigByKind[page.childKind]
		: null;
	const setupRecords = [...page.records, ...page.childRecords];
	const metrics: ModuleMetricItem[] = [
		{
			helper: childConfig
				? `Includes ${childConfig.title.toLowerCase()} records`
				: "All setup records",
			icon: Tags,
			label: "Total Records",
			value: setupRecords.length,
		},
		{
			helper: "Available for selection",
			icon: CheckCircle2,
			label: "Active Records",
			tone: "emerald",
			value: setupRecords.filter((record) => record.status === "Active").length,
		},
		{
			helper: "Currently inactive",
			icon: CirclePause,
			label: "Inactive Records",
			tone: "amber",
			value: setupRecords.filter((record) => record.status === "Inactive")
				.length,
		},
	];

	if (childConfig) {
		metrics.push({
			helper: `${childConfig.title} under this setup`,
			icon: Layers,
			label: childConfig.title,
			tone: "violet",
			value: page.childRecords.length,
		});
	}

	return (
		<section className="grid gap-5">
			<ModuleHeader
				variant="panel"
				titleAs="h1"
				title={config.title}
				description={config.description}
				eyebrow={
					<>
						<Tags className="h-3.5 w-3.5" aria-hidden="true" />
						{config.eyebrow}
					</>
				}
				actions={
					<>
						{childConfig ? (
							<Link
								href={`${childConfig.href}/add`}
								className={moduleHeaderActionClassNames.secondary}
							>
								<Plus className="h-4 w-4" aria-hidden="true" />
								Add {childConfig.singularTitle}
							</Link>
						) : null}
						<Link
							href={`${config.href}/add`}
							className={moduleHeaderActionClassNames.primary}
						>
							<Plus className="h-4 w-4" aria-hidden="true" />
							Add {config.singularTitle}
						</Link>
					</>
				}
			/>
			<ModuleMetrics metrics={metrics} />
			<ItemSetupTable
				expandedIds={page.expandedIds}
				isLoading={page.isLoading}
				kind={kind}
				setPendingDeleteRecord={page.setPendingDeleteRecord}
				table={page.table}
				toolbar={
					<div>
						{childConfig ? (
							<div className="flex flex-col gap-3 border-b border-darknavy/10 px-5 py-4 sm:flex-row sm:justify-end">
								<ItemSetupStructureButton
									active={page.structureFilter === "With Submodules"}
									icon={<Network className="h-4 w-4" aria-hidden="true" />}
									label="With Submodules"
									onClick={() =>
										page.handleStructureFilterChange("With Submodules")
									}
								/>
								<ItemSetupStructureButton
									active={page.structureFilter === "Without Submodules"}
									icon={<ListTree className="h-4 w-4" aria-hidden="true" />}
									label="Without Submodules"
									onClick={() =>
										page.handleStructureFilterChange("Without Submodules")
									}
								/>
							</div>
						) : null}
						<ModuleTableToolbar>
							<ModuleTableSearch
								label={`Search ${config.title.toLowerCase()} records`}
								value={page.query}
								onChange={page.handleQueryChange}
								placeholder={`Search ${config.title.toLowerCase()} records`}
							/>
							<ModuleTableFilterSelect
								label="Level"
								value={page.levelFilter}
								options={[
									{ label: "All Levels", value: "All" },
									{ label: config.singularTitle, value: kind },
									...(childConfig
										? [
												{
													label: childConfig.singularTitle,
													value: page.childKind ?? "",
												},
											]
										: []),
								]}
								onChange={page.handleLevelFilterChange}
							/>
							<ModuleTableFilterSelect
								label="Status"
								value={page.statusFilter}
								options={[
									{ label: "All Status", value: "All" },
									...ItemStatusOptions.map((status) => ({
										label: status,
										value: status,
									})),
								]}
								onChange={page.handleStatusFilterChange}
							/>
							<ModuleTableResetButton onClick={page.resetFilters}>
								Reset
							</ModuleTableResetButton>
						</ModuleTableToolbar>
					</div>
				}
				onToggleExpanded={page.toggleExpanded}
			/>
			<AppDialog
				isOpen={Boolean(page.pendingDeleteRecord)}
				isPending={page.isMutating}
				title={`Delete ${
					page.pendingDeleteRecord
						? ItemSetupConfigByKind[
								page.pendingDeleteRecord.kind
							].singularTitle.toLowerCase()
						: "setup record"
				}?`}
				description={`This will remove ${page.pendingDeleteRecord?.record.name ?? "the selected record"}.`}
				confirmLabel="Delete Record"
				tone="danger"
				onCancel={() => page.setPendingDeleteRecord(null)}
				onConfirm={page.handleConfirmDelete}
			/>
		</section>
	);
}

function ItemSetupStructureButton({
	active,
	icon,
	label,
	onClick,
}: {
	active: boolean;
	icon: ReactNode;
	label: "With Submodules" | "Without Submodules";
	onClick: () => void;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			className={[
				"inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-md border px-4 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-skyblue/20",
				active
					? "border-skyblue bg-skyblue/10 text-skyblue"
					: "border-darknavy/10 bg-white text-darknavy/75 hover:border-skyblue/40 hover:bg-skyblue/10",
			].join(" ")}
		>
			{icon}
			{label}
		</button>
	);
}

