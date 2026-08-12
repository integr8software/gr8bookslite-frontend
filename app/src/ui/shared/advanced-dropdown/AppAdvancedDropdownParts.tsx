"use client";

import Link from "next/link";
import { Check, ExternalLink, LayoutGrid, List, X } from "lucide-react";
import {
	AppAdvancedDropdownOptionViewGrid,
	AppAdvancedDropdownOptionViewList,
} from "@/app/src/constants/shared/advanced-dropdown/AppAdvancedDropdownConstants";
import type {
	AppAdvancedDropdownOption,
	AppAdvancedDropdownOptionView,
} from "@/app/src/types/shared/advanced-dropdown/AppAdvancedDropdownTypes";
import { ModuleTooltip } from "@/app/src/ui/shared/module/ModuleTooltip";
import {
	getOptionClassName,
	getOptionIndentStyle,
	joinClasses,
} from "@/app/src/ui/shared/advanced-dropdown/AppAdvancedDropdownUtils";

export function ViewToggle({
	value,
	onChange,
}: {
	value: AppAdvancedDropdownOptionView;
	onChange: (value: AppAdvancedDropdownOptionView) => void;
}) {
	return (
		<div className="flex h-10 shrink-0 overflow-hidden rounded-md border border-darknavy/10 bg-white">
			<button
				type="button"
				aria-label="List view"
				aria-pressed={value === AppAdvancedDropdownOptionViewList}
				onClick={() => onChange(AppAdvancedDropdownOptionViewList)}
				className={joinClasses(
					"flex h-full w-10 items-center justify-center text-darknavy/55 transition hover:bg-skyblue/10 hover:text-darknavy",
					value === AppAdvancedDropdownOptionViewList && "bg-skyblue/15 text-skyblue",
				)}
			>
				<List className="h-4 w-4" aria-hidden="true" />
			</button>
			<button
				type="button"
				aria-label="Grid view"
				aria-pressed={value === AppAdvancedDropdownOptionViewGrid}
				onClick={() => onChange(AppAdvancedDropdownOptionViewGrid)}
				className={joinClasses(
					"flex h-full w-10 items-center justify-center border-l border-darknavy/10 text-darknavy/55 transition hover:bg-skyblue/10 hover:text-darknavy",
					value === AppAdvancedDropdownOptionViewGrid && "bg-skyblue/15 text-skyblue",
				)}
			>
				<LayoutGrid className="h-4 w-4" aria-hidden="true" />
			</button>
		</div>
	);
}

export function OptionRow({
	activeValue,
	getOptionId,
	level,
	option,
	view,
	selectedValues,
	showSelectionIndicator,
	onActive,
	onSelect,
}: {
	activeValue: string;
	getOptionId: (option: AppAdvancedDropdownOption) => string | undefined;
	level: number;
	option: AppAdvancedDropdownOption;
	view: AppAdvancedDropdownOptionView;
	selectedValues: Set<string>;
	showSelectionIndicator: boolean;
	onActive: (value: string) => void;
	onSelect: (option: AppAdvancedDropdownOption) => void;
}) {
	const isSelected = selectedValues.has(option.value);
	const isActive = activeValue === option.value;
	const hasChildren = Boolean(option.children?.length);
	const optionId = getOptionId(option);
	const optionClassName = getOptionClassName({
		hasChildren,
		isActive,
		isDisabled: option.disabled,
		isSelected,
		level,
		view,
	});
	const content = (
		<>
			{showSelectionIndicator ? (
				<span className="flex h-5 w-5 shrink-0 items-center justify-center" aria-hidden="true">
					{isSelected ? <Check className="h-4 w-4 text-skyblue" aria-hidden="true" /> : null}
				</span>
			) : null}
			<span className="grid min-w-0 flex-1 gap-0.5">
				<span className="truncate text-sm font-semibold">{option.name}</span>
				{option.label ? (
					<span className="truncate text-xs text-darknavy/58">{option.label}</span>
				) : null}
				<OptionDescription option={option} view={view} />
			</span>
			{option.href ? <ExternalLink className="h-3.5 w-3.5 text-darknavy/35" /> : null}
		</>
	);

	return (
		<div className={view === AppAdvancedDropdownOptionViewGrid ? "grid min-w-0" : "grid gap-1"}>
			{option.href ? (
				<Link
					href={option.href}
					id={optionId}
					role="option"
					aria-selected={isSelected}
					aria-disabled={option.disabled}
					data-active={isActive ? "true" : undefined}
					data-selected={isSelected ? "true" : undefined}
					className={optionClassName}
					onMouseEnter={() => {
						if (!option.disabled) {
							onActive(option.value);
						}
					}}
					onClick={(event) => {
						event.stopPropagation();
						if (option.disabled) {
							event.preventDefault();
						}
					}}
					style={getOptionIndentStyle(view, level)}
				>
					{content}
				</Link>
			) : (
				<button
					type="button"
					id={optionId}
					role="option"
					aria-selected={isSelected}
					disabled={option.disabled}
					data-active={isActive ? "true" : undefined}
					data-selected={isSelected ? "true" : undefined}
					onClick={(event) => {
						event.preventDefault();
						event.stopPropagation();
						onSelect(option);
					}}
					onMouseEnter={() => {
						if (!option.disabled) {
							onActive(option.value);
						}
					}}
					className={optionClassName}
					style={getOptionIndentStyle(view, level)}
				>
					{content}
				</button>
			)}
			{hasChildren
				? option.children?.map((child) => (
						<OptionRow
							key={child.value}
							activeValue={activeValue}
							getOptionId={getOptionId}
							level={level + 1}
							option={child}
							view={view}
							selectedValues={selectedValues}
							showSelectionIndicator={showSelectionIndicator}
							onActive={onActive}
							onSelect={onSelect}
						/>
					))
				: null}
		</div>
	);
}

export function SelectionChip({
	disabled,
	removable,
	option,
	onRemove,
}: {
	disabled: boolean;
	removable: boolean;
	option: AppAdvancedDropdownOption;
	onRemove: () => void;
}) {
	return (
		<span
			className={joinClasses(
				"inline-flex h-7 max-w-full min-w-0 items-center gap-1 rounded-md bg-skyblue/15 px-2.5 text-xs font-semibold text-darknavy",
				disabled && "bg-white/45 text-darknavy/35 ring-1 ring-darknavy/5",
			)}
		>
			<span className="min-w-0 truncate">{option.name}</span>
			{removable ? (
				<button
					type="button"
					disabled={disabled}
					onClick={(event) => {
						event.preventDefault();
						event.stopPropagation();
						onRemove();
					}}
					className="shrink-0 text-darknavy/55 transition hover:text-darknavy disabled:pointer-events-none"
					aria-label={`Remove ${option.name}`}
				>
					<X className="h-3 w-3" aria-hidden="true" />
				</button>
			) : null}
		</span>
	);
}

export function SelectedSingle({
	disabled,
	option,
	showDetails,
}: {
	disabled: boolean;
	option: AppAdvancedDropdownOption;
	showDetails: boolean;
}) {
	const detailText = option.selectedDetails ?? option.label ?? option.description;

	return (
		<span className="flex min-w-0 items-center gap-2 px-0.5">
			<span
				className={joinClasses("truncate text-sm text-darknavy", disabled && "text-darknavy/45")}
			>
				{option.name}
			</span>
			{showDetails && detailText ? (
				<span
					className={joinClasses(
						"truncate text-xs text-darknavy/55",
						disabled && "text-darknavy/35",
					)}
				>
					{detailText ? ` - ${detailText}` : null}
				</span>
			) : null}
		</span>
	);
}

function OptionDescription({
	option,
	view,
}: {
	option: AppAdvancedDropdownOption;
	view: AppAdvancedDropdownOptionView;
}) {
	if (!option.description) {
		return null;
	}

	if (view === AppAdvancedDropdownOptionViewGrid) {
		return (
			<ModuleTooltip
				className="min-w-0 w-full"
				contentClassName="max-w-80"
				description={option.description}
				position="top"
				title={option.name}
			>
				<span className="line-clamp-2 w-full text-xs leading-4 text-darknavy/45">
					{option.description}
				</span>
			</ModuleTooltip>
		);
	}

	return (
		<span className="line-clamp-2 text-xs leading-4 text-darknavy/45">
			{option.description}
		</span>
	);
}
