"use client";

import { useMemo, useState } from "react";
import { CalendarDays, Download, Hash, Plus, Upload } from "lucide-react";
import {
	TermManagementDatemodeOptions,
} from "@/app/src/constants/modules/maintenance/financial-management/term-management/TermManagementConstants";
import { useTermManagementStore } from "@/app/src/hooks/modules/maintenance/financial-management/term-management/useTermManagement";
import { useMaintenanceAddDrawerSpotlight } from "@/app/src/hooks/modules/maintenance/useMaintenanceAddDrawerSpotlight";
import type { TermManagement } from "@/app/src/types/modules/maintenance/financial-management/term-management/TermManagementTypes";
import {
	ModuleHeader,
	moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";
import { ModuleMetrics } from "@/app/src/ui/shared/module/ModuleMetrics";
import {
	ModuleTableResetButton,
	ModuleTableFilterSelect,
	ModuleTableSearch,
	ModuleTableToolbar,
} from "@/app/src/ui/shared/module/module-table/ModuleTableToolbar";
import { AppDialog } from "@/app/src/ui/shared/app/AppDialog";
import { TermManagementTable } from "@/app/src/ui/modules/maintenance/financial-management/term-management/TermManagementTable";
import { TermManagementDrawer } from "@/app/src/ui/modules/maintenance/financial-management/term-management/TermManagementDrawer";

type DrawerState = { mode: "add" | "edit"; term?: TermManagement } | null;

export function TermManagementListPage() {
	const terms = useTermManagementStore((state) => state.terms);
	const deleteTerm = useTermManagementStore((state) => state.deleteTerm);
	const isLoading = useTermManagementStore((state) => state.isLoading);
	const isMutating = useTermManagementStore((state) => state.isMutating);
	const [pendingDeleteTerm, setPendingDeleteTerm] =
		useState<TermManagement | null>(null);
	const [drawerState, setDrawerState] = useState<DrawerState>(null);
	const [datemodeFilter, setDatemodeFilter] = useState("All");
	const [query, setQuery] = useState("");
	useMaintenanceAddDrawerSpotlight(
		() => setDrawerState({ mode: "add" }),
		() => setDrawerState(null),
	);
	const filteredTerms = useMemo(() => {
		const normalizedQuery = query.trim().toLowerCase();

		return terms.filter((term) => {
			if (datemodeFilter !== "All" && term.datemode !== datemodeFilter) {
				return false;
			}

			if (!normalizedQuery) {
				return true;
			}

			return [term.description, term.datemode, term.period]
				.join(" ")
				.toLowerCase()
				.includes(normalizedQuery);
		});
	}, [datemodeFilter, query, terms]);

	function handleConfirmDelete() {
		if (!pendingDeleteTerm) {
			return;
		}

		deleteTerm(pendingDeleteTerm.id);
		setPendingDeleteTerm(null);
	}

	function resetFilters() {
		setDatemodeFilter("All");
		setQuery("");
	}

	return (
		<section className="grid gap-5">
			<ModuleHeader
				variant="panel"
				titleAs="h1"
				title="Term Management"
				description="Manage datemode and period definitions used for term reporting and payment cycles."
				eyebrow={
					<>
						<CalendarDays
							className="h-3.5 w-3.5"
							aria-hidden="true"
						/>
						Accounting master data
					</>
				}
				actions={<TermManagementHeaderActions onAdd={() => setDrawerState({ mode: "add" })} />}
			/>

			<ModuleMetrics
				metrics={[
					{
						helper: "All term definitions",
						icon: CalendarDays,
						label: "Total Terms",
						value: terms.length,
					},
					{
						helper: "Uses day-based periods",
						icon: Hash,
						label: "Day Mode",
						tone: "emerald",
						value: terms.filter((term) => term.datemode === "Day")
							.length,
					},
					{
						helper: "Uses month-based periods",
						icon: CalendarDays,
						label: "Month Mode",
						tone: "violet",
						value: terms.filter((term) => term.datemode === "Month")
							.length,
					},
				]}
			/>

			<TermManagementTable
				isLoading={isLoading}
				terms={filteredTerms}
				toolbar={
					<ModuleTableToolbar className="lg:grid-cols-[minmax(24rem,2.5fr)_minmax(15rem,1fr)_minmax(11rem,1fr)]">
						<ModuleTableSearch
							label="Search terms"
							value={query}
							onChange={setQuery}
							placeholder="Search by description, datemode, or period"
						/>
						<ModuleTableFilterSelect
							label="Datemode"
							value={datemodeFilter}
							options={[
								{ label: "All", value: "All" },
								...TermManagementDatemodeOptions.map(
									(datemode) => ({
										label: datemode,
										value: datemode,
									}),
								),
							]}
							onChange={setDatemodeFilter}
						/>
						<ModuleTableResetButton onClick={resetFilters}>
							Reset
						</ModuleTableResetButton>
					</ModuleTableToolbar>
				}
				onDeleteTerm={setPendingDeleteTerm}
				onEditTerm={(term) => setDrawerState({ mode: "edit", term })}
			/>
			<TermManagementDrawer isOpen={Boolean(drawerState)} mode={drawerState?.mode ?? "add"} onClose={() => setDrawerState(null)} term={drawerState?.term} />

			<AppDialog
				isOpen={Boolean(pendingDeleteTerm)}
				isPending={isMutating}
				title="Delete term definition?"
				description={`This will remove ${pendingDeleteTerm?.description ?? "the selected term"}.`}
				confirmLabel="Delete Term"
				tone="danger"
				onCancel={() => setPendingDeleteTerm(null)}
				onConfirm={handleConfirmDelete}
			/>
		</section>
	);
}

function TermManagementHeaderActions({ onAdd }: { onAdd: () => void }) {
	return (
		<>
			<button
				type="button"
				className={moduleHeaderActionClassNames.secondary}
			>
				<Upload className="h-4 w-4" aria-hidden="true" />
				Import
			</button>
			<button
				type="button"
				className={moduleHeaderActionClassNames.secondary}
			>
				<Download className="h-4 w-4" aria-hidden="true" />
				Export
			</button>
			<button
				type="button"
				onClick={onAdd}
				className={moduleHeaderActionClassNames.primary}
			>
				<Plus className="h-4 w-4" aria-hidden="true" />
				Add Term
			</button>
		</>
	);
}
