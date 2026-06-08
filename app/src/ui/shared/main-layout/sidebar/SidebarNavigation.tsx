import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type {
	MainNavigationItem,
	MainNavigationSection,
} from "@/app/src/data/shared/main-layout/MainLayoutTypes";
import { MainIcons, renderSidebarItemIcon } from "./SidebarIcons";
import {
	getVisibleCountToActiveItem,
	itemMatchesActiveHref,
	joinClasses,
	pathMatches,
	useIncrementalVisibleCount,
} from "@/app/src/ui/shared/main-layout/sidebar/utils";

const SectionInitialCount = 8;
const SectionBatchSize = 8;
const DashboardInitialCount = 3;
const DashboardBatchSize = 3;
const NestedInitialCount = 5;
const NestedBatchSize = 6;

type SidebarSectionProps = {
	activeHref: string;
	expandedKeys: string[];
	section: MainNavigationSection;
	onInteract: () => void;
	onNavigateFromSidebar: (href: string) => () => void;
	onToggleExpandedKey: (key: string) => void;
};

export function SidebarCategorySection({
	activeHref,
	expandedKeys,
	section,
	onInteract,
	onNavigateFromSidebar,
	onToggleExpandedKey,
}: SidebarSectionProps) {
	const Icon = MainIcons[section.icon];

	return (
		<section className="space-y-1.5">
			<div className="flex min-h-8 items-center gap-2 px-3 text-xs font-semibold uppercase tracking-[0.16em] text-darknavy/42">
				<Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
				<span className="min-w-0 truncate">{section.title}</span>
			</div>
			<div className="space-y-1">
				{section.items.map((item) => (
					<SidebarItem
						key={item.key}
						activeHref={activeHref}
						expandedKeys={expandedKeys}
						item={item}
						depth={0}
						onInteract={onInteract}
						onNavigateFromSidebar={onNavigateFromSidebar}
						onToggleExpandedKey={onToggleExpandedKey}
					/>
				))}
			</div>
		</section>
	);
}

export function SidebarSection({
	activeHref,
	expandedKeys,
	section,
	onInteract,
	onNavigateFromSidebar,
	onToggleExpandedKey,
}: SidebarSectionProps) {
	const Icon = MainIcons[section.icon];
	const directItem =
		section.href &&
		section.items.length === 1 &&
		section.items[0]?.href === section.href
			? section.items[0]
			: null;
	const isDirectActive = directItem
		? pathMatches(directItem.href, activeHref)
		: false;
	const isExpanded = expandedKeys.includes(section.key);
	const sectionInitialCount =
		section.key === "dashboard"
			? DashboardInitialCount
			: SectionInitialCount;
	const sectionBatchSize =
		section.key === "dashboard" ? DashboardBatchSize : SectionBatchSize;
	const activeItemVisibleCount = getVisibleCountToActiveItem(
		section.items,
		activeHref,
	);
	const [sectionVisibleCount, hasMoreSectionItems, setSectionSentinel] =
		useIncrementalVisibleCount(
			section.items.length,
			Math.max(sectionInitialCount, activeItemVisibleCount),
			sectionBatchSize,
			isExpanded,
		);
	const visibleSectionItems = section.items.slice(0, sectionVisibleCount);

	if (directItem) {
		return (
			<section>
				<Link
					href={directItem.href}
					onClick={onNavigateFromSidebar(directItem.href)}
					data-main-sidebar-active-item={
						isDirectActive ? "true" : undefined
					}
					className={joinClasses(
						"group relative flex min-h-10 w-full items-center gap-2 rounded-md px-3 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/35",
						isDirectActive
							? "bg-skyblue/14 text-darknavy hover:bg-skyblue/18"
							: "text-darknavy hover:bg-darknavy/5",
					)}
				>
					<Icon
						className={joinClasses(
							"h-4 w-4 shrink-0",
							isDirectActive
								? "text-skyblue"
								: "text-darknavy/65",
						)}
						aria-hidden="true"
					/>
					<span className="min-w-0 flex-1 truncate">
						{section.title}
					</span>
				</Link>
			</section>
		);
	}

	return (
		<section>
			<button
				type="button"
				onClick={() => {
					onInteract();
					onToggleExpandedKey(section.key);
				}}
				aria-expanded={isExpanded}
				className="flex min-h-10 w-full items-center gap-2 rounded-md px-3 text-left text-sm font-semibold text-darknavy transition hover:bg-darknavy/5 hover:text-darknavy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-darknavy/25"
			>
				<Icon
					className="h-4 w-4 shrink-0 text-darknavy/65"
					aria-hidden="true"
				/>
				<span className="min-w-0 flex-1 truncate">{section.title}</span>
				<ChevronRight
					className={joinClasses(
						"h-4 w-4 shrink-0 text-darknavy/45 transition",
						isExpanded && "rotate-90",
					)}
					aria-hidden="true"
				/>
			</button>

			<div
				aria-hidden={!isExpanded}
				className={joinClasses(
					"grid transition-[grid-template-rows,opacity] duration-300 ease-out motion-reduce:transition-none",
					isExpanded
						? "grid-rows-[1fr] opacity-100"
						: "grid-rows-[0fr] opacity-0",
				)}
			>
				<div className="min-h-0 overflow-hidden">
					<div className="mt-1 space-y-1">
						{visibleSectionItems.map((item) => (
							<SidebarItem
								key={item.key}
								activeHref={activeHref}
								expandedKeys={expandedKeys}
								item={item}
								depth={0}
								isInteractive={isExpanded}
								onInteract={onInteract}
								onNavigateFromSidebar={onNavigateFromSidebar}
								onToggleExpandedKey={onToggleExpandedKey}
							/>
						))}
						{hasMoreSectionItems ? (
							<div
								ref={setSectionSentinel}
								className="h-3"
								aria-hidden="true"
							/>
						) : null}
					</div>
				</div>
			</div>
		</section>
	);
}

type SidebarItemProps = {
	activeHref: string;
	depth: number;
	expandedKeys: string[];
	isInteractive?: boolean;
	item: MainNavigationItem;
	onInteract: () => void;
	onNavigateFromSidebar: (href: string) => () => void;
	onToggleExpandedKey: (key: string) => void;
};

export function SidebarItem({
	activeHref,
	depth,
	expandedKeys,
	isInteractive = true,
	item,
	onInteract,
	onNavigateFromSidebar,
	onToggleExpandedKey,
}: SidebarItemProps) {
	const hasChildren = Boolean(item.children?.length);
	const shouldShowIcon =
		hasChildren ||
		item.key === "maintenance-form-signatory" ||
		item.accessKey === "maintenance.party" ||
		item.accessKey === "maintenance.warehouse";
	const shouldShowModuleDot = !shouldShowIcon;
	const childItems = item.children ?? [];
	const isExpanded = expandedKeys.includes(item.key);
	const isExactActive = activeHref === item.href;
	const isDescendantActive =
		!isExactActive && activeHref.startsWith(`${item.href}/`);
	const hasActiveChild =
		hasChildren &&
		childItems.some((childItem) =>
			itemMatchesActiveHref(childItem, activeHref),
		);
	const isAncestorActive =
		hasChildren && !isExactActive && (isDescendantActive || hasActiveChild);
	const isActive = hasChildren
		? isExactActive || isDescendantActive || hasActiveChild
		: pathMatches(item.href, activeHref);
	const paddingClass =
		depth < 0
			? "px-3"
			: depth === 0
				? "pl-8 pr-3"
				: depth === 1
					? "pl-11 pr-3"
					: "pl-14 pr-3";
	const [childVisibleCount, hasMoreChildItems, setChildSentinel] =
		useIncrementalVisibleCount(
			childItems.length,
			Math.max(
				NestedInitialCount,
				getVisibleCountToActiveItem(childItems, activeHref),
			),
			NestedBatchSize,
			hasChildren && isExpanded,
		);
	const visibleChildItems = childItems.slice(0, childVisibleCount);

	if (hasChildren) {
		return (
			<div>
				<button
					type="button"
					tabIndex={isInteractive ? undefined : -1}
					onClick={() => {
						onInteract();
						onToggleExpandedKey(item.key);
					}}
					aria-expanded={isExpanded}
					data-main-sidebar-active-item={
						isExactActive ? "true" : undefined
					}
					className={joinClasses(
						"group relative flex min-h-9 w-full items-center gap-2 rounded-md py-2 text-left text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/35",
						paddingClass,
						isAncestorActive
							? "font-semibold text-darknavy hover:bg-skyblue/10"
							: isExactActive
								? "bg-skyblue/14 font-semibold text-darknavy hover:bg-skyblue/18"
								: "text-darknavy/70 hover:bg-skyblue/10 hover:text-darknavy",
					)}
				>
					{shouldShowIcon
						? renderSidebarItemIcon(
								item,
								isActive,
								isAncestorActive,
							)
						: null}
					<span className="min-w-0 flex-1 truncate">
						{item.label}
					</span>
					<ChevronRight
						className={joinClasses(
							"h-4 w-4 shrink-0 transition",
							isAncestorActive
								? "text-skyblue"
								: isExactActive
									? "text-skyblue"
									: "text-darknavy/40 group-hover:text-skyblue",
							isExpanded && "rotate-90",
						)}
						aria-hidden="true"
					/>
				</button>

				<div
					aria-hidden={!isExpanded}
					className={joinClasses(
						"grid transition-[grid-template-rows,opacity] duration-300 ease-out motion-reduce:transition-none",
						isExpanded
							? "grid-rows-[1fr] opacity-100"
							: "grid-rows-[0fr] opacity-0",
					)}
				>
					<div className="min-h-0 overflow-hidden">
						<div className="mt-1 space-y-1">
							{visibleChildItems.map((childItem) => (
								<SidebarItem
									key={childItem.key}
									activeHref={activeHref}
									expandedKeys={expandedKeys}
									item={childItem}
									depth={depth + 1}
									isInteractive={isInteractive && isExpanded}
									onInteract={onInteract}
									onNavigateFromSidebar={
										onNavigateFromSidebar
									}
									onToggleExpandedKey={onToggleExpandedKey}
								/>
							))}
							{hasMoreChildItems ? (
								<div
									ref={setChildSentinel}
									className="h-3"
									aria-hidden="true"
								/>
							) : null}
						</div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<Link
			href={item.href}
			tabIndex={isInteractive ? undefined : -1}
			onClick={onNavigateFromSidebar(item.href)}
			data-main-sidebar-active-item={isActive ? "true" : undefined}
			className={joinClasses(
				"group relative flex min-h-9 items-center gap-2 rounded-md py-2 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/35",
				paddingClass,
				depth < 0 && "font-semibold",
				isActive
					? "bg-skyblue/14 font-semibold text-darknavy hover:bg-skyblue/18"
					: "text-darknavy/65 hover:bg-skyblue/10 hover:text-darknavy",
			)}
		>
			{shouldShowIcon
				? renderSidebarItemIcon(item, isActive, false)
				: null}
			{shouldShowModuleDot ? (
				<span
					className={joinClasses(
						"h-1.5 w-1.5 shrink-0 rounded-full transition-colors group-hover:bg-skyblue",
						isActive
							? "bg-skyblue"
							: "bg-darknavy/30",
					)}
					aria-hidden="true"
				/>
			) : null}
			<span className="min-w-0 flex-1 truncate">{item.label}</span>
		</Link>
	);
}
