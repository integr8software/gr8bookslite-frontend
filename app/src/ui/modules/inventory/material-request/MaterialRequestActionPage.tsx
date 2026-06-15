"use client";

import { formatMaterialRequestDate } from "@/app/src/data/modules/inventory/material-request/MaterialRequestData";
import { useMaterialRequestFormPage } from "@/app/src/hooks/modules/inventory/material-request/useMaterialRequestFormPage";
import type { MaterialRequestHistoryEntry } from "@/app/src/types/modules/inventory/material-request/MaterialRequestTypes";
import { MaterialRequestActionHeader } from "@/app/src/ui/modules/inventory/material-request/MaterialRequestActionHeader";
import { MaterialRequestDataEntry } from "@/app/src/ui/modules/inventory/material-request/MaterialRequestDataEntry";
import { MaterialRequestDetailsPanel } from "@/app/src/ui/modules/inventory/material-request/MaterialRequestDetailsPanel";
import { MaterialRequestNotFound } from "@/app/src/ui/modules/inventory/material-request/MaterialRequestNotFound";
import { MaterialRequestStatusBadge } from "@/app/src/ui/modules/inventory/material-request/MaterialRequestStatusBadge";

export function MaterialRequestActionPage() {
	const page = useMaterialRequestFormPage();

	if (page.needsRecord && !page.existingRequest) {
		return <MaterialRequestNotFound />;
	}

	return (
		<section className="grid gap-5">
			<MaterialRequestActionHeader page={page} />

			<MaterialRequestDetailsPanel
				errors={page.errors}
				isReadonly={page.isReadonly}
				updateField={page.updateField}
				values={page.values}
			/>

			<MaterialRequestDataEntry page={page} />

			{page.mode === "view" ? (
				<MaterialRequestHistoryPanel
					history={page.existingRequest?.history ?? []}
				/>
			) : null}
		</section>
	);
}

function MaterialRequestHistoryPanel({
	history,
}: {
	history: MaterialRequestHistoryEntry[];
}) {
	const orderedHistory = [...history].sort(
		(first, second) =>
			new Date(second.createdAt).getTime() -
			new Date(first.createdAt).getTime(),
	);

	return (
		<section className="rounded-lg border border-darknavy/10 bg-white p-5 shadow-sm shadow-darknavy/5">
			<div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h2 className="text-base font-semibold text-darknavy">
						History
					</h2>
					<p className="text-sm text-darknavy/60">
						Status changes and major material request events.
					</p>
				</div>
				<p className="text-xs font-semibold uppercase text-darknavy/45">
					{orderedHistory.length}{" "}
					{orderedHistory.length === 1 ? "entry" : "entries"}
				</p>
			</div>

			<div className="mt-4 divide-y divide-darknavy/8 overflow-hidden rounded-lg border border-darknavy/10">
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
							<MaterialRequestStatusBadge status={entry.status} />
						</div>
					))
				) : (
					<div className="bg-white px-4 py-6 text-center text-sm text-darknavy/55">
						No history entries yet.
					</div>
				)}
			</div>
		</section>
	);
}

function formatHistoryDateTime(value: string) {
	if (!value) {
		return "-";
	}

	const date = new Date(value);

	if (Number.isNaN(date.getTime())) {
		return formatMaterialRequestDate(value);
	}

	return new Intl.DateTimeFormat("en-US", {
		day: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
		month: "short",
		year: "numeric",
	}).format(date);
}
