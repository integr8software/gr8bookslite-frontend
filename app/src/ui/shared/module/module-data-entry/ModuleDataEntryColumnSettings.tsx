"use client";

import { ChevronDown, Check, Eye, EyeOff, GripVertical, Pencil, Settings2, X } from "lucide-react";
import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { isDropAfter } from "@/app/src/ui/shared/module/module-data-entry/utils";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";
import type { ModuleDataEntryColumnSettingsButtonProps } from "@/app/src/types/shared/module/module-data-entry/DataEntryTypes";

export function ModuleDataEntryColumnSettingsButton({
  align = "left",
  columns,
  columnResetLabel = "Default",
  onMoveColumn,
  onResetColumns,
  onToggleColumnVisibility,
  onUpdateColumnHeader,
}: ModuleDataEntryColumnSettingsButtonProps) {
	const triggerRef = useRef<HTMLDivElement>(null);
	const [isOpen, setIsOpen] = useState(false);
	const [draggedColumnId, setDraggedColumnId] = useState<string | null>(null);
	const [dropTargetColumnId, setDropTargetColumnId] = useState<string | null>(
		null,
	);
	const [menuStyle, setMenuStyle] = useState<CSSProperties>({});
	const visibleColumnCount = columns.filter((column) => column.isVisible).length;
	const canToggleColumns = Boolean(onToggleColumnVisibility);
	const hideableColumns = columns.filter((column) => column.isHideable !== false);
	const visibleHideableColumns = hideableColumns.filter(
		(column) => column.isVisible,
	);
	const hiddenColumns = columns.filter((column) => !column.isVisible);
	const hasVisibleHideableColumns = visibleHideableColumns.length > 0;
	const hasHiddenColumns = hiddenColumns.length > 0;
	const isDefaultColumnsActive =
		hideableColumns.length > 0 && visibleHideableColumns.length === 0;
	const isShowAllColumnsActive = columns.length > 0 && hiddenColumns.length === 0;

	function restoreDefaultColumns() {
		if (!onToggleColumnVisibility) {
			return;
		}

    visibleHideableColumns.forEach((column) => {
      onToggleColumnVisibility(column.id, false);
    });
  }

	function handleShowAllColumns() {
		if (!onToggleColumnVisibility) {
			return;
		}

    hiddenColumns.forEach((column) => {
      onToggleColumnVisibility(column.id, true);
    });
  }

  function resetColumns() {
    onResetColumns?.();
  }

  useLayoutEffect(() => {
    if (!isOpen || !triggerRef.current) {
      return;
    }

    const rect = triggerRef.current.getBoundingClientRect();
    const menuWidth = 360;
    const viewportPadding = 8;
    const preferredHeight = Math.min(480, 132 + columns.length * 50);
    const left =
      align === "right"
        ? Math.min(
            Math.max(viewportPadding, rect.right - menuWidth),
            window.innerWidth - menuWidth - viewportPadding,
          )
        : Math.min(
            Math.max(viewportPadding, rect.left),
            window.innerWidth - menuWidth - viewportPadding,
          );
    const belowTop = rect.bottom + 6;
    const availableBelow = window.innerHeight - belowTop - viewportPadding;
    const availableAbove = rect.top - viewportPadding - 6;
    const opensBelow = availableBelow >= 260 || availableBelow >= availableAbove;
    const availableHeight = Math.max(160, opensBelow ? availableBelow : availableAbove);
    const maxHeight = Math.min(preferredHeight, availableHeight);
    const top = opensBelow ? belowTop : Math.max(viewportPadding, rect.top - maxHeight - 6);

    setMenuStyle({ left, maxHeight, top });
  }, [align, columns.length, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function closeMenu() {
      setIsOpen(false);
    }

    function handlePointerDown(event: PointerEvent) {
      const target = event.target as Node;

      if (
        triggerRef.current?.contains(target) ||
        (target instanceof Element && target.closest("[data-column-settings-menu]"))
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

    function handleScroll(event: Event) {
      const target = event.target as Node;

      if (
        triggerRef.current?.contains(target) ||
        (target instanceof Element && target.closest("[data-column-settings-menu]"))
      ) {
        return;
      }

      closeMenu();
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", closeMenu);
    window.addEventListener("scroll", handleScroll, true);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", closeMenu);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [isOpen]);

	return (
		<div ref={triggerRef} className="relative inline-flex">
			<button
				type="button"
				onClick={() => setIsOpen((current) => !current)}
				className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md border border-skyblue/20 bg-white px-3 text-xs font-semibold text-skyblue shadow-sm transition hover:border-skyblue/35 hover:bg-skyblue/8 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-skyblue/20"
				aria-expanded={isOpen}
				aria-haspopup="menu"
			>
				<Settings2 className="h-4 w-4" aria-hidden="true" />
				Column
				<ChevronDown
					className={joinClasses("h-4 w-4 transition", isOpen && "rotate-180")}
					aria-hidden="true"
				/>
			</button>
			{isOpen && typeof document !== "undefined"
				? createPortal(
						<div
							data-column-settings-menu
							role="menu"
							style={menuStyle}
							className="fixed z-130 flex w-[22.5rem] flex-col overflow-hidden rounded-lg border border-darknavy/10 bg-white p-2 text-left shadow-[0_18px_46px_rgba(33,39,56,0.18)]"
						>
							<div className="shrink-0 border-b border-darknavy/10 px-2 pb-2 pt-1">
								<div className="flex h-8 items-center justify-between gap-3">
									<p className="min-w-0 text-xs font-semibold uppercase text-darknavy/45">
										Visible Columns
									</p>
									<div className="inline-flex shrink-0 items-center gap-5">
										<button
											type="button"
											disabled={!canToggleColumns}
											onClick={handleShowAllColumns}
											className={joinClasses(
												"text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/20 disabled:cursor-not-allowed disabled:text-darknavy/25",
												isShowAllColumnsActive
													? "text-coralpink"
													: "text-coralpink/75 hover:text-coralpink",
											)}
											aria-label="Show all columns"
										>
											Show All
										</button>
										<button
											type="button"
											disabled={!canToggleColumns}
											onClick={restoreDefaultColumns}
											className={joinClasses(
												"text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/20 disabled:cursor-not-allowed disabled:text-darknavy/25",
												isDefaultColumnsActive
													? "text-darknavy/45"
													: "text-darknavy/50 hover:text-coralpink",
											)}
											aria-label="Restore default columns"
										>
											Default
										</button>
									</div>
								</div>
							</div>
							<div className="grid min-h-0 gap-2 overflow-y-auto pr-1">
								{columns.map((column) => {
									const canHide =
										Boolean(onToggleColumnVisibility) &&
										column.isHideable !== false &&
										(!column.isVisible || visibleColumnCount > 1);
									return (
										<div
											key={column.id}
											onDragEnd={() => {
												setDraggedColumnId(null);
												setDropTargetColumnId(null);
											}}
											onDragOver={(event) => {
												if (
													draggedColumnId &&
													draggedColumnId !== column.id
												) {
													event.preventDefault();
													setDropTargetColumnId(column.id);
												}
											}}
											onDrop={() => {
												if (
													draggedColumnId &&
													draggedColumnId !== column.id &&
													onMoveColumn
												) {
													onMoveColumn(draggedColumnId, column.id);
												}

                        setDraggedColumnId(null);
                        setDropTargetColumnId(null);
                      }}
                      className={joinClasses(
                        "app-theme-field-readonly grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 rounded-md border px-2 py-2 transition",
                        draggedColumnId === column.id && "opacity-60",
                        dropTargetColumnId === column.id &&
                          (isDropAfter(
                            draggedColumnId,
                            column.id,
                            columns.map((item) => item.id),
                          )
                            ? "border-b-4 border-b-coralpink"
                            : "border-t-4 border-t-coralpink"),
                      )}
                    >
                      <span
                        draggable={Boolean(onMoveColumn)}
                        onDragStart={() => setDraggedColumnId(column.id)}
                        title={`Drag ${column.label} column`}
                        className={joinClasses(
                          "inline-flex h-8 w-5 items-center justify-center text-darknavy/45",
                          onMoveColumn &&
                            "cursor-grab transition hover:text-darknavy active:cursor-grabbing",
                        )}
                      >
                        <GripVertical className="h-4 w-4" aria-hidden="true" />
                      </span>
                      <InlineColumnName
                        label={column.label}
                        canHide={canHide}
                        isVisible={column.isVisible}
                        onToggleVisibility={
                          onToggleColumnVisibility
                            ? () => onToggleColumnVisibility(column.id, !column.isVisible)
                            : undefined
                        }
                        onRename={
                          onUpdateColumnHeader
                            ? (nextLabel) => onUpdateColumnHeader(column.id, nextLabel)
                            : undefined
                        }
                      />
                    </div>
                  );
                })}
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}

function InlineColumnName({
  canHide,
  isVisible,
  label,
  onRename,
  onToggleVisibility,
}: {
  canHide: boolean;
  isVisible: boolean;
  label: string;
  onRename?: (label: string) => void;
  onToggleVisibility?: () => void;
}) {
  const [isRenaming, setIsRenaming] = useState(false);
  const [draftLabel, setDraftLabel] = useState(label);

  function startRenaming() {
    setDraftLabel(label);
    setIsRenaming(true);
  }

  function cancelRenaming() {
    setDraftLabel(label);
    setIsRenaming(false);
  }

  function saveRenaming() {
    const nextLabel = draftLabel.trim();

    if (nextLabel) {
      onRename?.(nextLabel);
    }

    setIsRenaming(false);
  }

  return (
    <div className="contents">
      {isRenaming && onRename ? (
        <input
          autoFocus
          id={`module-data-entry-column-settings-rename-${sanitizeColumnSettingsFieldId(label)}`}
          name="moduleDataEntryColumnSettingsRename"
          type="text"
          value={draftLabel}
          onChange={(event) => setDraftLabel(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              saveRenaming();
            }

            if (event.key === "Escape") {
              event.preventDefault();
              cancelRenaming();
            }
          }}
          className="app-theme-field h-8 min-w-0 rounded-md border px-2 text-sm font-semibold text-darknavy outline-none transition focus:border-skyblue/40 focus:ring-2 focus:ring-skyblue/15"
          aria-label={`Rename ${label} column`}
        />
      ) : (
        <span className="min-w-0 truncate text-sm font-semibold text-darknavy">{label}</span>
      )}
      <div className="flex h-8 items-center justify-end gap-1">
        {isRenaming && onRename ? (
          <>
            <button
              type="button"
              onClick={saveRenaming}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-skyblue/25 bg-skyblue/10 text-skyblue transition hover:bg-skyblue/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/20"
              aria-label={`Save ${label} column name`}
              title="Save"
            >
              <Check className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={cancelRenaming}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-darknavy/10 bg-white text-darknavy/60 transition hover:bg-offwhite focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/20"
              aria-label={`Cancel editing ${label} column name`}
              title="Cancel"
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              disabled={!canHide}
              onClick={onToggleVisibility}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-darknavy/10 bg-white text-darknavy/55 transition hover:border-skyblue/25 hover:bg-skyblue/10 hover:text-skyblue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/20 disabled:cursor-not-allowed disabled:opacity-40"
              aria-pressed={isVisible}
              aria-label={`${isVisible ? "Hide" : "Show"} ${label} column`}
              title={isVisible ? "Hide column" : "Show column"}
            >
              {isVisible ? (
                <Eye className="h-3.5 w-3.5" aria-hidden="true" />
              ) : (
                <EyeOff className="h-3.5 w-3.5" aria-hidden="true" />
              )}
            </button>
            {onRename ? (
              <button
                type="button"
                onClick={startRenaming}
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-darknavy/10 bg-white text-darknavy/55 transition hover:border-skyblue/25 hover:bg-skyblue/10 hover:text-skyblue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/20"
                aria-label={`Edit ${label} column`}
                title={`Edit ${label} column`}
              >
                <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}

function sanitizeColumnSettingsFieldId(value: string) {
  return value.replace(/[^a-zA-Z0-9_-]/g, "-");
}
