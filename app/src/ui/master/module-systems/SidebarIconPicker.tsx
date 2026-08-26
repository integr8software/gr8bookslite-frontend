"use client";

import {
	createElement,
	useCallback,
	useEffect,
	useRef,
	useState,
} from "react";
import { createPortal } from "react-dom";
import type { SidebarIconPickerProps } from "@/app/src/types/master/module-systems/MasterModuleSystemTypes";
import { SidebarAllowedIcons } from "@/app/src/ui/shared/main-layout/sidebar/SidebarIcons";
import { joinClasses } from "@/app/src/ui/shared/main-layout/sidebar/utils";

export function SidebarIconPicker({
	defaultIconKind,
	icon: Icon,
	label,
	onChange,
	value,
}: SidebarIconPickerProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [popoverPosition, setPopoverPosition] = useState<{
		left: number;
		top: number;
	} | null>(null);
	const buttonRef = useRef<HTMLButtonElement | null>(null);
	const menuRef = useRef<HTMLDivElement | null>(null);
	const iconEntries = Object.entries(SidebarAllowedIcons).sort(
		([first], [second]) => first.localeCompare(second),
	);
	const updatePopoverPosition = useCallback(() => {
		const rect = buttonRef.current?.getBoundingClientRect();
		if (!rect) {
			setIsOpen(false);
			setPopoverPosition(null);
			return;
		}
		const width = 176;
		const height = 208;
		const left = Math.min(
			Math.max(8, rect.left),
			Math.max(8, window.innerWidth - width - 8),
		);
		const belowTop = rect.bottom + 6;
		const top =
			belowTop + height > window.innerHeight
				? Math.max(8, rect.top - height - 6)
				: belowTop;
		setPopoverPosition({ left, top });
	}, []);
	const openMenu = () => {
		updatePopoverPosition();
		setIsOpen(true);
	};
	const closeMenu = useCallback(() => {
		setIsOpen(false);
		setPopoverPosition(null);
	}, []);

	useEffect(() => {
		if (!isOpen) return;
		const handlePointerDown = (event: PointerEvent) => {
			const target = event.target;
			if (!(target instanceof Node)) return;
			if (
				buttonRef.current?.contains(target) ||
				menuRef.current?.contains(target)
			) {
				return;
			}
			closeMenu();
		};
		const handleViewportChange = () => updatePopoverPosition();
		document.addEventListener("pointerdown", handlePointerDown);
		window.addEventListener("resize", handleViewportChange);
		window.addEventListener("scroll", handleViewportChange, true);
		return () => {
			document.removeEventListener("pointerdown", handlePointerDown);
			window.removeEventListener("resize", handleViewportChange);
			window.removeEventListener("scroll", handleViewportChange, true);
		};
	}, [closeMenu, isOpen, updatePopoverPosition]);

	return (
		<div className="h-7 w-7 shrink-0">
			<button
				ref={buttonRef}
				type="button"
				title="Change icon"
				aria-label={`Change icon for ${label}`}
				onClick={() => (isOpen ? closeMenu() : openMenu())}
				className={joinClasses(
					"grid h-7 w-7 place-items-center rounded text-darknavy/60 transition hover:bg-darknavy/5 hover:text-skyblue",
					isOpen && "bg-skyblue/10 text-skyblue",
				)}
			>
				{Icon ? (
					createElement(Icon, { className: "h-4 w-4" })
				) : defaultIconKind === "folder" ? (
					createElement(SidebarAllowedIcons.folder, { className: "h-4 w-4" })
				) : (
					<span
						aria-hidden="true"
						className="h-1.5 w-1.5 rounded-full bg-current"
					/>
				)}
			</button>
			{isOpen && popoverPosition && typeof document !== "undefined"
				? createPortal(
				<div
					ref={menuRef}
					style={{
						left: popoverPosition.left,
						top: popoverPosition.top,
					}}
					className="fixed z-50 grid max-h-52 w-44 grid-cols-5 gap-1 overflow-y-auto overflow-x-hidden rounded-md border border-darknavy/10 bg-white p-2 shadow-[0_14px_35px_rgba(33,39,56,0.16)]"
				>
					<button
						type="button"
						title="Default"
						aria-label="Default icon"
						onClick={() => {
							onChange(null);
							closeMenu();
						}}
						className={joinClasses(
							"grid h-7 w-7 place-items-center rounded border text-darknavy/55 hover:bg-skyblue/8",
							value === ""
								? "border-skyblue bg-skyblue/10 text-skyblue"
								: "border-transparent",
						)}
					>
						{defaultIconKind === "folder" ? (
							createElement(SidebarAllowedIcons.folder, { className: "h-4 w-4" })
						) : (
							<span
								aria-hidden="true"
								className="h-1.5 w-1.5 rounded-full bg-current"
							/>
						)}
					</button>
					{iconEntries.map(([iconName, IconComponent]) => (
						<button
							key={iconName}
							type="button"
							title={iconName}
							aria-label={iconName}
							onClick={() => {
								onChange(iconName);
								closeMenu();
							}}
							className={joinClasses(
								"grid h-7 w-7 place-items-center rounded border text-darknavy/55 hover:bg-skyblue/8",
								value === iconName
									? "border-skyblue bg-skyblue/10 text-skyblue"
									: "border-transparent",
							)}
						>
							<IconComponent className="h-4 w-4" />
						</button>
					))}
				</div>,
				document.body,
			)
				: null}
		</div>
	);
}
