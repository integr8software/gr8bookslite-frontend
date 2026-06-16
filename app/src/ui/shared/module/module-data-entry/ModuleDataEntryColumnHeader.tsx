"use client";

import {
	EyeOff,
	GripVertical,
	MoreVertical,
	Pencil,
	Ruler,
	StretchHorizontal,
	Trash2,
} from "lucide-react";
import {
	useEffect,
	useLayoutEffect,
	useRef,
	useState,
	type CSSProperties,
} from "react";
import { createPortal } from "react-dom";
import { ModuleDataEntryInlineRename } from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntryInlineRename";
import {
	clampColumnWidth,
} from "@/app/src/ui/shared/module/module-data-entry/utils";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";
import type { ModuleDataEntryColumn } from "@/app/src/types/shared/module/module-data-entry/DataEntryTypes";

export function ModuleDataEntryColumnHeader<TRow>({
	canRemove,
	column,
	onAutoColumnWidth,
	onFitColumnWidth,
	onHideColumn,
	onMoveColumn,
	onRemoveColumn,
	onStartColumnDrag,
	onUpdateColumnHeader,
	onUpdateColumnWidth,
}: {
	canRemove: boolean;
	column: ModuleDataEntryColumn<TRow>;
	onAutoColumnWidth?: (columnId: string) => void;
	onFitColumnWidth?: (columnId: string) => void;
	onHideColumn?: (columnId: string) => void;
	onMoveColumn?: (fromColumnId: string, toColumnId: string) => void;
	onRemoveColumn?: (columnId: string) => void;
	onStartColumnDrag: (columnId: string) => void;
	onUpdateColumnHeader?: (columnId: string, header: string) => void;
	onUpdateColumnWidth?: (columnId: string, width: number) => void;
}) {
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const [isRenaming, setIsRenaming] = useState(false);
	const menuTriggerRef = useRef<HTMLButtonElement>(null);
	const menuRef = useRef<HTMLDivElement>(null);
	const [menuStyle, setMenuStyle] = useState<CSSProperties>({});
	const isAutoWidth = column.widthMode === "auto";
	const hasMenuActions = Boolean(
		onUpdateColumnHeader ||
			(isAutoWidth && onUpdateColumnWidth) ||
			onAutoColumnWidth ||
			onHideColumn ||
			onRemoveColumn,
	);

	useLayoutEffect(() => {
		if (!isMenuOpen || !menuTriggerRef.current) {
			return;
		}

		const rect = menuTriggerRef.current.getBoundingClientRect();
		const menuWidth = 144;
		const menuHeight = 112;
		const viewportPadding = 8;
		const left = Math.min(
			Math.max(viewportPadding, rect.right - menuWidth),
			window.innerWidth - menuWidth - viewportPadding,
		);
		const belowTop = rect.bottom + 6;
		const top =
			belowTop + menuHeight <= window.innerHeight - viewportPadding
				? belowTop
				: Math.max(viewportPadding, rect.top - menuHeight - 6);

		setMenuStyle({ left, top });
	}, [isMenuOpen]);

	useEffect(() => {
		if (!isMenuOpen) {
			return;
		}

		function closeMenu() {
			setIsMenuOpen(false);
		}

		function handlePointerDown(event: PointerEvent) {
			const target = event.target as Node;

			if (
				menuTriggerRef.current?.contains(target) ||
				menuRef.current?.contains(target)
			) {
				return;
			}

			closeMenu();
		}

		function handleKeyDown(event: KeyboardEvent) {
			if (event.key === "Escape") {
				closeMenu();
			}
		}

		document.addEventListener("pointerdown", handlePointerDown);
		document.addEventListener("keydown", handleKeyDown);
		window.addEventListener("resize", closeMenu);
		window.addEventListener("scroll", closeMenu, true);

		return () => {
			document.removeEventListener("pointerdown", handlePointerDown);
			document.removeEventListener("keydown", handleKeyDown);
			window.removeEventListener("resize", closeMenu);
			window.removeEventListener("scroll", closeMenu, true);
		};
	}, [isMenuOpen]);

	return (
		<div
			className={joinClasses(
				"relative flex min-h-9 w-full items-center",
				isRenaming ? "gap-0" : "gap-1.5",
			)}
		>
			{onMoveColumn && !isRenaming ? (
				<span
					draggable
					onDragStart={() => onStartColumnDrag(column.id)}
					title={`Drag ${column.header} column`}
					className="inline-flex h-8 w-5 shrink-0 cursor-grab items-center justify-center text-white/80 transition hover:text-white active:cursor-grabbing"
					aria-label={`Drag ${column.header} column`}
				>
					<GripVertical className="h-4 w-4" aria-hidden="true" />
				</span>
			) : null}
			{isRenaming && onUpdateColumnHeader ? (
				<ModuleDataEntryInlineRename
					label={column.header}
					variant="header"
					onCancel={() => setIsRenaming(false)}
					onRename={(nextHeader) => {
						onUpdateColumnHeader(column.id, nextHeader);
						setIsRenaming(false);
					}}
				/>
			) : (
				<span className="min-w-0 flex-1 truncate">{column.header}</span>
			)}
			{isRenaming || !hasMenuActions ? null : (
				<button
					ref={menuTriggerRef}
					type="button"
					onClick={() => setIsMenuOpen((current) => !current)}
					className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded border border-white/20 bg-white/10 text-white transition hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
					aria-label={`Open ${column.header} column options`}
					aria-expanded={isMenuOpen}
				>
					<MoreVertical className="h-3.5 w-3.5" aria-hidden="true" />
				</button>
			)}
			{!isRenaming && hasMenuActions && isMenuOpen && typeof document !== "undefined"
				? createPortal(
						<div
							ref={menuRef}
							style={menuStyle}
							className="fixed z-[130] grid min-w-36 gap-1 rounded-lg border border-darknavy/10 bg-white p-1.5 text-left text-darknavy shadow-[0_18px_46px_rgba(33,39,56,0.18)]"
						>
							{onUpdateColumnHeader ? (
								<button
									type="button"
									onClick={() => {
										setIsRenaming(true);
										setIsMenuOpen(false);
									}}
									className="flex h-8 w-full items-center gap-2 rounded px-2 text-xs font-semibold text-darknavy/70 transition hover:bg-skyblue/10 hover:text-darknavy"
								>
									<Pencil className="h-3.5 w-3.5" aria-hidden="true" />
									Rename
								</button>
							) : null}
							{isAutoWidth && onUpdateColumnWidth ? (
								<button
									type="button"
									onClick={() => {
										onUpdateColumnWidth(
											column.id,
											clampColumnWidth(column.width ?? 160),
										);
										setIsMenuOpen(false);
									}}
									className="flex h-8 items-center gap-2 rounded px-2 text-xs font-semibold text-darknavy/70 transition hover:bg-skyblue/10 hover:text-darknavy"
								>
									<Ruler className="h-3.5 w-3.5" aria-hidden="true" />
									Manual Width
								</button>
							) : onAutoColumnWidth ? (
								<button
									type="button"
									onClick={() => {
										onAutoColumnWidth(column.id);
										setIsMenuOpen(false);
									}}
									className="flex h-8 items-center gap-2 rounded px-2 text-xs font-semibold text-darknavy/70 transition hover:bg-skyblue/10 hover:text-darknavy"
								>
									<StretchHorizontal
										className="h-3.5 w-3.5"
										aria-hidden="true"
									/>
									Auto Width
								</button>
							) : null}
							{onHideColumn ? (
								<button
									type="button"
									disabled={!canRemove}
									onClick={() => {
										onHideColumn(column.id);
										setIsMenuOpen(false);
									}}
									className="flex h-8 items-center gap-2 rounded px-2 text-xs font-semibold text-darknavy/70 transition hover:bg-skyblue/10 hover:text-darknavy disabled:cursor-not-allowed disabled:opacity-40"
								>
									<EyeOff className="h-3.5 w-3.5" aria-hidden="true" />
									Hide
								</button>
							) : null}
							{onRemoveColumn ? (
								<button
									type="button"
									disabled={!canRemove}
									onClick={() => {
										onRemoveColumn(column.id);
										setIsMenuOpen(false);
									}}
									className="flex h-8 items-center gap-2 rounded px-2 text-xs font-semibold text-coralpink transition hover:bg-coralpink/10 disabled:cursor-not-allowed disabled:opacity-40"
								>
									<Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
									Remove
								</button>
							) : null}
						</div>,
						document.body,
					)
				: null}
			{!isRenaming && onUpdateColumnWidth && !isAutoWidth ? (
				<span
					role="separator"
					aria-orientation="vertical"
					aria-label={`Resize ${column.header} column`}
					title={`Drag to resize ${column.header}`}
					onDoubleClick={(event) => {
						event.preventDefault();
						event.stopPropagation();
						onFitColumnWidth?.(column.id);
					}}
					onPointerDown={(event) => {
						event.preventDefault();
						event.stopPropagation();
						const startX = event.clientX;
						const startWidth =
							column.width ??
							event.currentTarget.closest("th")?.getBoundingClientRect()
								.width ??
							160;

						function handlePointerMove(moveEvent: PointerEvent) {
							onUpdateColumnWidth?.(
								column.id,
								clampColumnWidth(startWidth + moveEvent.clientX - startX),
							);
						}

						function handlePointerUp() {
							document.removeEventListener("pointermove", handlePointerMove);
							document.removeEventListener("pointerup", handlePointerUp);
						}

						document.addEventListener("pointermove", handlePointerMove);
						document.addEventListener("pointerup", handlePointerUp);
					}}
					className="absolute -right-3 inset-y-[-0.5rem] z-70 w-2 cursor-col-resize touch-none transition hover:bg-citron/80"
				/>
			) : null}
		</div>
	);
}
