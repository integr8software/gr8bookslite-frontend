"use client";

import {
	useEffect,
	useLayoutEffect,
	useRef,
	useState,
	useCallback,
	type CSSProperties,
	type FocusEvent,
	type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";

type ModuleTooltipProps = {
	children: ReactNode;
	description?: ReactNode;
	title: ReactNode;
	align?: "center" | "end" | "start";
	className?: string;
	contentClassName?: string;
	position?: "bottom" | "top";
};

export function ModuleTooltip({
	align = "center",
	children,
	className,
	contentClassName,
	description,
	position = "bottom",
	title,
}: ModuleTooltipProps) {
	const [isVisible, setIsVisible] = useState(false);
	const [tooltipStyle, setTooltipStyle] = useState<CSSProperties>({
		left: 0,
		position: "fixed",
		top: 0,
		visibility: "hidden",
	});
	const wrapperRef = useRef<HTMLSpanElement>(null);
	const tooltipRef = useRef<HTMLSpanElement>(null);
	const portalElement =
		typeof document === "undefined" ? null : document.body;

	const updateTooltipPosition = useCallback(() => {
		const wrapperRect = wrapperRef.current?.getBoundingClientRect();
		const tooltipRect = tooltipRef.current?.getBoundingClientRect();

		if (!wrapperRect || !tooltipRect) {
			return;
		}

		const viewportPadding = 8;
		const gap = 8;
		const preferredLeft =
			align === "start"
				? wrapperRect.left
				: align === "end"
					? wrapperRect.right - tooltipRect.width
					: wrapperRect.left + wrapperRect.width / 2 - tooltipRect.width / 2;
		const preferredTop =
			position === "top"
				? wrapperRect.top - tooltipRect.height - gap
				: wrapperRect.bottom + gap;

		setTooltipStyle({
			left: Math.max(
				viewportPadding,
				Math.min(
					preferredLeft,
					window.innerWidth - tooltipRect.width - viewportPadding,
				),
			),
			position: "fixed",
			top: Math.max(
				viewportPadding,
				Math.min(
					preferredTop,
					window.innerHeight - tooltipRect.height - viewportPadding,
				),
			),
			visibility: "visible",
		});
	}, [align, position]);

	useLayoutEffect(() => {
		if (!isVisible) {
			return;
		}

		updateTooltipPosition();
	}, [isVisible, updateTooltipPosition]);

	useEffect(() => {
		if (!isVisible) {
			return;
		}

		function handleKeyDown(event: KeyboardEvent) {
			if (event.key === "Escape") {
				setIsVisible(false);
			}
		}

		window.addEventListener("resize", updateTooltipPosition);
		window.addEventListener("scroll", updateTooltipPosition, true);
		document.addEventListener("keydown", handleKeyDown);

		return () => {
			window.removeEventListener("resize", updateTooltipPosition);
			window.removeEventListener("scroll", updateTooltipPosition, true);
			document.removeEventListener("keydown", handleKeyDown);
		};
	}, [isVisible, updateTooltipPosition]);

	function handleBlur(event: FocusEvent<HTMLSpanElement>) {
		const nextTarget = event.relatedTarget;

		if (
			nextTarget instanceof Node &&
			wrapperRef.current?.contains(nextTarget)
		) {
			return;
		}

		setIsVisible(false);
	}

	return (
		<span
			ref={wrapperRef}
			className={joinClasses(
				"group/module-tooltip relative inline-flex",
				className,
			)}
			onBlur={handleBlur}
			onFocus={() => setIsVisible(true)}
			onMouseEnter={() => setIsVisible(true)}
			onMouseLeave={() => setIsVisible(false)}
		>
			{children}
			{isVisible && portalElement
				? createPortal(
						<span
							ref={tooltipRef}
							role="tooltip"
							style={tooltipStyle}
							className={joinClasses(
								"pointer-events-none z-[9999] w-max max-w-64 rounded-lg border border-darknavy/10 bg-white px-3 py-2 text-left opacity-100 shadow-[0_18px_50px_rgba(33,39,56,0.18)]",
								contentClassName,
							)}
						>
							<span className="block text-xs font-bold text-darknavy">
								{title}
							</span>
							{description ? (
								<span className="mt-1 block text-xs font-medium leading-5 text-darknavy/62">
									{description}
								</span>
							) : null}
						</span>,
						portalElement,
					)
				: null}
		</span>
	);
}
