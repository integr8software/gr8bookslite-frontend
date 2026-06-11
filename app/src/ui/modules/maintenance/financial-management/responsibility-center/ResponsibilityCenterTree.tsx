"use client";

import { useState } from "react";
import {
	CheckCircle2,
	ChevronRight,
	CircleOff,
	Edit3,
	Eye,
	Network,
} from "lucide-react";
import { ResponsibilityCenterHref } from "@/app/src/constants/modules/maintenance/financial-management/responsibility-center/ResponsibilityCenterConstants";
import type { ResponsibilityCenter } from "@/app/src/types/modules/maintenance/financial-management/responsibility-center/ResponsibilityCenterTypes";
import {
	ModuleActionMenu,
	type ModuleActionMenuItem,
} from "@/app/src/ui/shared/module/ModuleActionMenu";
import { ModuleTableActions } from "@/app/src/ui/shared/module/module-table/ModuleTableActions";
import {
	CategoryBadge,
	FinancialTypeBadge,
} from "@/app/src/ui/modules/maintenance/financial-management/responsibility-center/ResponsibilityCenterTableRow";

type ResponsibilityCenterTreeProps = {
	centers: ResponsibilityCenter[];
	onEditCenter: (center: ResponsibilityCenter) => void;
	onStatusChangeCenter: (center: ResponsibilityCenter) => void;
};

type ResponsibilityCenterTreeRow = {
	center: ResponsibilityCenter;
	depth: number;
	isCollapsed: boolean;
	hasChildren: boolean;
};

export function ResponsibilityCenterTree({
	centers,
	onEditCenter,
	onStatusChangeCenter,
}: ResponsibilityCenterTreeProps) {
	const [collapsedCenterIds, setCollapsedCenterIds] = useState<Set<string>>(
		() => new Set(),
	);
	const childCenters = new Map<string, ResponsibilityCenter[]>();
	const rootCenters: ResponsibilityCenter[] = [];

	centers.forEach((center) => {
		if (center.parentId && centers.some(({ id }) => id === center.parentId)) {
			const siblings = childCenters.get(center.parentId) ?? [];
			siblings.push(center);
			childCenters.set(center.parentId, siblings);
			return;
		}

		rootCenters.push(center);
	});

	const sortByCode = (a: ResponsibilityCenter, b: ResponsibilityCenter) =>
		a.code.localeCompare(b.code);

	rootCenters.sort(sortByCode);
	childCenters.forEach((children) => children.sort(sortByCode));
	const rows = flattenTree(rootCenters, childCenters, collapsedCenterIds);

	function toggleCenter(centerId: string) {
		setCollapsedCenterIds((currentIds) => {
			const nextIds = new Set(currentIds);

			if (nextIds.has(centerId)) {
				nextIds.delete(centerId);
			} else {
				nextIds.add(centerId);
			}

			return nextIds;
		});
	}

	return (
		<section className="overflow-hidden rounded-lg border border-darknavy/10 bg-white shadow-sm">
			<div className="flex flex-col gap-2 border-b border-darknavy/10 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
				<div>
					<h2 className="flex items-center gap-2 text-sm font-semibold text-darknavy">
						<Network className="h-4 w-4 text-skyblue" aria-hidden="true" />
						Organizational Hierarchy
					</h2>
					<p className="mt-1 text-xs font-medium text-darknavy/55">
						Review reporting lines by parent center.
					</p>
				</div>
				<span className="w-fit rounded-full bg-skyblue/10 px-3 py-1 text-xs font-semibold text-darknavy">
					{rows.length} centers
				</span>
			</div>
			{rows.length ? (
				<div className="overflow-x-auto">
					<div className="min-w-[78rem]">
						<div className="grid grid-cols-[minmax(34rem,2fr)_minmax(9rem,0.55fr)_minmax(11rem,0.65fr)_minmax(10rem,0.55fr)_minmax(7rem,0.4fr)_minmax(6rem,0.35fr)] border-b border-darknavy/10 bg-offwhite/70 px-4 py-3 text-xs font-bold uppercase tracking-wide text-darknavy/55">
							<div className="text-center">Center Name</div>
							<div>Category</div>
							<div>Financial Type</div>
							<div>Manager</div>
							<div>Status</div>
							<div className="text-center">Actions</div>
						</div>
						<div className="divide-y divide-darknavy/8">
							{rows.map(({ center, depth, hasChildren, isCollapsed }) => (
								<TreeRow
									key={center.id}
									center={center}
									depth={depth}
									hasChildren={hasChildren}
									isCollapsed={isCollapsed}
									onEditCenter={onEditCenter}
									onStatusChangeCenter={onStatusChangeCenter}
									onToggleCenter={toggleCenter}
								/>
							))}
						</div>
					</div>
				</div>
			) : (
				<div className="p-8 text-center text-sm text-darknavy/55">
					No responsibility centers match the current filters.
				</div>
			)}
		</section>
	);
}

function TreeRow({
	center,
	depth,
	hasChildren,
	isCollapsed,
	onEditCenter,
	onStatusChangeCenter,
	onToggleCenter,
}: {
	center: ResponsibilityCenter;
	depth: number;
	hasChildren: boolean;
	isCollapsed: boolean;
	onEditCenter: (center: ResponsibilityCenter) => void;
	onStatusChangeCenter: (center: ResponsibilityCenter) => void;
	onToggleCenter: (centerId: string) => void;
}) {
	const nextStatus = center.status === "Active" ? "Inactive" : "Active";
	const items: ModuleActionMenuItem[] = [
		{
			href: `${ResponsibilityCenterHref}/view/${center.id}`,
			icon: Eye,
			label: "View",
			type: "link",
		},
		{
			icon: Edit3,
			label: "Edit",
			onSelect: () => onEditCenter(center),
			type: "button",
		},
		{
			icon: nextStatus === "Active" ? CheckCircle2 : CircleOff,
			label: `Set as ${nextStatus}`,
			onSelect: () => onStatusChangeCenter(center),
			tone: nextStatus === "Inactive" ? "danger" : "default",
			type: "button",
		},
	];

	return (
		<div className="grid grid-cols-[minmax(34rem,2fr)_minmax(9rem,0.55fr)_minmax(11rem,0.65fr)_minmax(10rem,0.55fr)_minmax(7rem,0.4fr)_minmax(6rem,0.35fr)] items-center gap-0 px-4 py-3 transition hover:bg-skyblue/5">
			<div className="min-w-0">
				<div
					className="flex min-w-0 items-center gap-2"
					style={{ paddingLeft: `${depth * 1.5}rem` }}
				>
					<button
						type="button"
						disabled={!hasChildren}
						onClick={() => onToggleCenter(center.id)}
						className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md border transition ${hasChildren
							? "border-skyblue/30 bg-skyblue/10 text-skyblue hover:bg-skyblue/15"
							: "cursor-default border-darknavy/10 bg-white text-darknavy/35"
							}`}
						aria-expanded={hasChildren ? !isCollapsed : undefined}
						aria-label={
							hasChildren
								? `${isCollapsed ? "Expand" : "Collapse"} ${center.name}`
								: undefined
						}
					>
						<ChevronRight
							className={`h-4 w-4 transition ${hasChildren && !isCollapsed ? "rotate-90" : ""
								} ${hasChildren ? "" : "opacity-35"}`}
							aria-hidden="true"
						/>
					</button>
					<div className="min-w-0">
						<div className="flex min-w-0 items-center gap-2">
							<span className="shrink-0 rounded-md bg-darknavy/[0.04] px-2 py-1 text-xs font-bold text-darknavy ring-1 ring-darknavy/10">
								{center.code}
							</span>
							<h3 className="truncate text-sm font-semibold text-darknavy">
								{center.name}
							</h3>
						</div>
						<p className="mt-1 truncate text-xs font-medium text-darknavy/45">
							Level {depth + 1}
						</p>
					</div>
				</div>
			</div>
			<div className="min-w-0">
				<CategoryBadge category={center.category} />
			</div>
			<div className="min-w-0">
				<FinancialTypeBadge financialType={center.financialType} />
			</div>
			<div className="truncate text-sm font-medium text-darknavy/70">
				{center.manager || "-"}
			</div>
			<div>
				<span
					className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${center.status === "Active"
						? "bg-citron/25 text-darknavy"
						: "bg-darknavy/8 text-darknavy/55"
						}`}
				>
					{center.status}
				</span>
			</div>
			<div className="flex justify-center">
				<ModuleTableActions className="justify-center">
					<ModuleActionMenu
						items={items}
						label={`Actions for ${center.name}`}
					/>
				</ModuleTableActions>
			</div>
		</div>
	);
}

function flattenTree(
	centers: ResponsibilityCenter[],
	childCenters: Map<string, ResponsibilityCenter[]>,
	collapsedCenterIds: Set<string>,
	depth = 0,
): ResponsibilityCenterTreeRow[] {
	return centers.flatMap((center) => {
		const children = childCenters.get(center.id) ?? [];
		const hasChildren = children.length > 0;
		const isCollapsed = collapsedCenterIds.has(center.id);

		if (!hasChildren || isCollapsed) {
			return [{ center, depth, hasChildren, isCollapsed }];
		}

		return [
			{ center, depth, hasChildren, isCollapsed },
			...flattenTree(
				children,
				childCenters,
				collapsedCenterIds,
				depth + 1,
			),
		];
	});
}
