"use client";

import {
	Ban,
	CheckCircle2,
	Clock3,
	PackageCheck,
	X,
	XCircle,
} from "lucide-react";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";

export type ModuleHistoryEntry<TStatus extends string = string> = {
	id: string;
	action: string;
	actor: string;
	createdAt: string;
	description: string;
	status: TStatus;
};

type ModuleHistoryDialogProps<TStatus extends string = string> = {
	description: string;
	history: ModuleHistoryEntry<TStatus>[];
	isOpen: boolean;
	onClose: () => void;
	title?: string;
};

export function ModuleHistoryDialog<TStatus extends string = string>({
	description,
	history,
	isOpen,
	onClose,
	title = "History",
}: ModuleHistoryDialogProps<TStatus>) {
	if (!isOpen) {
		return null;
	}

	const orderedHistory = [...history].sort(
		(first, second) =>
			new Date(second.createdAt).getTime() -
			new Date(first.createdAt).getTime(),
	);
	const titleId = "module-history-dialog-title";

	return (
		<div
			role="presentation"
			className="fixed inset-0 z-[140] flex items-center justify-center bg-slate-950/35 px-4 py-6 backdrop-blur-sm"
			onMouseDown={(event) => {
				if (event.target === event.currentTarget) {
					onClose();
				}
			}}
		>
			<section
				role="dialog"
				aria-modal="true"
				aria-labelledby={titleId}
				className="flex max-h-[calc(100dvh-2rem)] w-full max-w-3xl flex-col overflow-hidden rounded-lg border border-white/20 bg-white shadow-[0_28px_90px_rgba(33,39,56,0.28)]"
			>
				<div className="flex items-start justify-between gap-4 border-b border-darknavy/10 px-5 py-4">
					<div className="min-w-0">
						<h2 id={titleId} className="text-lg font-semibold text-darknavy">
							{title}
						</h2>
						<p className="mt-1 text-sm text-darknavy/55">{description}</p>
					</div>
					<button
						type="button"
						onClick={onClose}
						className="inline-flex h-9 w-9 items-center justify-center rounded-md text-darknavy/60 transition hover:bg-skyblue/10 hover:text-darknavy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/25"
						aria-label="Close history dialog"
					>
						<X className="h-5 w-5" aria-hidden="true" />
					</button>
				</div>
				<div className="min-h-0 overflow-y-auto px-5 py-4">
					<div className="mb-3 text-xs font-semibold uppercase text-darknavy/45">
						{orderedHistory.length}{" "}
						{orderedHistory.length === 1 ? "entry" : "entries"}
					</div>
					<div className="divide-y divide-darknavy/8 overflow-hidden rounded-lg border border-darknavy/10">
						{orderedHistory.length > 0 ? (
							orderedHistory.map((entry) => (
								<div
									key={entry.id}
									className="grid gap-3 bg-white px-4 py-3 sm:grid-cols-[minmax(10rem,0.8fr)_minmax(0,1fr)_auto] sm:items-center"
								>
									<div>
										<p className="text-sm font-semibold text-darknavy">
											{entry.action}
										</p>
										<p className="text-xs font-medium text-darknavy/55">
											{formatHistoryDateTime(entry.createdAt)}
										</p>
									</div>
									<div>
										<p className="text-sm text-darknavy/75">
											{entry.description}
										</p>
										<p className="mt-1 text-xs font-medium text-darknavy/45">
											By {entry.actor}
										</p>
									</div>
									<ModuleHistoryStatusBadge status={entry.status} />
								</div>
							))
						) : (
							<div className="bg-white px-4 py-6 text-center text-sm text-darknavy/55">
								No history entries yet.
							</div>
						)}
					</div>
				</div>
			</section>
		</div>
	);
}

function formatHistoryDateTime(value: string) {
	if (!value) {
		return "-";
	}

	const date = new Date(value);

	if (Number.isNaN(date.getTime())) {
		return value;
	}

	return new Intl.DateTimeFormat("en-US", {
		day: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
		month: "short",
		year: "numeric",
	}).format(date);
}

function ModuleHistoryStatusBadge({ status }: { status: string }) {
	const Icon = statusIconByStatus[status] ?? Clock3;

	return (
		<span
			className={joinClasses(
				"inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold",
				statusClassNameByStatus[status] ?? "bg-offwhite text-darknavy/70",
			)}
		>
			<Icon className="h-3.5 w-3.5" aria-hidden="true" />
			{status}
		</span>
	);
}

const statusIconByStatus: Record<string, typeof CheckCircle2> = {
	Active: CheckCircle2,
	Approved: CheckCircle2,
	Cancelled: Ban,
	Closed: PackageCheck,
	Disapproved: XCircle,
	Draft: Clock3,
	Pending: Clock3,
};

const statusClassNameByStatus: Record<string, string> = {
	Active: "bg-citron/25 text-darknavy",
	Approved: "bg-citron/25 text-darknavy",
	Cancelled: "bg-darknavy/10 text-darknavy/70",
	Closed: "bg-skyblue/20 text-darknavy",
	Disapproved: "bg-coralpink/15 text-coralpink",
	Draft: "bg-offwhite text-darknavy/70",
	Pending: "bg-offwhite text-darknavy",
};
