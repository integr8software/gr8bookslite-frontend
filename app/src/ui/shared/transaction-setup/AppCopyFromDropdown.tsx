"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Search } from "lucide-react";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";

export type AppCopyFromRecord = {
	amount?: string;
	documentDate?: string;
	id: string;
	partyName?: string;
	source: string;
	sourceNo: string;
};

export function AppCopyFromDropdown({
	disabled = false,
	records,
	selectionMode = "single",
	sources,
	onApply,
}: {
	disabled?: boolean;
	records: AppCopyFromRecord[];
	selectionMode?: "multiple" | "single";
	sources: string[];
	onApply: (recordIds: string[]) => void;
}) {
	const rootRef = useRef<HTMLDivElement>(null);
	const [isOpen, setIsOpen] = useState(false);
	const [query, setQuery] = useState("");
	const [source, setSource] = useState("");
	const [selectedIds, setSelectedIds] = useState<string[]>([]);
	const filteredRecords = useMemo(() => {
		const normalizedQuery = query.trim().toLowerCase();

		return records.filter((record) => {
			const matchesSource = source ? record.source === source : true;
			const matchesQuery =
				!normalizedQuery ||
				[
					record.source,
					record.sourceNo,
					record.partyName,
					record.documentDate,
					record.amount,
				]
					.filter(Boolean)
					.join(" ")
					.toLowerCase()
					.includes(normalizedQuery);

			return matchesSource && matchesQuery;
		});
	}, [query, records, source]);

	useEffect(() => {
		if (!isOpen) {
			return;
		}

		function handlePointerDown(event: PointerEvent) {
			if (!rootRef.current?.contains(event.target as Node)) {
				setIsOpen(false);
			}
		}

		function handleKeyDown(event: KeyboardEvent) {
			if (event.key === "Escape") {
				setIsOpen(false);
			}
		}

		document.addEventListener("pointerdown", handlePointerDown);
		document.addEventListener("keydown", handleKeyDown);

		return () => {
			document.removeEventListener("pointerdown", handlePointerDown);
			document.removeEventListener("keydown", handleKeyDown);
		};
	}, [isOpen]);

	function toggleRecord(recordId: string) {
		setSelectedIds((currentIds) => {
			if (selectionMode === "single") {
				return currentIds.includes(recordId) ? [] : [recordId];
			}

			return currentIds.includes(recordId)
				? currentIds.filter((currentId) => currentId !== recordId)
				: [...currentIds, recordId];
		});
	}

	function applySelection() {
		if (selectedIds.length === 0) {
			return;
		}

		onApply(selectedIds);
		setIsOpen(false);
		setSelectedIds([]);
		setQuery("");
		setSource("");
	}

	return (
		<div ref={rootRef} className="relative inline-flex">
			<button
				type="button"
				disabled={disabled}
				onClick={() => setIsOpen((current) => !current)}
				className="theme-accent-contrast-text inline-flex h-10 items-center justify-center gap-2 rounded-md bg-skyblue px-4 text-sm font-semibold transition hover:bg-skyblue/85 disabled:cursor-not-allowed disabled:opacity-45"
				aria-expanded={isOpen}
				aria-haspopup="menu"
			>
				Copy From
				<ChevronDown
					className={joinClasses("h-4 w-4 transition", isOpen && "rotate-180")}
					aria-hidden="true"
				/>
			</button>
			{isOpen ? (
				<div className="absolute right-0 top-full z-130 mt-2 w-[min(32rem,calc(100vw-2rem))] overflow-hidden rounded-lg border border-darknavy/10 bg-white shadow-[0_18px_46px_rgba(33,39,56,0.18)]">
					<div className="grid gap-2 border-b border-darknavy/10 p-3 sm:grid-cols-[12rem_minmax(0,1fr)]">
						<select
							value={source}
							onChange={(event) => {
								setSource(event.target.value);
								setSelectedIds([]);
							}}
							className="h-10 rounded-md border border-darknavy/10 bg-white px-3 text-sm font-medium text-darknavy outline-none focus:border-skyblue/45 focus:ring-2 focus:ring-skyblue/15"
						>
							<option value="">All modules</option>
							{sources.map((copySource) => (
								<option key={copySource} value={copySource}>
									{copySource}
								</option>
							))}
						</select>
						<label className="flex h-10 items-center gap-2 rounded-md border border-darknavy/10 px-3">
							<Search className="h-4 w-4 text-darknavy/35" aria-hidden="true" />
							<input
								value={query}
								onChange={(event) => setQuery(event.target.value)}
								placeholder="Search transaction"
								className="min-w-0 flex-1 bg-transparent text-sm text-darknavy outline-none placeholder:text-darknavy/35"
							/>
						</label>
					</div>
					<div className="max-h-80 overflow-y-auto p-2">
						{filteredRecords.length > 0 ? (
							filteredRecords.map((record) => {
								const isSelected = selectedIds.includes(record.id);

								return (
									<button
										key={record.id}
										type="button"
										onClick={() => toggleRecord(record.id)}
										className={joinClasses(
											"grid w-full grid-cols-[auto_minmax(0,1fr)] gap-3 rounded-md px-3 py-2 text-left transition hover:bg-skyblue/8",
											isSelected && "bg-skyblue/12",
										)}
									>
										<span className="mt-0.5 flex h-5 w-5 items-center justify-center rounded border border-darknavy/18">
											{isSelected ? (
												<Check className="h-3.5 w-3.5 text-skyblue" />
											) : null}
										</span>
										<span className="min-w-0">
											<span className="block truncate text-sm font-semibold text-darknavy">
												{record.sourceNo}
											</span>
											<span className="mt-0.5 block truncate text-xs text-darknavy/55">
												{record.source}
												{record.partyName ? ` - ${record.partyName}` : ""}
											</span>
										</span>
									</button>
								);
							})
						) : (
							<p className="px-3 py-8 text-center text-sm text-darknavy/50">
								No transactions found.
							</p>
						)}
					</div>
					<div className="flex items-center justify-between gap-3 border-t border-darknavy/10 p-3">
						<span className="text-xs font-semibold text-darknavy/50">
							{selectedIds.length} selected
						</span>
						<button
							type="button"
							disabled={selectedIds.length === 0}
							onClick={applySelection}
							className="theme-accent-contrast-text inline-flex h-9 items-center justify-center rounded-md bg-skyblue px-4 text-xs font-semibold transition hover:bg-skyblue/85 disabled:cursor-not-allowed disabled:opacity-45"
						>
							Apply
						</button>
					</div>
				</div>
			) : null}
		</div>
	);
}
