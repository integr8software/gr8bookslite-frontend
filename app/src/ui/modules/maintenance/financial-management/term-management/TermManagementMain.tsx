"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import Link from "next/link";
import {
	CalendarDays,
	Download,
	Edit3,
	Eye,
	Plus,
	Trash2,
	Upload,
} from "lucide-react";
import { TermManagementHref } from "@/app/src/constants/modules/maintenance/financial-management/term-management/TermManagementConstants";
import { useTermManagementStore } from "@/app/src/hooks/modules/maintenance/financial-management/term-management/useTermManagement";
import {
	ModuleHeader,
	moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";
import { AppConfirmDialog } from "@/app/src/ui/shared/system/AppConfirmDialog";
import type { TermManagement } from "@/app/src/types/modules/maintenance/financial-management/term-management/TermManagementTypes";

export function TermManagementMain() {
	const terms = useTermManagementStore((state) => state.terms);
	const deleteTerm = useTermManagementStore((state) => state.deleteTerm);
	const isLoading = useTermManagementStore((state) => state.isLoading);
	const isMutating = useTermManagementStore((state) => state.isMutating);
	const [pendingDeleteTerm, setPendingDeleteTerm] =
		useState<TermManagement | null>(null);

	function handleConfirmDelete() {
		if (!pendingDeleteTerm) {
			return;
		}

		deleteTerm(pendingDeleteTerm.id);
		setPendingDeleteTerm(null);
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
						<CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
						Accounting master data
					</>
				}
				actions={
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
						<Link
							href={`${TermManagementHref}/add`}
							className={moduleHeaderActionClassNames.primary}
						>
							<Plus className="h-4 w-4" aria-hidden="true" />
							Add Term
						</Link>
					</>
				}
			/>

			<div className="overflow-x-auto rounded-lg border border-darknavy/10 bg-white shadow-sm">
				<table className="min-w-full divide-y divide-darknavy/10 text-sm text-darknavy">
					<thead className="bg-darknavy/5 text-left text-xs uppercase tracking-wide text-darknavy/70">
						<tr>
							<th className="px-4 py-3">Description</th>
							<th className="px-4 py-3">Datemode</th>
							<th className="px-4 py-3">Period</th>
							<th className="px-4 py-3">Actions</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-darknavy/10">
						{isLoading ? (
							<TermManagementTableMessage>
								Loading term definitions...
							</TermManagementTableMessage>
						) : null}
						{!isLoading && terms.length === 0 ? (
							<TermManagementTableMessage>
								No term records found.
							</TermManagementTableMessage>
						) : null}
						{!isLoading
							? terms.map((term) => (
									<TermManagementTableRow
										key={term.id}
										term={term}
										onDeleteTerm={setPendingDeleteTerm}
									/>
								))
							: null}
					</tbody>
				</table>
			</div>

			<AppConfirmDialog
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

function TermManagementTableRow({
	term,
	onDeleteTerm,
}: {
	term: TermManagement;
	onDeleteTerm: (term: TermManagement) => void;
}) {
	return (
		<tr>
			<td className="px-4 py-4 font-medium">{term.description}</td>
			<td className="px-4 py-4">{term.datemode}</td>
			<td className="px-4 py-4">{term.period}</td>
			<td className="px-4 py-4">
				<div className="flex flex-wrap items-center gap-2">
					<Link
						href={`${TermManagementHref}/view/${term.id}`}
						aria-label={`View ${term.description}`}
						className={tableActionClassName}
					>
						<Eye className="h-4 w-4" aria-hidden="true" />
					</Link>
					<Link
						href={`${TermManagementHref}/edit/${term.id}`}
						aria-label={`Edit ${term.description}`}
						className={tableActionClassName}
					>
						<Edit3 className="h-4 w-4" aria-hidden="true" />
					</Link>
					<button
						type="button"
						onClick={() => onDeleteTerm(term)}
						aria-label={`Delete ${term.description}`}
						className="inline-flex h-9 w-9 items-center justify-center rounded-md text-coralpink transition hover:bg-coralpink/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coralpink/30"
					>
						<Trash2 className="h-4 w-4" aria-hidden="true" />
					</button>
				</div>
			</td>
		</tr>
	);
}

function TermManagementTableMessage({
	children,
}: {
	children: ReactNode;
}) {
	return (
		<tr>
			<td colSpan={4} className="px-4 py-6 text-center text-sm text-darknavy/60">
				{children}
			</td>
		</tr>
	);
}

const tableActionClassName =
	"inline-flex h-9 w-9 items-center justify-center rounded-md text-darknavy transition hover:bg-skyblue/10 hover:text-skyblue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/35";
