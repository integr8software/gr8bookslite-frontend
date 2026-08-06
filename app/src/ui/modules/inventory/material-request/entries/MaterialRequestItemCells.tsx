import { useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AlertCircle, MoreHorizontal } from "lucide-react";
import { MaterialRequestUomOptions } from "@/app/src/constants/modules/inventory/material-request/MaterialRequestConstants";
import {
	formatNumberInputValue,
	isDateItemColumn,
	isNumericItemColumn,
	parseNumberInputValue,
} from "@/app/src/data/modules/inventory/material-request/MaterialRequestItemEntryData";
import type { MaterialRequestItemColumnId } from "@/app/src/types/modules/inventory/material-request/MaterialRequestItemEntryTypes";
import type {
	MaterialRequestItem,
	MaterialRequestNumberValue,
} from "@/app/src/types/modules/inventory/material-request/MaterialRequestTypes";
import type { ModuleDataEntryCellContext } from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntry";
import { ModuleTooltip } from "@/app/src/ui/shared/module/ModuleTooltip";
import { cellControlClassName } from "@/app/src/ui/modules/inventory/material-request/entries/MaterialRequestItemEntryStyles";

export function renderItemCell({
	cellContext,
	columnId,
	isReadonly,
	item,
	rowNo,
	onOpenRemarks,
	onUpdateItem,
	validationMessage,
}: {
	cellContext: ModuleDataEntryCellContext;
	columnId: MaterialRequestItemColumnId;
	isReadonly: boolean;
	item: MaterialRequestItem;
	rowNo: number;
	onOpenRemarks: (remarks: {
		itemId: string;
		rowNo: number;
		value: string;
	}) => void;
	onUpdateItem: (
		itemId: string,
		field: keyof MaterialRequestItem,
		value: MaterialRequestItem[keyof MaterialRequestItem],
	) => void;
	validationMessage?: string;
}) {
	if (columnId === "uom") {
		return (
			<div className="relative h-10 w-full">
				<select
					value={item.uom}
					disabled={isReadonly}
					aria-invalid={Boolean(validationMessage)}
					tabIndex={cellContext.focusableTabIndex}
					onChange={(event) => onUpdateItem(item.id, "uom", event.target.value)}
					className={`${cellControlClassName(undefined, validationMessage)} app-select-control`}
				>
					{MaterialRequestUomOptions.map((option) => (
						<option key={option} value={option}>
							{option}
						</option>
					))}
				</select>
				<CellValidationWarning message={validationMessage} />
			</div>
		);
	}

	if (isNumericItemColumn(columnId)) {
		return (
			<NumberInput
				readOnly={isReadonly}
				tabIndex={cellContext.focusableTabIndex}
				validationMessage={validationMessage}
				value={item[columnId]}
				onChange={(value) => onUpdateItem(item.id, columnId, value)}
			/>
		);
	}

	if (isDateItemColumn(columnId)) {
		return (
			<DateInput
				readOnly={isReadonly}
				tabIndex={cellContext.focusableTabIndex}
				validationMessage={validationMessage}
				value={item[columnId]}
				onChange={(value) => onUpdateItem(item.id, columnId, value)}
			/>
		);
	}

	if (columnId === "remarks") {
		return (
			<div className="grid min-w-0 grid-cols-[minmax(0,1fr)_2.5rem]">
				<ItemInput
					readOnly={isReadonly}
					tabIndex={cellContext.focusableTabIndex}
					validationMessage={validationMessage}
					value={item.remarks}
					onChange={(value) => onUpdateItem(item.id, "remarks", value)}
				/>
				<ModuleTooltip title="Open remarks" align="end" className="h-10 w-10">
					<button
						type="button"
						onClick={() =>
							onOpenRemarks({
								itemId: item.id,
								rowNo,
								value: item.remarks,
							})
						}
						className="inline-flex h-10 w-10 items-center justify-center border-l border-darknavy/10 bg-white text-darknavy/65 transition hover:bg-skyblue/10 hover:text-darknavy focus:outline-none focus:ring-2 focus:ring-inset focus:ring-skyblue/35"
						aria-label={`Open remarks for row ${rowNo}`}
					>
						<MoreHorizontal className="h-4 w-4" aria-hidden="true" />
					</button>
				</ModuleTooltip>
			</div>
		);
	}

	return (
		<ItemInput
			readOnly={isReadonly}
			tabIndex={cellContext.focusableTabIndex}
			validationMessage={validationMessage}
			value={String(item[columnId] ?? "")}
			onChange={(value) => onUpdateItem(item.id, columnId, value)}
		/>
	);
}

function ItemInput({
	onChange,
	readOnly,
	tabIndex,
	validationMessage,
	value,
}: {
	onChange: (value: string) => void;
	readOnly: boolean;
	tabIndex: number;
	validationMessage?: string;
	value: string;
}) {
	return (
		<div className="relative h-10 w-full">
			<input
				type="text"
				value={value}
				readOnly={readOnly}
				aria-invalid={Boolean(validationMessage)}
				tabIndex={tabIndex}
				onChange={(event) => onChange(event.target.value)}
				className={cellControlClassName(undefined, validationMessage)}
			/>
			<CellValidationWarning message={validationMessage} />
		</div>
	);
}

function NumberInput({
	onChange,
	readOnly,
	tabIndex,
	validationMessage,
	value,
}: {
	onChange: (value: MaterialRequestNumberValue) => void;
	readOnly: boolean;
	tabIndex: number;
	validationMessage?: string;
	value: MaterialRequestNumberValue;
}) {
	return (
		<div className="relative h-10 w-full">
			<input
				type="number"
				min="0"
				value={formatNumberInputValue(value)}
				readOnly={readOnly}
				aria-invalid={Boolean(validationMessage)}
				tabIndex={tabIndex}
				onChange={(event) => onChange(parseNumberInputValue(event.target.value))}
				className={cellControlClassName("text-right", validationMessage)}
			/>
			<CellValidationWarning message={validationMessage} />
		</div>
	);
}

function DateInput({
	onChange,
	readOnly,
	tabIndex,
	validationMessage,
	value,
}: {
	onChange: (value: string) => void;
	readOnly: boolean;
	tabIndex: number;
	validationMessage?: string;
	value: string;
}) {
	return (
		<div className="relative h-10 w-full">
			<input
				type="date"
				value={value}
				readOnly={readOnly}
				aria-invalid={Boolean(validationMessage)}
				tabIndex={tabIndex}
				onChange={(event) => onChange(event.target.value)}
				className={cellControlClassName(undefined, validationMessage)}
			/>
			<CellValidationWarning message={validationMessage} />
		</div>
	);
}

export function CellValidationWarning({ message }: { message?: string }) {
	const triggerRef = useRef<HTMLSpanElement>(null);
	const [isTooltipOpen, setIsTooltipOpen] = useState(false);
	const [tooltipStyle, setTooltipStyle] = useState({
		left: 0,
		top: 0,
		transform: "translateY(-100%)",
	});

	useLayoutEffect(() => {
		if (!isTooltipOpen || !triggerRef.current) {
			return;
		}

		const rect = triggerRef.current.getBoundingClientRect();
		const tooltipWidth = 224;
		const viewportPadding = 8;
		const left = Math.min(
			Math.max(viewportPadding, rect.right - tooltipWidth),
			window.innerWidth - tooltipWidth - viewportPadding,
		);
		const hasRoomAbove = rect.top > 56;
		const top = hasRoomAbove ? rect.top - 8 : rect.bottom + 8;

		setTooltipStyle({
			left,
			top,
			transform: hasRoomAbove ? "translateY(-100%)" : "translateY(0)",
		});
	}, [isTooltipOpen, message]);

	if (!message) {
		return null;
	}

	return (
		<span
			ref={triggerRef}
			tabIndex={-1}
			aria-label={message}
			onBlur={() => setIsTooltipOpen(false)}
			onFocus={() => setIsTooltipOpen(true)}
			onMouseEnter={() => setIsTooltipOpen(true)}
			onMouseLeave={() => setIsTooltipOpen(false)}
			className="group absolute right-2 top-1/2 z-20 inline-flex -translate-y-1/2 items-center justify-center rounded-full text-coralpink outline-none focus-visible:ring-2 focus-visible:ring-coralpink/25"
		>
			<AlertCircle className="h-4 w-4" aria-hidden="true" />
			{isTooltipOpen && typeof document !== "undefined"
				? createPortal(
					<span
						role="tooltip"
						style={tooltipStyle}
						className="pointer-events-none fixed z-[220] w-56 rounded-md border border-coralpink/20 bg-white px-2.5 py-1.5 text-left text-xs font-semibold leading-5 text-coralpink shadow-[0_12px_30px_rgba(33,39,56,0.16)]"
					>
						{message}
					</span>,
					document.body,
				)
				: null}
		</span>
	);
}

