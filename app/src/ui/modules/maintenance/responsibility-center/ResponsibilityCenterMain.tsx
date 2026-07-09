"use client";

import { normalizeLowercaseText } from "@/app/src/utils/string.util";
import { useMemo, useState, type ReactNode } from "react";
import {
	Building2,
	CheckCircle2,
	ChevronRight,
	FolderKanban,
	GitBranch,
	LayoutList,
	Layers3,
	Network,
	Plus,
} from "lucide-react";
import {
	ResponsibilityCenterCategoryOptions,
	ResponsibilityCenterFinancialTypeOptions,
	ResponsibilityCenterStatusOptions,
} from "@/app/src/constants/modules/maintenance/financial-management/responsibility-center/ResponsibilityCenterConstants";
import { useResponsibilityCenterStore } from "@/app/src/hooks/modules/maintenance/responsibility-center/useResponsibilityCenter";
import { useMaintenanceAddDrawerSpotlight } from "@/app/src/hooks/modules/maintenance/useMaintenanceAddDrawerSpotlight";
import type {
	ResponsibilityCenter,
	ResponsibilityCenterStatus,
} from "@/app/src/types/modules/maintenance/responsibility-center/ResponsibilityCenterTypes";
import {
	ModuleHeader,
	moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";
import { ModuleStatisticCards } from "@/app/src/ui/shared/module/ModuleStatisticCards";
import {
	ModuleTableResetButton,
	ModuleTableFilterSelect,
	ModuleTableSearch,
	ModuleTableToolbar,
} from "@/app/src/ui/shared/module/module-table/ModuleTableToolbar";
import { ResponsibilityCenterSetStatusDialog } from "@/app/src/ui/modules/maintenance/responsibility-center/ResponsibilityCenterSetStatusDialog";
import { ResponsibilityCenterTable } from "@/app/src/ui/modules/maintenance/responsibility-center/ResponsibilityCenterTable";
import { ResponsibilityCenterDrawer } from "@/app/src/ui/modules/maintenance/responsibility-center/ResponsibilityCenterDrawer";
import { ResponsibilityCenterTree } from "@/app/src/ui/modules/maintenance/responsibility-center/ResponsibilityCenterTree";

type DrawerState = {
	center?: ResponsibilityCenter;
	mode: "add" | "edit";
} | null;

export function ResponsibilityCenterMain() {
	const centers = useResponsibilityCenterStore((state) => state.centers);
	const updateCenter = useResponsibilityCenterStore(
		(state) => state.updateCenter,
	);
	const isMutating = useResponsibilityCenterStore(
		(state) => state.isMutating,
	);
	const lastSyncedAt = useResponsibilityCenterStore(
		(state) => state.lastSyncedAt,
	);
	const [pendingStatusCenter, setPendingStatusCenter] =
		useState<ResponsibilityCenter | null>(null);
	const [drawerState, setDrawerState] = useState<DrawerState>(null);
	const [query, setQuery] = useState("");
	const [categoryFilter, setCategoryFilter] = useState("All");
	const [financialTypeFilter, setFinancialTypeFilter] = useState("All");
	const [managerFilter, setManagerFilter] = useState("All");
	const [statusFilter, setStatusFilter] = useState("All");
	const [viewMode, setViewMode] = useState<"table" | "tree">("table");
	useMaintenanceAddDrawerSpotlight(
		() => setDrawerState({ mode: "add" }),
		() => setDrawerState(null),
	);
	const managerOptions = useMemo(
		() =>
			Array.from(
				new Set(
					centers
						.map((center) => center.manager)
						.filter((manager) => manager.trim()),
				),
			).sort((a, b) => a.localeCompare(b)),
		[centers],
	);
	const summaryCards = useMemo(
		() => [
			{
				helper: "All responsibility centers",
				icon: Network,
				label: "Total Centers",
				value: centers.length,
			},
			{
				helper: "Available for transactions",
				icon: CheckCircle2,
				label: "Active Centers",
				tone: "emerald" as const,
				value: centers.filter((center) => center.status === "Active")
					.length,
			},
			{
				helper: "Organizational reporting groups",
				icon: GitBranch,
				label: "Divisions",
				tone: "violet" as const,
				value: centers.filter((center) => center.category === "Division")
					.length,
			},
			{
				helper: "Operational responsibility units",
				icon: Layers3,
				label: "Departments",
				tone: "cyan" as const,
				value: centers.filter((center) => center.category === "Department")
					.length,
			},
			{
				helper: "Project accountability groups",
				icon: FolderKanban,
				label: "Projects",
				tone: "amber" as const,
				value: centers.filter((center) => center.category === "Project")
					.length,
			},
			{
				helper: "Location-based cost centers",
				icon: Building2,
				label: "Buildings",
				tone: "slate" as const,
				value: centers.filter((center) => center.category === "Building")
					.length,
			},
		],
		[centers],
	);
	const filteredCenters = useMemo(() => {
		const normalizedQuery = normalizeLowercaseText(query);

		return centers.filter((center) => {
			const parentName = center.parentId
				? centers.find(
					(parentCenter) => parentCenter.id === center.parentId,
				)?.name
				: "";

			if (statusFilter !== "All" && center.status !== statusFilter) {
				return false;
			}

			if (
				categoryFilter !== "All" &&
				center.category !== categoryFilter
			) {
				return false;
			}

			if (
				financialTypeFilter !== "All" &&
				center.financialType !== financialTypeFilter
			) {
				return false;
			}

			if (managerFilter !== "All" && center.manager !== managerFilter) {
				return false;
			}

			if (!normalizedQuery) {
				return true;
			}

			return [
				center.code,
				center.name,
				center.category,
				center.financialType,
				center.manager,
				parentName,
				center.status,
				center.description,
			]
				.join(" ")
				.toLowerCase()
				.includes(normalizedQuery);
		});
	}, [
		categoryFilter,
		centers,
		financialTypeFilter,
		managerFilter,
		query,
		statusFilter,
	]);

	function handleConfirmStatusChange() {
		if (!pendingStatusCenter) {
			return;
		}

		const nextStatus: ResponsibilityCenterStatus =
			pendingStatusCenter.status === "Active" ? "Inactive" : "Active";

		updateCenter({
			...pendingStatusCenter,
			status: nextStatus,
			updatedAt: new Date().toISOString(),
		});
		setPendingStatusCenter(null);
	}

	function resetFilters() {
		setQuery("");
		setCategoryFilter("All");
		setFinancialTypeFilter("All");
		setManagerFilter("All");
		setStatusFilter("All");
	}

	return (
		<section className="grid gap-5">
			<div className="flex flex-wrap items-center gap-1 text-xs font-semibold text-darknavy/55">
				<span>Maintenance</span>
				<ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
				<span className="text-darknavy">Responsibility Centers</span>
			</div>
			<ModuleHeader
				variant="panel"
				titleAs="h1"
				title="Responsibility Centers"
				description="Manage organizational units used for accountability, budgeting, and financial reporting."
				actions={
					<button
						type="button"
						onClick={() => setDrawerState({ mode: "add" })}
						className={moduleHeaderActionClassNames.primary}
					>
						<Plus className="h-4 w-4" aria-hidden="true" />
						Add Responsibility Center
					</button>
				}
			/>
			<ModuleStatisticCards items={summaryCards} />
			<div className="overflow-hidden rounded-lg border border-darknavy/10 bg-white shadow-sm">
				<div className="flex flex-col gap-3 border-b border-darknavy/10 bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
					<div>
						<p className="text-sm font-semibold text-darknavy">View</p>
						<p className="mt-1 text-xs font-medium text-darknavy/55">
							Switch between list records and organizational hierarchy.
						</p>
					</div>
					<div className="flex flex-wrap gap-2">
						<ViewModeButton
							isActive={viewMode === "table"}
							icon={<LayoutList className="h-4 w-4" aria-hidden="true" />}
							label="Table View"
							onClick={() => setViewMode("table")}
						/>
						<ViewModeButton
							isActive={viewMode === "tree"}
							icon={<Network className="h-4 w-4" aria-hidden="true" />}
							label="Tree View"
							onClick={() => setViewMode("tree")}
						/>
					</div>
				</div>
				<ModuleTableToolbar className="lg:grid-cols-[minmax(18rem,2fr)_repeat(4,minmax(11rem,1fr))_minmax(10rem,0.8fr)]">
					<ModuleTableSearch
						label="Search responsibility centers"
						value={query}
						onChange={setQuery}
						placeholder="Search by name, manager, or parent center"
					/>
					<ModuleTableFilterSelect
						label="Category"
						value={categoryFilter}
						options={[
							{ label: "All", value: "All" },
							...ResponsibilityCenterCategoryOptions.map((category) => ({
								label: category,
								value: category,
							})),
						]}
						onChange={setCategoryFilter}
					/>
					<ModuleTableFilterSelect
						label="Financial Type"
						value={financialTypeFilter}
						options={[
							{ label: "All", value: "All" },
							...ResponsibilityCenterFinancialTypeOptions.map((type) => ({
								label: type,
								value: type,
							})),
						]}
						onChange={setFinancialTypeFilter}
					/>
					<ModuleTableFilterSelect
						label="Manager"
						value={managerFilter}
						options={[
							{ label: "All", value: "All" },
							...managerOptions.map((manager) => ({
								label: manager,
								value: manager,
							})),
						]}
						onChange={setManagerFilter}
					/>
					<ModuleTableFilterSelect
						label="Status"
						value={statusFilter}
						options={[
							{ label: "All", value: "All" },
							...ResponsibilityCenterStatusOptions.map((status) => ({
								label: status,
								value: status,
							})),
						]}
						onChange={setStatusFilter}
					/>
					<ModuleTableResetButton onClick={resetFilters}>
						Reset
					</ModuleTableResetButton>
				</ModuleTableToolbar>
			</div>
			{viewMode === "table" ? (
				<ResponsibilityCenterTable
					allCenters={centers}
					centers={filteredCenters}
					lastSyncedAt={lastSyncedAt}
					onStatusChangeCenter={setPendingStatusCenter}
					onEditCenter={(center) =>
						setDrawerState({ center, mode: "edit" })
					}
				/>
			) : (
				<ResponsibilityCenterTree
					centers={filteredCenters}
					onStatusChangeCenter={setPendingStatusCenter}
					onEditCenter={(center) =>
						setDrawerState({ center, mode: "edit" })
					}
				/>
			)}
			<ResponsibilityCenterDrawer
				center={drawerState?.center}
				isOpen={Boolean(drawerState)}
				mode={drawerState?.mode ?? "add"}
				onClose={() => setDrawerState(null)}
			/>
			<ResponsibilityCenterSetStatusDialog
				center={pendingStatusCenter}
				isOpen={Boolean(pendingStatusCenter)}
				isPending={isMutating}
				onCancel={() => setPendingStatusCenter(null)}
				onConfirm={handleConfirmStatusChange}
			/>
		</section>
	);
}

function ViewModeButton({
	icon,
	isActive,
	label,
	onClick,
}: {
	icon: ReactNode;
	isActive: boolean;
	label: string;
	onClick: () => void;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			className={`inline-flex h-10 items-center justify-center gap-2 rounded-md border px-3 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-skyblue/15 ${isActive
				? "border-skyblue bg-skyblue/10 text-darknavy"
				: "border-darknavy/10 bg-white text-darknavy/65 hover:border-skyblue/40 hover:bg-skyblue/10 hover:text-darknavy"
				}`}
			aria-pressed={isActive}
		>
			{icon}
			{label}
		</button>
	);
}
