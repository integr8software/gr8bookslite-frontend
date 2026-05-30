"use client";

import {
	useCallback,
	useEffect,
	useLayoutEffect,
	useRef,
	useState,
	type CSSProperties,
} from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { MoreHorizontal, type LucideIcon } from "lucide-react";
import {
	joinClasses,
	moduleAccentClassNames,
} from "@/app/src/ui/shared/module/module-table/utils";

type ModuleActionMenuTone = "default" | "danger";

type BaseModuleActionMenuItem = {
	icon: LucideIcon;
	label: string;
	tone?: ModuleActionMenuTone;
};

export type ModuleActionMenuItem =
	| (BaseModuleActionMenuItem & {
		href: string;
		onSelect?: () => void;
		type: "link";
	})
	| (BaseModuleActionMenuItem & {
		disabled?: boolean;
		onSelect: () => void;
		type: "button";
	});

type ModuleActionMenuProps = {
	items: ModuleActionMenuItem[];
	label: string;
	className?: string;
};

const MenuWidth = 176;
const ViewportPadding = 8;
const MenuGap = 6;

export function ModuleActionMenu({
	className,
	items,
	label,
}: ModuleActionMenuProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [menuStyle, setMenuStyle] = useState<CSSProperties>({});
	const triggerRef = useRef<HTMLButtonElement>(null);
	const menuRef = useRef<HTMLDivElement>(null);

	const updateMenuPosition = useCallback(() => {
		const trigger = triggerRef.current;

		if (!trigger) {
			return;
		}

		const triggerRect = trigger.getBoundingClientRect();
		const menuWidth = MenuWidth;
		const menuHeight = menuRef.current?.offsetHeight ?? items.length * 44 + 12;
		const viewportWidth = window.innerWidth;
		const viewportHeight = window.innerHeight;
		const left = Math.min(
			Math.max(ViewportPadding, triggerRect.right - menuWidth),
			viewportWidth - menuWidth - ViewportPadding,
		);
		const opensBelow =
			triggerRect.bottom + MenuGap + menuHeight <=
			viewportHeight - ViewportPadding;
		const top = opensBelow
			? triggerRect.bottom + MenuGap
			: Math.max(ViewportPadding, triggerRect.top - menuHeight - MenuGap);

		setMenuStyle({
			left,
			top,
		});
	}, [items.length]);

	useLayoutEffect(() => {
		if (!isOpen) {
			return;
		}

		updateMenuPosition();
	}, [isOpen, updateMenuPosition]);

	useEffect(() => {
		if (!isOpen) {
			return;
		}

		function handlePointerDown(event: PointerEvent) {
			const target = event.target as Node;

			if (
				triggerRef.current?.contains(target) ||
				menuRef.current?.contains(target)
			) {
				return;
			}

			setIsOpen(false);
		}

		function handleKeyDown(event: KeyboardEvent) {
			if (event.key === "Escape") {
				setIsOpen(false);
			}
		}

		document.addEventListener("pointerdown", handlePointerDown);
		document.addEventListener("keydown", handleKeyDown);
		window.addEventListener("resize", updateMenuPosition);
		window.addEventListener("scroll", updateMenuPosition, true);

		return () => {
			document.removeEventListener("pointerdown", handlePointerDown);
			document.removeEventListener("keydown", handleKeyDown);
			window.removeEventListener("resize", updateMenuPosition);
			window.removeEventListener("scroll", updateMenuPosition, true);
		};
	}, [isOpen, updateMenuPosition]);

	return (
		<div className={joinClasses("flex justify-end", className)}>
			<button
				ref={triggerRef}
				type="button"
				aria-expanded={isOpen}
				aria-haspopup="menu"
				aria-label={label}
				onClick={() => setIsOpen((current) => !current)}
				className={joinClasses(
					"inline-flex h-9 w-9 items-center justify-center rounded-md border border-darknavy/10 bg-white text-darknavy/70 transition hover:text-darknavy focus-visible:outline-none focus-visible:ring-2",
					moduleAccentClassNames.hoverSoftBackground,
					moduleAccentClassNames.focusRing,
				)}
			>
				<MoreHorizontal className="h-4 w-4" aria-hidden="true" />
			</button>
			{isOpen && typeof document !== "undefined"
				? createPortal(
						<div
							ref={menuRef}
							role="menu"
							style={menuStyle}
							className="fixed z-[80] grid w-44 gap-1 rounded-lg border border-darknavy/10 bg-white p-1.5 text-left shadow-[0_18px_46px_rgba(33,39,56,0.18)]"
						>
							{items.map((item) => (
								<ModuleActionMenuItemView
									key={item.label}
									item={item}
									onClose={() => setIsOpen(false)}
								/>
							))}
						</div>,
						document.body,
					)
				: null}
		</div>
	);
}

function ModuleActionMenuItemView({
	item,
	onClose,
}: {
	item: ModuleActionMenuItem;
	onClose: () => void;
}) {
	const Icon = item.icon;
	const itemClassName = joinClasses(
		"flex min-h-10 w-full items-center gap-3 whitespace-nowrap rounded-md px-3 text-left text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2",
		moduleAccentClassNames.focusRing,
		item.tone === "danger"
			? "text-coralpink hover:bg-coralpink/10"
			: joinClasses(
				"text-darknavy/72 hover:text-darknavy",
				moduleAccentClassNames.hoverSoftBackground,
			),
		item.type === "button" &&
		item.disabled &&
		"cursor-not-allowed opacity-45 hover:bg-transparent",
	);
	const iconClassName = joinClasses(
		"h-4 w-4 shrink-0",
		item.tone === "danger" ? "text-coralpink" : "text-darknavy/50",
	);

	if (item.type === "link") {
		return (
			<Link
				href={item.href}
				role="menuitem"
				className={itemClassName}
				onClick={() => {
					onClose();
					item.onSelect?.();
				}}
			>
				<Icon className={iconClassName} aria-hidden="true" />
				{item.label}
			</Link>
		);
	}

	return (
		<button
			type="button"
			role="menuitem"
			disabled={item.disabled}
			onClick={() => {
				onClose();
				item.onSelect();
			}}
			className={itemClassName}
		>
			<Icon className={iconClassName} aria-hidden="true" />
			{item.label}
		</button>
	);
}
