"use client";

import type { CSSProperties } from "react";
import { Copy, Eraser, Plus, Trash2, type LucideIcon } from "lucide-react";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";

export function ModuleDataEntryRowActions({
	canRemove = true,
	rowLabel,
	style,
	onAddAbove,
	onAddBelow,
	onClear,
	onDuplicate,
	onRemove,
}: {
	canRemove?: boolean;
	rowLabel: string;
	style: CSSProperties;
	onAddAbove: () => void;
	onAddBelow: () => void;
	onClear?: () => void;
	onDuplicate: () => void;
	onRemove: () => void;
}) {
	return (
		<div
			data-row-action-menu
			style={style}
			className="fixed z-130 grid w-44 gap-1 rounded-lg border border-darknavy/10 bg-white p-1.5 text-left shadow-[0_18px_46px_rgba(33,39,56,0.18)]"
		>
			<ModuleDataEntryRowActionButton
				icon={Plus}
				label="Add Above"
				onClick={onAddAbove}
			/>
			<ModuleDataEntryRowActionButton
				icon={Plus}
				label="Add Below"
				onClick={onAddBelow}
			/>
			<ModuleDataEntryRowActionButton
				icon={Copy}
				label="Duplicate Item"
				onClick={onDuplicate}
			/>
			{onClear ? (
				<ModuleDataEntryRowActionButton
					icon={Eraser}
					label="Clear Item"
					onClick={onClear}
					ariaLabel={`Clear ${rowLabel} values`}
				/>
			) : null}
			<ModuleDataEntryRowActionButton
				disabled={!canRemove}
				icon={Trash2}
				label="Remove Item"
				tone="danger"
				onClick={onRemove}
				ariaLabel={`Remove ${rowLabel}`}
			/>
		</div>
	);
}

function ModuleDataEntryRowActionButton({
	ariaLabel,
	disabled = false,
	icon: Icon,
	label,
	tone = "default",
	onClick,
}: {
	ariaLabel?: string;
	disabled?: boolean;
	icon: LucideIcon;
	label: string;
	tone?: "danger" | "default";
	onClick: () => void;
}) {
	return (
		<button
			type="button"
			disabled={disabled}
			onClick={onClick}
			aria-label={ariaLabel}
			className={joinClasses(
				"flex min-h-10 w-full items-center gap-3 rounded-md px-3 text-left text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/20 disabled:cursor-not-allowed disabled:opacity-45",
				tone === "danger"
					? "text-coralpink hover:bg-coralpink/10"
					: "text-darknavy/72 hover:bg-skyblue/10 hover:text-darknavy",
			)}
		>
			<Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
			{label}
		</button>
	);
}
