"use client";

import Link from "next/link";
import {
	ClipboardList,
	Edit3,
	Save,
	X,
} from "lucide-react";
import {
	MaterialRequestActionPageCopy,
	MaterialRequestHref,
	canEditMaterialRequestStatus,
} from "@/app/src/constants/modules/inventory/material-request/MaterialRequestConstants";
import type { useMaterialRequestFormPage } from "@/app/src/hooks/modules/inventory/material-request/useMaterialRequestFormPage";
import {
	ModuleHeader,
	moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";
import {
	ModuleActionMenu,
	type ModuleActionMenuItem,
} from "@/app/src/ui/shared/module/ModuleActionMenu";
import { ReportPreviewAction } from "@/app/src/ui/shared/reports/Reports";
import { AppCopyFromDropdown } from "@/app/src/ui/shared/transaction-setup/AppCopyFromDropdown";

type MaterialRequestActionPageState = ReturnType<typeof useMaterialRequestFormPage>;

export function MaterialRequestActionHeader({
	onPreview,
	page,
}: {
	onPreview: () => void;
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
			actions={<MaterialRequestHeaderActions page={page} onPreview={onPreview} />}
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

	return "Edit Material Request";
}

function MaterialRequestHeaderActions({
	onPreview,
	page,
}: {
	onPreview: () => void;
	page: MaterialRequestActionPageState;
}) {
	if (page.mode === "view" || page.isReadonly) {
		return <MaterialRequestViewActions page={page} onPreview={onPreview} />;
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
			<ReportPreviewAction onPreview={onPreview} />
			<AppCopyFromDropdown
				records={page.copyFromRecords}
				sources={["Sales Order", "Job Order"]}
				onApply={page.copyFromSourceTransactions}
			/>
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
	onPreview,
	page,
}: {
	onPreview: () => void;
	page: MaterialRequestActionPageState;
}) {
	const actions = createViewActionItems({
		onPreview,
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
						const Icon = action.icon;

						return (
							<button
								key={action.label}
								type="button"
								disabled={action.disabled}
								onClick={action.onSelect}
								className={moduleHeaderActionClassNames.secondary}
							>
								<Icon className="h-4 w-4" aria-hidden="true" />
								{action.label}
							</button>
						);
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

function createViewActionItems({
	onPreview,
	page,
}: {
	onPreview: () => void;
	page: MaterialRequestActionPageState;
}): ModuleActionMenuItem[] {
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
			icon: ClipboardList,
			label: "Preview",
			onSelect: onPreview,
			type: "button",
		},
	];
}
