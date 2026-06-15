"use client";

import Link from "next/link";
import {
	Ban,
	CheckCircle2,
	ClipboardList,
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
import { getMaterialRequestUncancelStatus } from "@/app/src/data/modules/inventory/material-request/MaterialRequestData";
import type { useMaterialRequestFormPage } from "@/app/src/hooks/modules/inventory/material-request/useMaterialRequestFormPage";
import {
	ModuleHeader,
	moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";
import {
	ModuleActionMenu,
	type ModuleActionMenuItem,
} from "@/app/src/ui/shared/module/ModuleActionMenu";

type MaterialRequestActionPageState = ReturnType<typeof useMaterialRequestFormPage>;

export function MaterialRequestActionHeader({
	page,
}: {
	page: MaterialRequestActionPageState;
}) {
	const copy = MaterialRequestActionPageCopy[page.mode];

	return (
		<ModuleHeader
			variant="panel"
			titleAs="h1"
			title={getMaterialRequestHeaderTitle(page)}
			description={copy.description}
			eyebrow={
				<>
					<ClipboardList className="h-3.5 w-3.5" aria-hidden="true" />
					Inventory request
				</>
			}
			actions={<MaterialRequestHeaderActions page={page} />}
		/>
	);
}

function getMaterialRequestHeaderTitle(page: MaterialRequestActionPageState) {
	if (page.mode === "add") {
		return "New Material Request";
	}

	const requestNo = page.values.requestNo || page.existingRequest?.requestNo;

	if (page.mode === "view") {
		return requestNo
			? `View Material Request - ${requestNo}`
			: "View Material Request";
	}

	return requestNo
		? `Edit Material Request - ${requestNo}`
		: "Edit Material Request";
}

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
	const isApproved = page.values.status === "Approved";
	const isDisapproved = page.values.status === "Disapproved";
	const cancelStatus = isCancelled
		? page.existingRequest
			? getMaterialRequestUncancelStatus(page.existingRequest)
			: page.values.requiresApproval
				? "Draft"
				: "Active"
		: "Cancelled";
	const approvalRevertStatus = page.values.requiresApproval
		? "Pending"
		: "Active";
	const canApprove =
		page.values.requiresApproval &&
		!isCancelled &&
		!isDisapproved;
	const canDisapprove =
		page.values.requiresApproval &&
		!isCancelled &&
		!isApproved;

	return [
		{
			href: `${MaterialRequestHref}/edit/${page.existingRequest?.id ?? ""}?from=view`,
			icon: Edit3,
			label: "Edit",
			type: "link",
		},
		{
			disabled: !canApprove,
			icon: isApproved ? Undo2 : CheckCircle2,
			label: isApproved ? "Unapprove" : "Approve",
			onSelect: () =>
				page.updateRequestStatus(
					isApproved ? approvalRevertStatus : "Approved",
				),
			type: "button",
		},
		{
			disabled: !canDisapprove,
			icon: isDisapproved ? Undo2 : ThumbsDown,
			label: isDisapproved ? "Undo Disapprove" : "Disapprove",
			onSelect: () =>
				page.updateRequestStatus(
					isDisapproved ? approvalRevertStatus : "Disapproved",
				),
			tone: isDisapproved ? "default" : "danger",
			type: "button",
		},
		{
			disabled: isApproved || isDisapproved,
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
	const className = getViewActionButtonClassName(action);

	return (
		<button
			type="button"
			disabled={action.disabled}
			onClick={action.onSelect}
			className={className}
		>
			<Icon className="h-4 w-4" aria-hidden="true" />
			{action.label}
		</button>
	);
}

function getViewActionButtonClassName(
	action: Extract<ModuleActionMenuItem, { type: "button" }>,
) {
	const baseClassName =
		"inline-flex h-10 items-center justify-center gap-2 rounded-md border px-4 text-sm font-semibold shadow-sm shadow-darknavy/5 transition focus-visible:outline-none focus-visible:ring-4 disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:bg-white";

	if (action.label === "Approve") {
		return `${baseClassName} border-citron/60 bg-citron/20 text-darknavy hover:bg-citron/30 focus-visible:ring-citron/25`;
	}

	if (
		action.label === "Unapprove" ||
		action.label === "Undo Disapprove" ||
		action.label === "Uncancel"
	) {
		return `${baseClassName} border-skyblue/35 bg-skyblue/10 text-skyblue hover:bg-skyblue/15 focus-visible:ring-skyblue/20`;
	}

	if (action.label === "Cancel") {
		return `${baseClassName} border-darknavy/12 bg-white text-darknavy/70 hover:bg-darknavy/5 hover:text-darknavy focus-visible:ring-darknavy/10`;
	}

	if (action.tone === "danger") {
		return `${baseClassName} border-coralpink/45 bg-coralpink/5 text-coralpink hover:bg-coralpink/10 focus-visible:ring-coralpink/20`;
	}

	return moduleHeaderActionClassNames.secondary;
}
