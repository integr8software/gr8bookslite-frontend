"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useState } from "react";
import {
	Ban,
	CheckCircle2,
	ClipboardList,
	Edit3,
	History,
	Printer,
	Save,
	ThumbsDown,
	Undo2,
	X,
} from "lucide-react";
import {
	MaterialRequestActionPageCopy,
	MaterialRequestHref,
	canApproveMaterialRequestStatus,
	canCancelMaterialRequestStatus,
	canDisapproveMaterialRequestStatus,
	canEditMaterialRequestStatus,
} from "@/app/src/constants/modules/inventory/material-request/MaterialRequestConstants";
import {
	getMaterialRequestUncancelStatus,
	getMaterialRequestUndoApprovalStatus,
} from "@/app/src/data/modules/inventory/material-request/MaterialRequestData";
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

const ModuleHistoryDialog = dynamic(
	() =>
		import("@/app/src/ui/shared/module/ModuleHistoryDialog").then(
			(module) => module.ModuleHistoryDialog,
		),
	{ ssr: false },
);

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
			actionsClassName="items-center gap-1"
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
			? `View Material Request | ${requestNo}`
			: "View Material Request";
	}

	if (page.isReadonly) {
		return requestNo
			? `View Material Request | ${requestNo}`
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
	if (page.mode === "view" || page.isReadonly) {
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
	const [isHistoryOpen, setIsHistoryOpen] = useState(false);
	const actions = createViewActionItems({
		onOpenHistory: () => setIsHistoryOpen(true),
		page,
	});

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
			{isHistoryOpen ? (
				<ModuleHistoryDialog
					description="Status changes and major material request events."
					history={page.existingRequest?.history ?? []}
					isOpen
					onClose={() => setIsHistoryOpen(false)}
				/>
			) : null}
		</>
	);
}

function createViewActionItems({
	onOpenHistory,
	page,
}: {
	onOpenHistory: () => void;
	page: MaterialRequestActionPageState;
}): ModuleActionMenuItem[] {
	const isApproved = page.values.status === "Approved";
	const isDisapproved = page.values.status === "Disapproved";
	const isCancelled = page.values.status === "Cancelled";
	const approvalUndoStatus = page.existingRequest
		? getMaterialRequestUndoApprovalStatus(page.existingRequest)
		: page.values.requiresApproval
			? "Pending"
			: "Active";
	const cancelStatus = isCancelled
		? page.existingRequest
			? getMaterialRequestUncancelStatus(page.existingRequest)
			: "Draft"
		: "Cancelled";
	const canApprove = canApproveMaterialRequestStatus(page.values.status);
	const canDisapprove = canDisapproveMaterialRequestStatus(page.values.status);

	return [
		...(canEditMaterialRequestStatus(page.values.status)
			? [
				{
					href: `${MaterialRequestHref}/edit/${page.existingRequest?.id ?? ""}?from=view`,
					icon: Edit3,
					label: "Edit",
					type: "link",
				} satisfies ModuleActionMenuItem,
			]
			: []),
		{
			disabled: !canApprove,
			icon: isApproved ? Undo2 : CheckCircle2,
			label: isApproved ? "Undo Approved" : "Approve",
			onSelect: () =>
				page.updateRequestStatus(
					isApproved ? approvalUndoStatus : "Approved",
				),
			type: "button",
		},
		{
			disabled: !canDisapprove,
			icon: isDisapproved ? Undo2 : ThumbsDown,
			label: isDisapproved ? "Undo Disapproved" : "Disapprove",
			onSelect: () =>
				page.updateRequestStatus(
					isDisapproved ? approvalUndoStatus : "Disapproved",
				),
			tone: isDisapproved ? "default" : "danger",
			type: "button",
		},
		{
			disabled: !canCancelMaterialRequestStatus(page.values.status),
			icon: isCancelled ? Undo2 : Ban,
			label: isCancelled ? "Uncancelled" : "Cancel",
			onSelect: () => page.updateRequestStatus(cancelStatus),
			tone: isCancelled ? "default" : "danger",
			type: "button",
		},
		{
			icon: History,
			label: "History",
			onSelect: onOpenHistory,
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
		action.label === "Undo Approved" ||
		action.label === "Undo Disapproved" ||
		action.label === "Uncancelled"
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
