"use client";

import { ChevronDown, Plus, Search, X } from "lucide-react";
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
import {
	AppAdvancedDropdownOptionViewGrid,
	AppAdvancedDropdownOptionViewList,
	AppAdvancedDropdownSelectionModeMultiple,
	AppAdvancedDropdownSelectionModeSingle,
} from "@/app/src/constants/shared/advanced-dropdown/AppAdvancedDropdownConstants";
import type {
	AppAdvancedDropdownOption,
	AppAdvancedDropdownOptionView,
	AppAdvancedDropdownProps,
} from "@/app/src/types/shared/advanced-dropdown/AppAdvancedDropdownTypes";
import {
	OptionRow,
	SelectedSingle,
	SelectionChip,
	ViewToggle,
} from "@/app/src/ui/shared/advanced-dropdown/AppAdvancedDropdownParts";
import {
	deduplicateOptions,
	filterOptions,
	flattenOptions,
	getInitialActiveOptionValue,
	getPortalStyle,
	isEventInsideDropdown,
	joinClasses,
} from "@/app/src/ui/shared/advanced-dropdown/AppAdvancedDropdownUtils";

function sortOptionsByName(options: AppAdvancedDropdownOption[]): AppAdvancedDropdownOption[] {
	return [...options]
		.sort(
			(left, right) =>
				left.name.localeCompare(right.name, undefined, { sensitivity: "base" }) ||
				(left.label ?? "").localeCompare(right.label ?? "", undefined, { sensitivity: "base" }) ||
				left.value.localeCompare(right.value, undefined, { sensitivity: "base" }),
		)
		.map((option) =>
			option.children
				? { ...option, children: sortOptionsByName(option.children) }
				: option,
		);
}

export type {
	AppAdvancedDropdownAddAction,
	AppAdvancedDropdownOption,
	AppAdvancedDropdownOptionView,
	AppAdvancedDropdownProps,
	AppAdvancedDropdownSelectionMode,
} from "@/app/src/types/shared/advanced-dropdown/AppAdvancedDropdownTypes";

const AppAdvancedDropdownDefaultMenuMinWidth = 320;

export function AppAdvancedDropdown({
	addAction,
	"aria-describedby": ariaDescribedByAttribute,
	"aria-invalid": ariaInvalidAttribute,
	"aria-labelledby": ariaLabelledByAttribute,
	ariaDescribedBy,
	ariaInvalid,
	ariaLabelledBy,
	className,
	disabled = false,
	emptyMessage = "No options found.",
	id,
	isClearable = true,
	isSearchable = true,
	menuMinWidth,
	menuPortal = true,
	name,
	optionViewToggle = false,
	options,
	placeholder = "--Select Option--",
	readOnly = false,
	removeSelectionOnSelectedOptionClick = true,
	searchPlaceholder = "Search options",
	selectionMode = AppAdvancedDropdownSelectionModeSingle,
	showSelectionIndicator = true,
	showSelectedDetails = false,
	showSelectionRemoveButton = true,
	value,
	onChange,
	onOpen,
	onSelectOption,
}: AppAdvancedDropdownProps) {
	const generatedId = useId();
	const controlId = id ?? generatedId;
	const listboxId = `${controlId}-listbox`;
	const [isOpen, setIsOpen] = useState(false);
	const [optionView, setOptionView] = useState<AppAdvancedDropdownOptionView>(
		AppAdvancedDropdownOptionViewList,
	);
	const [query, setQuery] = useState("");
	const [activeOptionValue, setActiveOptionValue] = useState("");
	const [portalStyle, setPortalStyle] = useState<CSSProperties>({});
	const menuRef = useRef<HTMLDivElement>(null);
	const menuInteractionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const isMenuInteractionActiveRef = useRef(false);
	const isMenuPointerDownRef = useRef(false);
	const controlRef = useRef<HTMLDivElement>(null);
	const rootRef = useRef<HTMLDivElement>(null);
	const selectedValues = useMemo(
		() => Array.from(new Set(Array.isArray(value) ? value : value ? [value] : [])),
		[value],
	);
	const selectedValueSet = useMemo(() => new Set(selectedValues), [selectedValues]);
	const uniqueOptions = useMemo(() => sortOptionsByName(deduplicateOptions(options)), [options]);
	const flatOptions = useMemo(() => flattenOptions(uniqueOptions), [uniqueOptions]);
	const selectedOptions = selectedValues
		.map((selectedValue) => flatOptions.find((option) => option.value === selectedValue))
		.filter((option): option is AppAdvancedDropdownOption => Boolean(option));
	const filteredOptions = useMemo(
		() => filterOptions(uniqueOptions, query),
		[query, uniqueOptions],
	);
	const visibleOptions = useMemo(() => flattenOptions(filteredOptions), [filteredOptions]);
	const selectableOptions = useMemo(
		() => visibleOptions.filter((option) => !option.disabled),
		[visibleOptions],
	);
	const optionIdByValue = useMemo(
		() =>
			new Map(
				visibleOptions.map((option, index) => [option.value, `${listboxId}-option-${index}`]),
			),
		[visibleOptions, listboxId],
	);
	const hasOptions = filteredOptions.length > 0;
	const isInteractionLocked = disabled || readOnly;
	const isMultiple = selectionMode === AppAdvancedDropdownSelectionModeMultiple;
	const hasActiveOption = selectableOptions.some((option) => option.value === activeOptionValue);
	const effectiveActiveOptionValue =
		activeOptionValue && hasActiveOption
			? activeOptionValue
			: getInitialActiveOptionValue(selectableOptions, selectedValueSet);
	const activeOption = effectiveActiveOptionValue
		? visibleOptions.find((option) => option.value === effectiveActiveOptionValue)
		: undefined;
	const activeOptionId = effectiveActiveOptionValue
		? optionIdByValue.get(effectiveActiveOptionValue)
		: undefined;
	const canClearSelection = selectedValues.length > 0 && isClearable && !isInteractionLocked;
	const resolvedAriaDescribedBy = ariaDescribedByAttribute ?? ariaDescribedBy;
	const resolvedAriaInvalid = ariaInvalidAttribute ?? ariaInvalid;
	const resolvedAriaLabelledBy = ariaLabelledByAttribute ?? ariaLabelledBy;

	useEffect(() => {
		if (!isOpen) {
			return;
		}

		function handlePointerDown(event: PointerEvent) {
			if (isEventInsideDropdown(event, rootRef.current, menuRef.current)) {
				isMenuPointerDownRef.current = true;
				keepMenuInteractionActive();
				return;
			}

			isMenuPointerDownRef.current = false;
			setIsOpen(false);
		}

		function handlePointerMove(event: PointerEvent) {
			if (
				isMenuPointerDownRef.current ||
				isEventInsideDropdown(event, rootRef.current, menuRef.current)
			) {
				keepMenuInteractionActive();
			}
		}

		function handlePointerUp() {
			isMenuPointerDownRef.current = false;

			if (menuInteractionTimeoutRef.current) {
				clearTimeout(menuInteractionTimeoutRef.current);
				menuInteractionTimeoutRef.current = null;
			}

			isMenuInteractionActiveRef.current = false;
		}

		document.addEventListener("pointerdown", handlePointerDown, true);
		document.addEventListener("pointermove", handlePointerMove, true);
		document.addEventListener("pointerup", handlePointerUp, true);

		return () => {
			document.removeEventListener("pointerdown", handlePointerDown, true);
			document.removeEventListener("pointermove", handlePointerMove, true);
			document.removeEventListener("pointerup", handlePointerUp, true);
		};
	}, [isOpen]);

	useEffect(() => {
		return () => {
			if (menuInteractionTimeoutRef.current) {
				clearTimeout(menuInteractionTimeoutRef.current);
			}
		};
	}, []);

	useEffect(() => {
		if (typeof document === "undefined") {
			return;
		}

		const labels = Array.from(document.querySelectorAll<HTMLLabelElement>("label[for]")).filter(
			(label) => label.htmlFor === controlId,
		);

		if (labels.length === 0) {
			return;
		}

		function focusControl(event: MouseEvent) {
			if (isInteractionLocked) {
				return;
			}

			event.preventDefault();
			controlRef.current?.focus();
		}

		labels.forEach((label) => {
			label.addEventListener("click", focusControl);
		});

		return () => {
			labels.forEach((label) => {
				label.removeEventListener("click", focusControl);
			});
		};
	}, [controlId, isInteractionLocked]);

	const effectiveMenuMinWidth = menuMinWidth ?? (optionViewToggle ? 480 : AppAdvancedDropdownDefaultMenuMinWidth);

	useEffect(() => {
		if (!isOpen || !menuPortal) {
			return;
		}

		function updatePortalStyle() {
			const nextStyle = getPortalStyle(rootRef.current, effectiveMenuMinWidth);

			if (nextStyle) {
				setPortalStyle(nextStyle);
			}
		}

		function handleScroll(event: Event) {
			const target = event.target as Node | null;

			if (target && menuRef.current?.contains(target)) {
				return;
			}

			updatePortalStyle();
		}

		updatePortalStyle();
		window.addEventListener("resize", updatePortalStyle);
		window.addEventListener("scroll", handleScroll, true);

		return () => {
			window.removeEventListener("resize", updatePortalStyle);
			window.removeEventListener("scroll", handleScroll, true);
		};
	}, [isOpen, effectiveMenuMinWidth, menuPortal]);

	useEffect(() => {
		if (!isOpen || !activeOptionId) {
			return;
		}

		document.getElementById(activeOptionId)?.scrollIntoView({ block: "nearest" });
	}, [activeOptionId, isOpen]);

	useEffect(() => {
		if (!isOpen) {
			return;
		}

		const selectedOptionId = optionIdByValue.get(selectedValues[0] ?? "");

		if (!selectedOptionId) {
			return;
		}

		window.requestAnimationFrame(() => {
			document.getElementById(selectedOptionId)?.scrollIntoView({ block: "start" });
		});
	}, [isOpen, optionIdByValue, selectedValues]);

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

		if (!isOpen) {
			onOpen?.();
		}

		if (menuPortal) {
			const nextStyle = getPortalStyle(rootRef.current, effectiveMenuMinWidth);

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
				: (currentIndex + direction + selectableOptions.length) % selectableOptions.length;

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
				showOptions(getInitialActiveOptionValue(selectableOptions, selectedValueSet));
				return;
			}

			moveActiveOption(1);
			return;
		}

		if (event.key === "ArrowUp") {
			event.preventDefault();

			if (!isOpen) {
				showOptions(selectableOptions[selectableOptions.length - 1]?.value ?? "");
				return;
			}

			moveActiveOption(-1);
			return;
		}

		if (event.key === "Enter") {
			event.preventDefault();

			if (!isOpen) {
				showOptions(getInitialActiveOptionValue(selectableOptions, selectedValueSet));
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

		if (event.key === "Tab") {
			setIsOpen(false);
		}
	}

	function selectOption(option: AppAdvancedDropdownOption) {
		if (isInteractionLocked || option.disabled) {
			return;
		}

		if (selectionMode === AppAdvancedDropdownSelectionModeMultiple) {
			if (selectedValueSet.has(option.value) && !removeSelectionOnSelectedOptionClick) {
				setQuery("");
				onSelectOption?.(option);
				return;
			}

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

		if (selectionMode === AppAdvancedDropdownSelectionModeMultiple) {
			onChange(selectedValues.filter((selectedValue) => selectedValue !== optionValue));
			return;
		}

		onChange("");
	}

	function clearSelection() {
		if (isInteractionLocked) {
			return;
		}

		onChange(selectionMode === AppAdvancedDropdownSelectionModeMultiple ? [] : "");
	}

	function keepMenuInteractionActive() {
		isMenuInteractionActiveRef.current = true;

		if (menuInteractionTimeoutRef.current) {
			clearTimeout(menuInteractionTimeoutRef.current);
		}

		menuInteractionTimeoutRef.current = setTimeout(() => {
			isMenuInteractionActiveRef.current = false;
			menuInteractionTimeoutRef.current = null;
		}, 400);
	}

	const menu = isOpen ? (
		<div
			ref={menuRef}
			id={listboxId}
			role="listbox"
			aria-multiselectable={selectionMode === AppAdvancedDropdownSelectionModeMultiple}
			style={menuPortal ? portalStyle : { minWidth: effectiveMenuMinWidth }}
			onMouseDownCapture={(event) => {
				keepMenuInteractionActive();
				event.stopPropagation();
			}}
			onPointerDownCapture={(event) => {
				keepMenuInteractionActive();
				event.stopPropagation();
			}}
			onScrollCapture={keepMenuInteractionActive}
			onWheel={(event) => {
				keepMenuInteractionActive();
				event.stopPropagation();
			}}
			onTouchMove={(event) => {
				keepMenuInteractionActive();
				event.stopPropagation();
			}}
			className={joinClasses(
				menuPortal ? "fixed z-130" : "absolute left-0 top-full z-40 mt-1 w-full",
				"app-advanced-dropdown-menu flex max-h-80 flex-col overflow-hidden overscroll-contain rounded-lg border border-darknavy/12 bg-white shadow-[0_18px_50px_rgba(33,39,56,0.16)]",
			)}
		>
			{isSearchable || optionViewToggle ? (
				<div className="border-b border-darknavy/10 p-2">
					<div className="flex items-center gap-2">
						{isSearchable ? (
							<div className="app-advanced-dropdown-search-control flex h-10 min-w-0 flex-1 items-center gap-2 rounded-md border border-darknavy/10 px-2.5">
								<Search className="h-4 w-4 text-darknavy/35" aria-hidden="true" />
								<input
									autoCapitalize="none"
									autoComplete="off"
									autoCorrect="off"
									spellCheck={false}
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
						) : null}
						{optionViewToggle ? <ViewToggle value={optionView} onChange={setOptionView} /> : null}
					</div>
				</div>
			) : null}
			{addAction ? (
				<button
					type="button"
					disabled={addAction.disabled}
					onClick={() => {
						addAction.onClick();
						setIsOpen(false);
					}}
					className="app-advanced-dropdown-add-action flex w-full items-center gap-2 border-b border-darknavy/10 bg-skyblue/8 px-3 py-2.5 text-left text-sm font-semibold text-skyblue transition hover:bg-skyblue/12 disabled:cursor-not-allowed disabled:opacity-45"
				>
					<Plus className="h-4 w-4" aria-hidden="true" />
					{addAction.label}
				</button>
			) : null}
			<div
				className={joinClasses(
					"min-h-0 overflow-y-auto overscroll-contain p-2",
					optionViewToggle && optionView === AppAdvancedDropdownOptionViewGrid
						? "grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-1.5"
						: "grid gap-1",
				)}
			>
				{hasOptions ? (
					filteredOptions.map((option) => (
						<OptionRow
							key={option.value}
							activeValue={effectiveActiveOptionValue}
							getOptionId={(visibleOption) => optionIdByValue.get(visibleOption.value)}
							level={0}
							option={option}
							view={optionViewToggle ? optionView : AppAdvancedDropdownOptionViewList}
							selectedValues={selectedValueSet}
							showSelectionIndicator={showSelectionIndicator}
							onActive={setActiveOptionValue}
							onSelect={selectOption}
						/>
					))
				) : (
					<div className="col-span-full px-3 py-6 text-center text-sm text-darknavy/45">
						{emptyMessage}
					</div>
				)}
			</div>
		</div>
	) : null;

	return (
		<div ref={rootRef} className={joinClasses("relative", className)}>
			{name ? (
				<input type="hidden" name={name} value={Array.isArray(value) ? value.join(",") : value} />
			) : null}
			<div
				ref={controlRef}
				id={controlId}
				role="combobox"
				aria-controls={listboxId}
				aria-activedescendant={isOpen ? activeOptionId : undefined}
				aria-describedby={resolvedAriaDescribedBy}
				aria-disabled={disabled || undefined}
				aria-expanded={isOpen}
				aria-haspopup="listbox"
				aria-invalid={resolvedAriaInvalid || undefined}
				aria-labelledby={resolvedAriaLabelledBy}
				aria-readonly={readOnly || undefined}
				tabIndex={isInteractionLocked ? -1 : 0}
				onClick={handleControlClick}
				onKeyDown={handleComboboxKeyDown}
				className={joinClasses(
					"app-advanced-dropdown-control app-disabled-control w-full rounded-lg border border-darknavy/10 text-sm outline-none transition",
					isMultiple ? "min-h-11 px-2 py-1.5" : "h-11 px-3",
					disabled
						? "pointer-events-none cursor-not-allowed bg-darknavy/[0.035] text-darknavy/35 shadow-none"
						: readOnly
							? "pointer-events-none cursor-default border-darknavy/10 bg-darknavy/[0.025] text-darknavy/70 shadow-none"
							: "cursor-pointer bg-white text-darknavy focus:border-skyblue/60 focus:ring-4 focus:ring-skyblue/10",
				)}
			>
				<div
					className={joinClasses(
						"flex items-center gap-2",
						readOnly ? "pr-0" : canClearSelection ? "pr-14" : "pr-8",
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
										removable={showSelectionRemoveButton && !isInteractionLocked}
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
								title={placeholder}
								className={joinClasses(
									"app-advanced-dropdown-placeholder block truncate px-0.5 text-darknavy/35",
									isMultiple ? "py-1.5" : "py-1",
									disabled && "text-darknavy/32",
								)}
							>
								{placeholder}
							</span>
						)}
					</div>
					{readOnly ? null : (
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
									disabled && "text-darknavy/30",
								)}
								aria-hidden="true"
							/>
						</div>
					)}
				</div>
			</div>

			{menuPortal && menu && typeof document !== "undefined"
				? createPortal(menu, document.body)
				: menu}
		</div>
	);
}

