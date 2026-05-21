"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Edit3, Eye, Trash2, Upload, Download } from "lucide-react";
import { AppConfirmDialog } from "@/app/src/ui/shared/AppConfirmDialog";
import { TermManagementHref } from "@/app/src/constants/modules/maintenance/financial-management/term-management/TermManagementConstants";
import { useTermManagementStore } from "@/app/src/hooks/modules/maintenance/financial-management/term-management/useTermManagement";
import type { TermManagement } from "@/app/src/types/modules/maintenance/financial-management/term-management/TermManagementTypes";

export function FinancialManagementTermManagementMain() {
	const router = useRouter();
	const terms = useTermManagementStore((state) => state.terms);
	const deleteTerm = useTermManagementStore((state) => state.deleteTerm);
	const isLoading = useTermManagementStore((state) => state.isLoading);
	const isMutating = useTermManagementStore((state) => state.isMutating);
	const [pendingDeleteTerm, setPendingDeleteTerm] = useState<TermManagement | null>(null);

	function handleViewTerm(termId: string) {
		router.push(`${TermManagementHref}/view/${termId}`);
	}

	function handleEditTerm(termId: string) {
		router.push(`${TermManagementHref}/edit/${termId}`);
	}

	function handleDeleteTerm(term: TermManagement) {
		setPendingDeleteTerm(term);
	}

	function handleConfirmDelete() {
		if (!pendingDeleteTerm) {
			return;
		}

		deleteTerm(pendingDeleteTerm.id);
		setPendingDeleteTerm(null);
	}

	return (
		<section className="grid gap-5">
			<div className="flex flex-col gap-4 rounded-lg border border-darknavy/10 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h2 className="text-xl font-semibold text-darknavy">Term Management</h2>
					<p className="mt-1 text-sm text-darknavy/55">
						Manage datemode and period definitions used for term reporting and payment cycles.
					</p>
				</div>
				<div className="flex flex-wrap items-center gap-2">
					<button
						type="button"
						className="inline-flex h-10 items-center justify-center gap-2  px-4 text-sm font-semibold text-darknavy shadow-sm transition hover:border-skyblue/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/35"
					>
						<Upload className="h-4 w-4" aria-hidden="true" />
						Import
					</button>
					<button
						type="button"
						className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-darknavy/15 bg-white px-4 text-sm font-semibold text-darknavy shadow-sm transition hover:border-skyblue/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/35"
					>
						<Download className="h-4 w-4" aria-hidden="true" />
						Export
					</button>
					<Link
						href={`${TermManagementHref}/add`}
						className="inline-flex h-10 w-fit items-center justify-center gap-2 rounded-md bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/35"
					>
						<Plus className="h-4 w-4" aria-hidden="true" />
						Add Term
					</Link>
				</div>
			</div>

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
							<tr>
								<td colSpan={4} className="px-4 py-6 text-center text-sm text-darknavy/60">
									Loading term definitions...
								</td>
							</tr>
						) : terms.length === 0 ? (
							<tr>
								<td colSpan={4} className="px-4 py-6 text-center text-sm text-darknavy/60">
									No term records found.
								</td>
							</tr>
						) : (
							terms.map((term) => (
								                <tr key={term.id}>
            <td className="px-4 py-4">{term.description}</td>
            <td className="px-4 py-4">{term.datemode}</td>
            <td className="px-4 py-4">{term.period}</td>
            <td className="px-4 py-4">
                <div className="flex flex-wrap items-center gap-2">
                    <Link
                        href={`${TermManagementHref}/view/${term.id}`}
                        aria-label={`View ${term.description}`}
                        className="inline-flex h-9 w-9 items-center justify-center  text-darknavy transition hover:border-skyblue/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/35"
                    >
                        <Eye className="h-4 w-4" aria-hidden="true" />
                    </Link>
                    <Link
                        href={`${TermManagementHref}/edit/${term.id}`}
                        aria-label={`Edit ${term.description}`}
                        className="inline-flex h-9 w-9 items-center justify-center  text-darknavy transition hover:border-skyblue/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/35"
                    >
                        <Edit3 className="h-4 w-4" aria-hidden="true" />
                    </Link>
                    <button
                        type="button"
                        onClick={() => handleDeleteTerm(term)}
                        aria-label={`Delete ${term.description}`}
                        className="flex h-9 w-9 items-center justify-center rounded-md text-coralpink transition hover:bg-coralpink/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coralpink/30"
                    >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </button>
                </div>
            </td>
        </tr>
							))
						)}
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
