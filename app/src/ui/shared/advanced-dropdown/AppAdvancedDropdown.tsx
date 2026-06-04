"use client";

import Link from "next/link";
import {
	Check,
	ChevronDown,
	ExternalLink,
	Plus,
	Search,
	X,
} from "lucide-react";
import {
	useEffect,
	useId,
	useMemo,
	useRef,
	useState,
	type CSSProperties,
	type KeyboardEvent,
	type MouseEvent as ReactMouseEvent,
} from "react";
import { createPortal } from "react-dom";

export type AppAdvancedDropdownOption = {
	children?: AppAdvancedDropdownOption[];
	description?: string;
	disabled?: boolean;
	href?: string;
	label?: string;
	name: string;
	value: string;
};

export type AppAdvancedDropdownAddAction = {
	disabled?: boolean;
	label: string;
	onClick: () => void;
};

type AppAdvancedDropdownProps = {
	addAction?: AppAdvancedDropdownAddAction;
	className?: string;
	disabled?: boolean;
	emptyMessage?: string;
	id?: string;
	isClearable?: boolean;
	isSearchable?: boolean;
	name?: string;
	menuPortal?: boolean;
	options: AppAdvancedDropdownOption[];
	placeholder?: string;
	readOnly?: boolean;
	searchPlaceholder?: string;
	selectionMode?: "single" | "multiple";
	showSelectedDetails?: boolean;
	value: string | string[];
	onChange: (value: string | string[]) => void;
	onSelectOption?: (option: AppAdvancedDropdownOption) => void;
};

const DropdownMenuGap = 4;
const DropdownMenuMaxHeight = 320;
const DropdownMenuMinHeight = 96;
const DropdownMenuViewportPadding = 8;

export function AppAdvancedDropdown({
	addAction,
	className,
	disabled = false,
	emptyMessage = "No options found.",
	id,
	isClearable = true,
	isSearchable = true,
	menuPortal = true,
	name,
	options,
	placeholder = "Select option",
	readOnly = false,
	searchPlaceholder = "Search options",
	selectionMode = "single",
	showSelectedDetails = false,
	value,
	onChange,
	onSelectOption,
}: AppAdvancedDropdownProps) {
	const generatedId = useId();
	const controlId = id ?? generatedId;
	const listboxId = `${controlId}-listbox`;
	const [isOpen, setIsOpen] = useState(false);
	const [query, setQuery] = useState("");
	const [activeOptionValue, setActiveOptionValue] = useState("");
	const [portalStyle, setPortalStyle] = useState<CSSProperties>({});
	const menuRef = useRef<HTMLDivElement>(null);
	const rootRef = useRef<HTMLDivElement>(null);
	const selectedValues = useMemo(
		() => (Array.isArray(value) ? value : value ? [value] : []),
		[value],
	);
	const selectedValueSet = useMemo(
		() => new Set(selectedValues),
		[selectedValues],
	);
	const flatOptions = useMemo(() => flattenOptions(options), [options]);
	const selectedOptions = selectedValues
		.map((selectedValue) =>
			flatOptions.find((option) => option.value === selectedValue),
		)
		.filter((option): option is AppAdvancedDropdownOption => Boolean(option));
	const filteredOptions = useMemo(
		() => filterOptions(options, query),
		[options, query],
	);
	const visibleOptions = useMemo(
		() => flattenOptions(filteredOptions),
		[filteredOptions],
	);
	const selectableOptions = useMemo(
		() => visibleOptions.filter((option) => !option.disabled),
		[visibleOptions],
	);
	const optionIdByValue = useMemo(
		() =>
			new Map(
				visibleOptions.map((option, index) => [
					option.value,
					`${listboxId}-option-${index}`,
				]),
			),
		[visibleOptions, listboxId],
	);
	const hasOptions = filteredOptions.length > 0;
	const isInteractionLocked = disabled || readOnly;
	const isMultiple = selectionMode === "multiple";
	const hasActiveOption = selectableOptions.some(
		(option) => option.value === activeOptionValue,
	);
	const effectiveActiveOptionValue =
		activeOptionValue && hasActiveOption
			? activeOptionValue
			: getInitialActiveOptionValue(selectableOptions, selectedValueSet);
	const activeOption = effectiveActiveOptionValue
		? visibleOptions.find(
			(option) => option.value === effectiveActiveOptionValue,
		)
		: undefined;
	const activeOptionId = effectiveActiveOptionValue
		? optionIdByValue.get(effectiveActiveOptionValue)
		: undefined;
	const canClearSelection =
		selectedValues.length > 0 && isClearable && !isInteractionLocked;

	useEffect(() => {
		if (!isOpen) {
			return;
		}

		function handlePointerDown(event: MouseEvent) {
			const target = event.target as Node;

			if (
				!rootRef.current?.contains(target) &&
				!menuRef.current?.contains(target)
			) {
				setIsOpen(false);
			}
		}

		document.addEventListener("mousedown", handlePointerDown);

		return () => {
			document.removeEventListener("mousedown", handlePointerDown);
		};
	}, [isOpen]);

	useEffect(() => {
		if (!isOpen || !menuPortal) {
			return;
		}

		function updatePortalStyle() {
			const nextStyle = getPortalStyle(rootRef.current);

			if (nextStyle) {
				setPortalStyle(nextStyle);
			}
		}

		updatePortalStyle();
		window.addEventListener("resize", updatePortalStyle);
		window.addEventListener("scroll", updatePortalStyle, true);

		return () => {
			window.removeEventListener("resize", updatePortalStyle);
			window.removeEventListener("scroll", updatePortalStyle, true);
		};
	}, [isOpen, menuPortal]);

	useEffect(() => {
		if (!isOpen || !activeOptionId) {
			return;
		}

		document
			.getElementById(activeOptionId)
			?.scrollIntoView({ block: "nearest" });
	}, [activeOptionId, isOpen]);

	function openOptions() {
		if (isInteractionLocked) {
			return;
		}

		if (isOpen) {
			setIsOpen(false);
			return;
		}

		showOptions(getInitialActiveOptionValue(selectableOptions, selectedValueSet));
	}

	function handleControlClick(event: ReactMouseEvent<HTMLDivElement>) {
		event.preventDefault();
		event.stopPropagation();
		event.currentTarget.focus();
		openOptions();
	}

	function showOptions(nextActiveValue?: string) {
		if (isInteractionLocked) {
			return;
		}

		if (menuPortal) {
			const nextStyle = getPortalStyle(rootRef.current);

			if (nextStyle) {
				setPortalStyle(nextStyle);
			}
		}

		setIsOpen(true);

		if (nextActiveValue !== undefined) {
			setActiveOptionValue(nextActiveValue);
		}
	}

	function moveActiveOption(direction: 1 | -1) {
		if (selectableOptions.length === 0) {
			return;
		}

		const currentIndex = selectableOptions.findIndex(
			(option) => option.value === effectiveActiveOptionValue,
		);
		const nextIndex =
			currentIndex === -1
				? direction === 1
					? 0
					: selectableOptions.length - 1
				: (currentIndex + direction + selectableOptions.length) %
				selectableOptions.length;

		setActiveOptionValue(selectableOptions[nextIndex].value);
	}

	function handleComboboxKeyDown(event: KeyboardEvent<HTMLElement>) {
		if (isInteractionLocked) {
			return;
		}

		const isSearchInput = event.currentTarget instanceof HTMLInputElement;

		if (event.key === "ArrowDown") {
			event.preventDefault();

			if (!isOpen) {
				showOptions(
					getInitialActiveOptionValue(selectableOptions, selectedValueSet),
				);
				return;
			}

			moveActiveOption(1);
			return;
		}

		if (event.key === "ArrowUp") {
			event.preventDefault();

			if (!isOpen) {
				showOptions(
					selectableOptions[selectableOptions.length - 1]?.value ?? "",
				);
				return;
			}

			moveActiveOption(-1);
			return;
		}

		if (event.key === "Enter") {
			event.preventDefault();

			if (!isOpen) {
				showOptions(
					getInitialActiveOptionValue(selectableOptions, selectedValueSet),
				);
				return;
			}

			if (activeOption) {
				selectOption(activeOption);
			}

			return;
		}

		if (event.key === " " && !isSearchInput) {
			event.preventDefault();
			openOptions();
			return;
		}

		if (event.key === "Escape") {
			setIsOpen(false);
		}
	}

	function selectOption(option: AppAdvancedDropdownOption) {
		if (isInteractionLocked || option.disabled) {
			return;
		}

		if (selectionMode === "multiple") {
			const nextValues = selectedValueSet.has(option.value)
				? selectedValues.filter((selectedValue) => selectedValue !== option.value)
				: [...selectedValues, option.value];

			onChange(nextValues);
		} else {
			onChange(option.value);
			setIsOpen(false);
		}

		onSelectOption?.(option);
		setQuery("");
	}

	function removeOption(optionValue: string) {
		if (isInteractionLocked) {
			return;
		}

		if (selectionMode === "multiple") {
			onChange(selectedValues.filter((selectedValue) => selectedValue !== optionValue));
			return;
		}

		onChange("");
	}

	function clearSelection() {
		if (isInteractionLocked) {
			return;
		}

		onChange(selectionMode === "multiple" ? [] : "");
	}

	const menu = isOpen ? (
		<div
			ref={menuRef}
			id={listboxId}
			role="listbox"
			aria-multiselectable={selectionMode === "multiple"}
			style={menuPortal ? portalStyle : undefined}
			className={joinClasses(
				menuPortal
					? "fixed z-130"
					: "absolute left-0 top-full z-40 mt-1 w-full",
				"app-advanced-dropdown-menu flex max-h-80 flex-col overflow-hidden rounded-lg border border-darknavy/10 bg-white shadow-[0_18px_60px_rgba(33,39,56,0.14)]",
			)}
		>
			{addAction ? (
				<button
					type="button"
					disabled={addAction.disabled}
					onClick={() => {
						addAction.onClick();
						setIsOpen(false);
					}}
					className="app-advanced-dropdown-add-action flex w-full items-center gap-2 border-b border-darknavy/10 px-3 py-2.5 text-left text-sm font-semibold text-skyblue transition hover:bg-skyblue/10 disabled:cursor-not-allowed disabled:opacity-45"
				>
					<Plus className="h-4 w-4" aria-hidden="true" />
					{addAction.label}
				</button>
			) : null}
			{isSearchable ? (
				<div className="border-b border-darknavy/10 p-2">
					<div className="app-advanced-dropdown-search-control flex h-10 items-center gap-2 rounded-md border border-darknavy/10 px-2.5">
						<Search
							className="h-4 w-4 text-darknavy/35"
							aria-hidden="true"
						/>
						<input
							value={query}
							onChange={(event) => setQuery(event.target.value)}
							onKeyDown={handleComboboxKeyDown}
							aria-controls={listboxId}
							aria-activedescendant={activeOptionId}
							className="app-advanced-dropdown-search-input h-full min-w-0 flex-1 bg-transparent text-sm text-darknavy outline-none placeholder:text-darknavy/35"
							placeholder={searchPlaceholder}
							autoFocus
						/>
					</div>
				</div>
			) : null}
			<div className="grid min-h-0 gap-1 overflow-y-auto p-2">
				{hasOptions ? (
					filteredOptions.map((option) => (
						<OptionRow
							key={option.value}
							activeValue={effectiveActiveOptionValue}
							getOptionId={(visibleOption) =>
								optionIdByValue.get(visibleOption.value)
							}
							level={0}
							option={option}
							selectedValues={selectedValueSet}
							onActive={setActiveOptionValue}
							onSelect={selectOption}
						/>
					))
				) : (
					<div className="px-3 py-6 text-center text-sm text-darknavy/45">
						{emptyMessage}
					</div>
				)}
			</div>
		</div>
	) : null;

	return (
		<div ref={rootRef} className={joinClasses("relative", className)}>
			{name ? (
				<input
					type="hidden"
					name={name}
					value={Array.isArray(value) ? value.join(",") : value}
				/>
			) : null}
			<div
				id={controlId}
				role="combobox"
				aria-controls={listboxId}
				aria-activedescendant={isOpen ? activeOptionId : undefined}
				aria-disabled={isInteractionLocked}
				aria-expanded={isOpen}
				aria-haspopup="listbox"
				tabIndex={isInteractionLocked ? -1 : 0}
				onClick={handleControlClick}
				onKeyDown={handleComboboxKeyDown}
				className={joinClasses(
					"app-advanced-dropdown-control w-full rounded-lg border border-darknavy/10 bg-white text-sm text-darknavy outline-none transition",
					isMultiple ? "min-h-11 px-2 py-1.5" : "h-11 px-3",
					disabled
						? "pointer-events-none cursor-not-allowed shadow-none"
						: readOnly
							? "pointer-events-none cursor-default shadow-none"
							: "cursor-pointer focus:border-skyblue/60 focus:ring-4 focus:ring-skyblue/10",
				)}
			>
				<div
					className={joinClasses(
						"flex items-center gap-2",
						canClearSelection ? "pr-14" : "pr-8",
						isMultiple ? "min-h-7" : "h-full",
					)}
				>
					<div
						className={joinClasses(
							"min-w-0 flex-1",
							isMultiple
								? "flex max-h-20 flex-wrap items-center gap-1.5 overflow-y-auto pr-1"
								: "grid",
						)}
					>
						{selectedOptions.length > 0 ? (
							isMultiple ? (
								selectedOptions.map((option) => (
									<SelectionChip
										key={option.value}
										disabled={disabled}
										option={option}
										onRemove={() => removeOption(option.value)}
									/>
								))
							) : (
								<SelectedSingle
									disabled={disabled}
									option={selectedOptions[0]}
									showDetails={showSelectedDetails}
								/>
							)
						) : (
							<span
								className={joinClasses(
									"app-advanced-dropdown-placeholder px-0.5 text-darknavy/35",
									isMultiple ? "py-1.5" : "py-1",
									disabled && "text-darknavy/35",
								)}
							>
								{placeholder}
							</span>
						)}
					</div>
					<div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1">
						{canClearSelection ? (
							<button
								type="button"
								disabled={disabled}
								onClick={(event) => {
									event.preventDefault();
									event.stopPropagation();
									clearSelection();
								}}
								className="rounded-md p-1 text-darknavy/38 transition hover:bg-darknavy/5 hover:text-darknavy disabled:pointer-events-none"
								aria-label="Clear selection"
							>
								<X className="h-3.5 w-3.5" aria-hidden="true" />
							</button>
						) : null}
						<ChevronDown
							className={joinClasses(
								"pointer-events-none h-4 w-4 text-darknavy/40 transition",
								isOpen && "rotate-180",
								disabled && "text-darknavy/35",
							)}
							aria-hidden="true"
						/>
					</div>
				</div>
			</div>

			{menuPortal && menu && typeof document !== "undefined"
				? createPortal(menu, document.body)
				: menu}
		</div>
	);
}

function OptionRow({
	activeValue,
	getOptionId,
	level,
	option,
	selectedValues,
	onActive,
	onSelect,
}: {
	activeValue: string;
	getOptionId: (option: AppAdvancedDropdownOption) => string | undefined;
	level: number;
	option: AppAdvancedDropdownOption;
	selectedValues: Set<string>;
	onActive: (value: string) => void;
	onSelect: (option: AppAdvancedDropdownOption) => void;
}) {
	const isSelected = selectedValues.has(option.value);
	const isActive = activeValue === option.value;
	const hasChildren = Boolean(option.children?.length);
	const optionId = getOptionId(option);
	const content = (
		<>
			<span className="flex h-5 w-5 shrink-0 items-center justify-center">
				{isSelected ? (
					<Check className="h-4 w-4 text-skyblue" aria-hidden="true" />
				) : null}
			</span>
			<span className="grid min-w-0 flex-1 gap-0.5">
				<span className="truncate text-sm font-semibold">{option.name}</span>
				{option.label ? (
					<span className="truncate text-xs text-darknavy/58">
						{option.label}
					</span>
				) : null}
				{option.description ? (
					<span className="line-clamp-2 text-xs leading-4 text-darknavy/45">
						{option.description}
					</span>
				) : null}
			</span>
			{option.href ? (
				<ExternalLink className="h-3.5 w-3.5 text-darknavy/35" />
			) : null}
		</>
	);

	return (
		<div className="grid gap-1">
			{option.href ? (
				<Link
					href={option.href}
					id={optionId}
					role="option"
					aria-selected={isSelected}
					aria-disabled={option.disabled}
					data-active={isActive ? "true" : undefined}
					data-selected={isSelected ? "true" : undefined}
					className={getOptionClassName(
						isSelected,
						option.disabled,
						isActive,
					)}
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
					style={{ paddingLeft: `${0.75 + level * 0.9}rem` }}
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
					className={getOptionClassName(
						isSelected,
						option.disabled,
						isActive,
					)}
					style={{ paddingLeft: `${0.75 + level * 0.9}rem` }}
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
						selectedValues={selectedValues}
						onActive={onActive}
						onSelect={onSelect}
					/>
				))
				: null}
		</div>
	);
}

function SelectionChip({
	disabled,
	option,
	onRemove,
}: {
	disabled: boolean;
	option: AppAdvancedDropdownOption;
	onRemove: () => void;
}) {
	return (
		<span
			className={joinClasses(
				"inline-flex h-7 max-w-full min-w-0 items-center gap-1 rounded-md bg-skyblue/15 px-2.5 text-xs font-semibold text-darknavy",
				disabled && "bg-transparent text-darknavy/35",
			)}
		>
			<span className="min-w-0 truncate">{option.name}</span>
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
		</span>
	);
}

function SelectedSingle({
	disabled,
	option,
	showDetails,
}: {
	disabled: boolean;
	option: AppAdvancedDropdownOption;
	showDetails: boolean;
}) {
	return (
		<span className="flex min-w-0 items-center gap-2 px-0.5">
			<span
				className={joinClasses(
					"truncate text-sm text-darknavy",
					disabled && "text-darknavy/35",
				)}
			>
				{option.name}
			</span>
			{showDetails && option.label ? (
				<span
					className={joinClasses(
						"truncate text-xs text-darknavy/55",
						disabled && "text-darknavy/35",
					)}
				>
					{option.label}
				</span>
			) : null}
		</span>
	);
}

function getPortalStyle(root: HTMLDivElement | null): CSSProperties | undefined {
	if (!root || typeof window === "undefined") {
		return undefined;
	}

	const rect = root.getBoundingClientRect();
	const viewportHeight = window.innerHeight;
	const viewportWidth = window.innerWidth;
	const availableWidth = Math.max(
		0,
		viewportWidth - DropdownMenuViewportPadding * 2,
	);
	const width = Math.min(rect.width, availableWidth);
	const maxLeft = Math.max(
		DropdownMenuViewportPadding,
		viewportWidth - DropdownMenuViewportPadding - width,
	);
	const left = Math.min(
		Math.max(rect.left, DropdownMenuViewportPadding),
		maxLeft,
	);
	const spaceBelow =
		viewportHeight - rect.bottom - DropdownMenuGap - DropdownMenuViewportPadding;
	const spaceAbove = rect.top - DropdownMenuGap - DropdownMenuViewportPadding;
	const shouldOpenAbove =
		spaceBelow < DropdownMenuMaxHeight && spaceAbove > spaceBelow;
	const availableHeight = Math.max(
		0,
		shouldOpenAbove ? spaceAbove : spaceBelow,
	);
	const maxHeight = Math.max(
		DropdownMenuMinHeight,
		Math.min(DropdownMenuMaxHeight, availableHeight),
	);

	if (shouldOpenAbove) {
		return {
			bottom: viewportHeight - rect.top + DropdownMenuGap,
			left,
			maxHeight,
			width,
		};
	}

	return {
		left,
		maxHeight,
		top: rect.bottom + DropdownMenuGap,
		width,
	};
}

function flattenOptions(
	options: AppAdvancedDropdownOption[],
): AppAdvancedDropdownOption[] {
	return options.flatMap((option) => [
		option,
		...(option.children ? flattenOptions(option.children) : []),
	]);
}

function filterOptions(
	options: AppAdvancedDropdownOption[],
	query: string,
): AppAdvancedDropdownOption[] {
	const normalizedQuery = query.trim().toLowerCase();

	if (!normalizedQuery) {
		return options;
	}

	return options.reduce<AppAdvancedDropdownOption[]>((matches, option) => {
		const children = option.children
			? filterOptions(option.children, normalizedQuery)
			: undefined;
		const isMatch = getSearchText(option).includes(normalizedQuery);

		if (!isMatch && !children?.length) {
			return matches;
		}

		matches.push({
			...option,
			children,
		});

		return matches;
	}, []);
}

function getSearchText(option: AppAdvancedDropdownOption) {
	return [option.name, option.label, option.description, option.value]
		.filter(Boolean)
		.join(" ")
		.toLowerCase();
}

function getInitialActiveOptionValue(
	options: AppAdvancedDropdownOption[],
	selectedValues: Set<string>,
) {
	return (
		options.find((option) => selectedValues.has(option.value)) ??
		options[0]
	)?.value ?? "";
}

function getOptionClassName(
	isSelected: boolean,
	isDisabled?: boolean,
	isActive?: boolean,
) {
	return joinClasses(
		"app-advanced-dropdown-option flex min-h-9 w-full items-center gap-2.5 rounded-md py-1.5 pr-3 text-left transition",
		isSelected && "bg-skyblue/10 text-darknavy",
		!isSelected && "text-darknavy hover:bg-skyblue/10",
		isActive && !isDisabled && "bg-skyblue/15 ring-1 ring-inset ring-skyblue/25",
		isDisabled && "cursor-not-allowed opacity-45",
	);
}

function joinClasses(...classes: Array<string | false | undefined>) {
	return classes.filter(Boolean).join(" ");
}
