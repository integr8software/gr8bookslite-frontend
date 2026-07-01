"use client";

import { type CSSProperties, type ReactNode } from "react";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";

const MinImportColumnWidth = 96;
const MaxImportColumnWidth = 640;

export function clampImportColumnWidth(width: number) {
	return Math.min(
		MaxImportColumnWidth,
		Math.max(MinImportColumnWidth, Math.round(width)),
	);
}

export function ModuleImportResizableColumnHeader({
	children,
	className,
	left,
	width,
	onResize,
}: {
	children: ReactNode;
	className?: string;
	left?: number;
	width: number;
	onResize: (width: number) => void;
}) {
	const stickyStyle: CSSProperties = left === undefined ? {} : { left };

	return (
		<th
			className={joinClasses(
				"module-import-preview-header sticky top-0 z-30 px-2 py-2",
				className,
			)}
			style={stickyStyle}
		>
			<div className="relative flex min-h-5 items-center pr-3">
				<span className="min-w-0 flex-1 truncate">{children}</span>
				<span
					role="separator"
					aria-orientation="vertical"
					aria-label={`Resize ${String(children)} column`}
					title={`Drag to resize ${String(children)}`}
					onPointerDown={(event) => {
						event.preventDefault();
						event.stopPropagation();

						const startX = event.clientX;
						const startWidth = width;

						function handlePointerMove(moveEvent: PointerEvent) {
							onResize(
								clampImportColumnWidth(
									startWidth + moveEvent.clientX - startX,
								),
							);
						}

						function handlePointerUp() {
							document.removeEventListener("pointermove", handlePointerMove);
							document.removeEventListener("pointerup", handlePointerUp);
						}

						document.addEventListener("pointermove", handlePointerMove);
						document.addEventListener("pointerup", handlePointerUp);
					}}
					className="absolute -right-2 inset-y-[-0.5rem] z-50 w-3 cursor-col-resize touch-none border-r border-transparent transition hover:border-skyblue hover:bg-skyblue/15"
				/>
			</div>
		</th>
	);
}
