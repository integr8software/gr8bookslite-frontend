"use client";

import Link from "next/link";
import {
	Ban,
	CheckCircle2,
	ClipboardList,
	Copy,
	Edit3,
	Printer,
	Save,
	ThumbsDown,
	Undo2,
	X,
} from "lucide-react";
import {
	MaterialRequestActionPageCopy,
	MaterialRequestHref,
} from "@/app/src/constants/modules/inventory/material-request/MaterialRequestConstants";
import { useMaterialRequestFormPage } from "@/app/src/hooks/modules/inventory/material-request/useMaterialRequestFormPage";
import {
	ModuleHeader,
	moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";
import {
	ModuleActionMenu,
	type ModuleActionMenuItem,
} from "@/app/src/ui/shared/module/ModuleActionMenu";
import { MaterialRequestDetailsPanel } from "@/app/src/ui/modules/inventory/material-request/MaterialRequestDetailsPanel";
import { MaterialRequestItemsTable } from "@/app/src/ui/modules/inventory/material-request/MaterialRequestItemsTable";
import { MaterialRequestNotFound } from "@/app/src/ui/modules/inventory/material-request/MaterialRequestNotFound";
import { MaterialRequestStatusBadge } from "@/app/src/ui/modules/inventory/material-request/MaterialRequestStatusBadge";

export function MaterialRequestActionPage() {
	const page = useMaterialRequestFormPage();
	const copy = MaterialRequestActionPageCopy[page.mode];

	if (page.needsRecord && !page.existingRequest) {
		return <MaterialRequestNotFound />;
	}

	return (
		<section className="grid gap-5">
			<ModuleHeader
				variant="panel"
				titleAs="h1"
				title={
					page.mode === "add"
						? copy.title
						: `${copy.title} ${page.existingRequest?.requestNo ?? ""}`
				}
				description={copy.description}
				eyebrow={
					<>
						<ClipboardList className="h-3.5 w-3.5" aria-hidden="true" />
						Inventory request
					</>
				}
				actions={<MaterialRequestHeaderActions page={page} />}
			/>

			{page.mode === "view" ? (
				<div className="rounded-lg border border-darknavy/10 bg-white p-5 shadow-sm shadow-darknavy/5">
					<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
						<ReadOnlyStat label="MR No." value={page.values.requestNo} />
						<ReadOnlyStat label="Warehouse" value={page.values.fromWarehouse} />
						<ReadOnlyStat label="Reference No." value={page.values.referenceNo || "-"} />
						<ReadOnlyStat label="Module" value={page.values.referenceModule || "-"} />
						<div>
							<p className="text-xs font-semibold uppercase text-darknavy/55">
								Status
							</p>
							<div className="mt-2">
								<MaterialRequestStatusBadge status={page.values.status} />
							</div>
						</div>
					</div>
				</div>
			) : null}

			<MaterialRequestDetailsPanel
				errors={page.errors}
				isReadonly={page.isReadonly}
				updateField={page.updateField}
				values={page.values}
			/>

			<MaterialRequestItemsTable
				error={page.errors.items}
				isReadonly={page.isReadonly}
				items={page.values.items}
				onAddItems={page.addItems}
				onClearItems={page.clearItems}
				onDuplicateItem={page.duplicateItem}
				onInsertItem={page.insertItem}
				onMoveItem={page.moveItem}
				onRemoveItem={page.removeItem}
				onUpdateItem={page.updateItem}
			/>
		</section>
	);
}

type MaterialRequestActionPageState = ReturnType<typeof useMaterialRequestFormPage>;

function MaterialRequestHeaderActions({
	page,
}: {
	page: MaterialRequestActionPageState;
}) {
	if (page.mode === "view") {
		return <MaterialRequestViewActions page={page} />;
	}

	return (
		<>
			<Link
				href={page.backHref}
				className={moduleHeaderActionClassNames.secondary}
			>
				<X className="h-4 w-4" aria-hidden="true" />
				Cancel
			</Link>
			<button
				type="button"
				onClick={page.handleCopyFrom}
				className={moduleHeaderActionClassNames.secondary}
			>
				<Copy className="h-4 w-4" aria-hidden="true" />
				Copy From
			</button>
			<button
				type="button"
				onClick={page.handleSubmit}
				className={moduleHeaderActionClassNames.primary}
			>
				<Save className="h-4 w-4" aria-hidden="true" />
				Save
			</button>
		</>
	);
}

function MaterialRequestViewActions({
	page,
}: {
	page: MaterialRequestActionPageState;
}) {
	const actions = createViewActionItems(page);

	return (
		<>
			<div className="flex lg:hidden">
				<ModuleActionMenu
					items={actions}
					label="Material request actions"
				/>
			</div>
			<div className="hidden flex-wrap gap-2 lg:flex">
				{actions.map((action) => {
					if (action.type === "button") {
						return <HeaderActionButton key={action.label} action={action} />;
					}

					const Icon = action.icon;

					return (
						<Link
							key={action.label}
							href={action.href}
							className={moduleHeaderActionClassNames.secondary}
						>
							<Icon className="h-4 w-4" aria-hidden="true" />
							{action.label}
						</Link>
					);
				})}
			</div>
		</>
	);
}

function createViewActionItems(
	page: MaterialRequestActionPageState,
): ModuleActionMenuItem[] {
	const isCancelled = page.values.status === "Cancelled";
	const cancelStatus = isCancelled
		? page.values.requiresApproval
			? "Draft"
			: "Active"
		: "Cancelled";
	const canApprove =
		page.values.requiresApproval &&
		!isCancelled &&
		page.values.status !== "Approved";
	const canDisapprove =
		page.values.requiresApproval &&
		!isCancelled &&
		page.values.status !== "Rejected";

	return [
		{
			href: `${MaterialRequestHref}/edit/${page.existingRequest?.id ?? ""}?from=view`,
			icon: Edit3,
			label: "Edit",
			type: "link",
		},
		{
			disabled: !canApprove,
			icon: CheckCircle2,
			label: "Approve",
			onSelect: () => page.updateRequestStatus("Approved"),
			type: "button",
		},
		{
			disabled: !canDisapprove,
			icon: ThumbsDown,
			label: "Disapprove",
			onSelect: () => page.updateRequestStatus("Rejected"),
			tone: "danger",
			type: "button",
		},
		{
			icon: isCancelled ? Undo2 : Ban,
			label: isCancelled ? "Uncancel" : "Cancel",
			onSelect: () => page.updateRequestStatus(cancelStatus),
			tone: isCancelled ? "default" : "danger",
			type: "button",
		},
		{
			icon: Printer,
			label: "Print Preview",
			onSelect: () => window.print(),
			type: "button",
		},
	];
}

function HeaderActionButton({
	action,
}: {
	action: Extract<ModuleActionMenuItem, { type: "button" }>;
}) {
	const Icon = action.icon;
	const className =
		action.tone === "danger"
			? moduleHeaderActionClassNames.danger
			: moduleHeaderActionClassNames.secondary;

	return (
		<button
			type="button"
			disabled={action.disabled}
			onClick={action.onSelect}
			className={`${className} disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:bg-white`}
		>
			<Icon className="h-4 w-4" aria-hidden="true" />
			{action.label}
		</button>
	);
}

function ReadOnlyStat({ label, value }: { label: string; value: string }) {
	return (
		<div>
			<p className="text-xs font-semibold uppercase text-darknavy/55">
				{label}
			</p>
			<p className="mt-2 text-sm font-semibold text-darknavy">{value}</p>
		</div>
	);
}
