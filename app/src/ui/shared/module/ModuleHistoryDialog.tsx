"use client";

import {
	Ban,
	CalendarClock,
	CheckCircle2,
	Clock3,
	History,
	PackageCheck,
	UserRound,
	XCircle,
} from "lucide-react";
import { ModuleResizableDialog } from "@/app/src/ui/shared/module/ModuleResizableDialog";
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
	const latestEntry = orderedHistory[0] ?? null;
	const titleId = "module-history-dialog-title";

	return (
		<ModuleResizableDialog
			closeLabel="Close history dialog"
			description={description}
			isOpen={isOpen}
			normalClassName="h-[min(44rem,calc(100dvh-2rem))] max-w-4xl"
			title={title}
			titleId={titleId}
			bodyClassName="flex flex-col overflow-hidden p-0"
			onClose={onClose}
		>
			<div className="grid grid-cols-1 gap-3 border-b border-darknavy/10 bg-offwhite/45 px-5 py-3 sm:grid-cols-2">
				<div className="rounded-lg border border-darknavy/10 bg-white px-3 py-2">
					<p className="text-xs font-semibold uppercase text-darknavy/45">
						Total Events
					</p>
					<p className="mt-1 text-lg font-semibold text-darknavy">
						{orderedHistory.length}
					</p>
				</div>
				<div className="rounded-lg border border-darknavy/10 bg-white px-3 py-2">
					<p className="text-xs font-semibold uppercase text-darknavy/45">
						Latest Update
					</p>
					<p className="mt-1 truncate text-sm font-semibold text-darknavy">
						{latestEntry ? formatHistoryDateTime(latestEntry.createdAt) : "-"}
					</p>
				</div>
			</div>
			<div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
				{orderedHistory.length > 0 ? (
					<div className="relative grid gap-3">
						<span
							className="absolute bottom-4 left-[1.125rem] top-4 w-px bg-darknavy/10"
							aria-hidden="true"
						/>
						{orderedHistory.map((entry) => (
							<article
								key={entry.id}
								className="relative grid gap-3 rounded-lg border border-darknavy/10 bg-white p-4 shadow-sm shadow-darknavy/5 sm:grid-cols-[minmax(10rem,0.8fr)_minmax(0,1fr)_auto] sm:items-start"
							>
								<div className="flex min-w-0 gap-3">
									<span className="relative z-10 mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white bg-skyblue/10 text-skyblue shadow-sm">
										<CalendarClock className="h-4 w-4" aria-hidden="true" />
									</span>
									<div className="min-w-0">
										<p className="text-sm font-semibold text-darknavy">
											{entry.action}
										</p>
										<p className="text-xs font-medium text-darknavy/55">
											{formatHistoryDateTime(entry.createdAt)}
										</p>
									</div>
								</div>
								<div className="min-w-0">
									<p className="text-sm text-darknavy/75">
										{entry.description}
									</p>
									<p className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-darknavy/45">
										<UserRound className="h-3.5 w-3.5" aria-hidden="true" />
										{entry.actor}
									</p>
								</div>
								<ModuleHistoryStatusBadge status={entry.status} />
							</article>
						))}
					</div>
				) : (
					<div className="grid min-h-52 place-items-center rounded-lg border border-dashed border-darknavy/15 bg-offwhite/35 px-6 py-10 text-center">
						<div>
							<span className="mx-auto inline-flex h-11 w-11 items-center justify-center rounded-lg bg-skyblue/10 text-skyblue">
								<History className="h-5 w-5" aria-hidden="true" />
							</span>
							<p className="mt-3 text-sm font-semibold text-darknavy">
								No history entries yet
							</p>
							<p className="mt-1 text-xs text-darknavy/50">
								Status changes and system events will appear here.
							</p>
						</div>
					</div>
				)}
			</div>
		</ModuleResizableDialog>
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
	"For Approval": Clock3,
	Pending: Clock3,
	Posted: CheckCircle2,
};

const statusClassNameByStatus: Record<string, string> = {
	Active: "bg-citron/25 text-darknavy",
	Approved: "bg-citron/25 text-darknavy",
	Cancelled: "bg-darknavy/10 text-darknavy/70",
	Closed: "bg-skyblue/20 text-darknavy",
	Disapproved: "bg-coralpink/15 text-coralpink",
	Draft: "bg-offwhite text-darknavy/70",
	"For Approval": "bg-citron/25 text-darknavy",
	Pending: "bg-offwhite text-darknavy",
	Posted: "bg-citron/25 text-darknavy",
};
