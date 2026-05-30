"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Home, Plus } from "lucide-react";
import {
	ResponsibilityCenterHref,
	ResponsibilityCenterStatusOptions,
	ResponsibilityCenterTypeOptions,
} from "@/app/src/constants/modules/maintenance/financial-management/responsibility-center/ResponsibilityCenterConstants";
import { useResponsibilityCenterStore } from "@/app/src/hooks/modules/maintenance/financial-management/responsibility-center/useResponsibilityCenter";
import type {
	ResponsibilityCenter,
	ResponsibilityCenterStatus,
} from "@/app/src/types/modules/maintenance/financial-management/responsibility-center/ResponsibilityCenterTypes";
import {
	ModuleHeader,
	moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";
import {
	ModuleTableResetButton,
	ModuleTableFilterSelect,
	ModuleTableSearch,
	ModuleTableToolbar,
} from "@/app/src/ui/shared/module/ModuleTableToolbar";
import { ResponsibilityCenterSetStatusDialog } from "@/app/src/ui/modules/maintenance/financial-management/responsibility-center/ResponsibilityCenterSetStatusDialog";
import { ResponsibilityCenterTable } from "@/app/src/ui/modules/maintenance/financial-management/responsibility-center/ResponsibilityCenterTable";

export function ResponsibilityCenterMain() {
	const centers = useResponsibilityCenterStore((state) => state.centers);
	const updateCenter = useResponsibilityCenterStore(
		(state) => state.updateCenter,
	);
	const isMutating = useResponsibilityCenterStore((state) => state.isMutating);
	const [pendingStatusCenter, setPendingStatusCenter] =
		useState<ResponsibilityCenter | null>(null);
	const [query, setQuery] = useState("");
	const [statusFilter, setStatusFilter] = useState("All");
	const [typeFilter, setTypeFilter] = useState("All");
	const filteredCenters = useMemo(() => {
		const normalizedQuery = query.trim().toLowerCase();

		return centers.filter((center) => {
			const parentName = center.parentId
				? centers.find((parentCenter) => parentCenter.id === center.parentId)
						?.name
				: "";

			if (statusFilter !== "All" && center.status !== statusFilter) {
				return false;
			}

			if (typeFilter !== "All" && center.type !== typeFilter) {
				return false;
			}

			if (!normalizedQuery) {
				return true;
			}

			return [
				center.code,
				center.name,
				center.type,
				center.manager,
				parentName,
				center.status,
				center.description,
			]
				.join(" ")
				.toLowerCase()
				.includes(normalizedQuery);
		});
	}, [centers, query, statusFilter, typeFilter]);

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
		setStatusFilter("All");
		setTypeFilter("All");
	}

	return (
		<section className="grid gap-5">
			<ModuleHeader
				variant="panel"
				titleAs="h1"
				title="Responsibility Center"
				description="Maintain accountability centers for cost, revenue, profit, and investment reporting."
				eyebrow={
					<>
						<Home className="h-3.5 w-3.5" aria-hidden="true" />
						Accounting master data
					</>
				}
				actions={
					<Link
						href={`${ResponsibilityCenterHref}/add`}
						className={moduleHeaderActionClassNames.primary}
					>
						<Plus className="h-4 w-4" aria-hidden="true" />
						Add Center
					</Link>
				}
			/>
			<ResponsibilityCenterTable
				centers={filteredCenters}
				toolbar={
					<ModuleTableToolbar className="lg:grid-cols-[minmax(24rem,2.5fr)_minmax(15rem,1fr)_minmax(15rem,1fr)_minmax(11rem,1fr)]">
						<ModuleTableSearch
							label="Search responsibility centers"
							value={query}
							onChange={setQuery}
							placeholder="Search by code, name, type, manager, or status"
						/>
						<ModuleTableFilterSelect
							label="Type"
							value={typeFilter}
							options={[
								{ label: "All", value: "All" },
								...ResponsibilityCenterTypeOptions.map((type) => ({
									label: type,
									value: type,
								})),
							]}
							onChange={setTypeFilter}
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
				}
				onStatusChangeCenter={setPendingStatusCenter}
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

