import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { useSortable, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useApprovalAlertStore } from "@/app/src/hooks/modules/approval-management/useApprovalAlertStore";
import { useIncrementalVisibleCount } from "@/app/src/hooks/shared/main-layout/sidebar/useIncrementalVisibleCount";
import type {
	MainNavigationItem,
	MainNavigationSection,
} from "@/app/src/types/shared/main-layout/MainLayoutDomainTypes";
import {
	MainIcons,
	SidebarAllowedIcons,
	hasSidebarItemIcon,
	renderSidebarItemIcon,
} from "./SidebarIcons";
import {
	getVisibleCountToActiveItem,
	itemMatchesActiveHref,
	joinClasses,
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
	isDraggable?: boolean;
	onInteract: () => void;
	onNavigateFromSidebar: (href: string) => () => void;
	onToggleExpandedKey: (key: string) => void;
};

export function SidebarCategorySection({
	activeHref,
	expandedKeys,
	section,
	isDraggable = false,
	onInteract,
	onNavigateFromSidebar,
	onToggleExpandedKey,
}: SidebarSectionProps) {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({ id: section.key, disabled: !isDraggable });

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
	};

	const Icon = MainIcons[section.icon];
	const hasActiveItem = section.items.some((item) =>
		itemMatchesActiveHref(item, activeHref),
	);

	return (
		<section
			ref={setNodeRef}
			style={style}
			className={joinClasses("space-y-1.5 transition-opacity", isDragging && "opacity-40")}
		>
			<div
				{...(isDraggable ? { ...attributes, ...listeners } : {})}
				data-main-sidebar-active-ancestor={
					hasActiveItem ? "true" : undefined
				}
				className={joinClasses(
					"flex min-h-8 select-none items-center gap-2 rounded-md px-3 text-xs font-semibold uppercase tracking-[0.16em]",
					isDraggable && "cursor-pointer active:cursor-grabbing",
					hasActiveItem
						? "bg-skyblue/8 text-darknavy"
						: "text-darknavy/42",
				)}
			>
				<Icon
					className={joinClasses(
						"h-3.5 w-3.5 shrink-0",
						hasActiveItem ? "text-skyblue" : "text-darknavy/42",
					)}
					aria-hidden="true"
				/>
				<span className="min-w-0 flex-1 truncate">{section.title}</span>
			</div>
			<SortableContext
				items={section.items.map((item) => item.key)}
				strategy={verticalListSortingStrategy}
			>
				<div className="space-y-1">
					{section.items.map((item) => (
						<SidebarItem
							key={item.key}
							activeHref={activeHref}
							expandedKeys={expandedKeys}
							item={item}
							depth={0}
							isDraggable={isDraggable}
							onInteract={onInteract}
							onNavigateFromSidebar={onNavigateFromSidebar}
							onToggleExpandedKey={onToggleExpandedKey}
						/>
					))}
				</div>
			</SortableContext>
		</section>
	);
}

export function SidebarSection({
	activeHref,
	expandedKeys,
	section,
	isDraggable = true,
	onInteract,
	onNavigateFromSidebar,
	onToggleExpandedKey,
}: SidebarSectionProps) {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({ id: section.key, disabled: !isDraggable });

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
	};

	const pendingApprovalCount = useApprovalAlertStore(
		(state) => state.pendingApprovalCount,
	);
	const Icon = MainIcons[section.icon];
	const directItem =
		section.href &&
		section.items.length === 1 &&
		section.items[0]?.href === section.href
			? section.items[0]
			: null;
	const SectionIcon =
		section.iconName === null
			? directItem
				? SidebarAllowedIcons.link
				: SidebarAllowedIcons.folder
			: section.iconName
				? SidebarAllowedIcons[section.iconName] ?? Icon
				: Icon;
	const isDirectActive = directItem
		? directItem.href === activeHref
		: false;
	const hasActiveItem =
		!directItem &&
		section.items.some((item) => itemMatchesActiveHref(item, activeHref));
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
	const visibleSectionItems = isDraggable
		? section.items
		: section.items.slice(0, sectionVisibleCount);
	const showPendingApprovalCount =
		section.key === "approval-management" && pendingApprovalCount > 0;

	if (directItem) {
		return (
			<section
				ref={setNodeRef}
				style={style}
				className={joinClasses("relative transition-opacity", isDragging && "opacity-40")}
			>
				<Link
					href={directItem.href}
					draggable={false}
					onDragStart={(e) => e.preventDefault()}
					{...(isDraggable ? { ...attributes, ...listeners } : {})}
					onClick={onNavigateFromSidebar(directItem.href)}
					data-main-sidebar-active-item={
						isDirectActive ? "true" : undefined
					}
					className={joinClasses(
						"group relative flex min-h-10 w-full select-none items-center gap-2 rounded-md px-3 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/35",
						isDraggable && "cursor-pointer active:cursor-grabbing",
						isDirectActive
							? "bg-skyblue/14 text-darknavy hover:bg-skyblue/18"
							: "text-darknavy hover:bg-darknavy/5",
					)}
				>
					<SectionIcon
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
		<section
			ref={setNodeRef}
			style={style}
			className={joinClasses("relative transition-opacity", isDragging && "opacity-40")}
		>
			<button
				type="button"
				{...(isDraggable ? { ...attributes, ...listeners } : {})}
				onClick={() => {
					onInteract();
					onToggleExpandedKey(section.key);
				}}
				aria-expanded={isExpanded}
				data-main-sidebar-active-ancestor={
					hasActiveItem ? "true" : undefined
				}
				className={joinClasses(
					"flex min-h-10 w-full select-none items-center gap-2 rounded-md px-3 text-left text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-darknavy/25",
					isDraggable && "cursor-pointer active:cursor-grabbing",
					hasActiveItem
						? "bg-skyblue/10 text-darknavy hover:bg-skyblue/14"
						: "text-darknavy hover:bg-darknavy/5 hover:text-darknavy",
				)}
			>
				<SectionIcon
					className={joinClasses(
						"h-4 w-4 shrink-0",
						hasActiveItem ? "text-skyblue" : "text-darknavy/65",
					)}
					aria-hidden="true"
				/>
				<span className="min-w-0 flex-1 truncate">{section.title}</span>
				{showPendingApprovalCount ? (
					<PendingApprovalBadge count={pendingApprovalCount} />
				) : null}
				<ChevronRight
					className={joinClasses(
						"h-4 w-4 shrink-0 transition",
						hasActiveItem ? "text-skyblue" : "text-darknavy/45",
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
					<SortableContext
						items={section.items.map((item) => item.key)}
						strategy={verticalListSortingStrategy}
					>
						<div className="mt-1 space-y-1">
							{visibleSectionItems.map((item) => (
								<SidebarItem
									key={item.key}
									activeHref={activeHref}
									expandedKeys={expandedKeys}
									item={item}
									depth={0}
									isDraggable={isDraggable}
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
					</SortableContext>
				</div>
			</div>
		</section>
	);
}

type SidebarItemProps = {
	activeHref: string;
	depth: number;
	expandedKeys: string[];
	isDraggable?: boolean;
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
	isDraggable = true,
	isInteractive = true,
	item,
	onInteract,
	onNavigateFromSidebar,
	onToggleExpandedKey,
}: SidebarItemProps) {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({ id: item.key, disabled: !isDraggable });

	const { tabIndex: _sortableTabIndex, ...sortableAttributes } = attributes;

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
	};

	const pendingApprovalCount = useApprovalAlertStore(
		(state) => state.pendingApprovalCount,
	);
	const showPendingApprovalCount =
		item.key === "approval-management-transactions" &&
		pendingApprovalCount > 0;
	const hasChildren = Boolean(item.children?.length);
	const hasNoIcon = item.iconName === null;
	const shouldShowDefaultFolder = hasNoIcon && hasChildren;
	const shouldShowDefaultFile = hasNoIcon && !hasChildren && depth < 0;
	const shouldShowIcon =
		hasNoIcon
			? shouldShowDefaultFolder || shouldShowDefaultFile
			: hasChildren ||
				hasSidebarItemIcon(item) ||
				item.key === "system-administration-form-signatory" ||
				item.accessKey === "maintenance.party" ||
				(item.accessKey === "maintenance.warehouse" && depth === 0);
	const shouldShowModuleDot = hasNoIcon
		? !shouldShowDefaultFolder && !shouldShowDefaultFile
		: !shouldShowIcon;
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
		: isExactActive;
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
	const visibleChildItems = isDraggable
		? childItems
		: childItems.slice(0, childVisibleCount);

	if (hasChildren) {
		return (
			<div
				ref={setNodeRef}
				style={style}
				className={joinClasses(
					"relative rounded-md transition-opacity",
					isDragging && "opacity-40",
				)}
			>
				<button
					type="button"
					tabIndex={isInteractive ? undefined : -1}
					{...(isDraggable ? { ...sortableAttributes, ...listeners } : {})}
					onClick={() => {
						onInteract();
						onToggleExpandedKey(item.key);
					}}
					aria-expanded={isExpanded}
					data-main-sidebar-active-item={
						isExactActive ? "true" : undefined
					}
					data-main-sidebar-active-ancestor={
						isAncestorActive ? "true" : undefined
					}
					className={joinClasses(
						"group relative flex min-h-9 w-full select-none items-center gap-2 rounded-md py-2 text-left text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/35",
						paddingClass,
						isDraggable && "cursor-pointer active:cursor-grabbing",
						isAncestorActive
							? depth <= 0
								? "bg-skyblue/8 font-semibold text-darknavy hover:bg-skyblue/12"
								: "bg-skyblue/5 font-semibold text-darknavy hover:bg-skyblue/10"
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
					{shouldShowModuleDot ? (
						<SidebarModuleDot isActive={isActive || isAncestorActive} />
					) : null}
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
						<SortableContext
							items={childItems.map((child) => child.key)}
							strategy={verticalListSortingStrategy}
						>
							<div className="mt-1 space-y-1">
								{visibleChildItems.map((childItem) => (
									<SidebarItem
										key={childItem.key}
										activeHref={activeHref}
										expandedKeys={expandedKeys}
										item={childItem}
										depth={depth + 1}
										isDraggable={isDraggable}
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
						</SortableContext>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div
			ref={setNodeRef}
			style={style}
			className={joinClasses(
				"relative rounded-md transition-opacity",
				isDragging && "opacity-40",
			)}
		>
			<Link
				href={item.href}
				draggable={false}
				onDragStart={(e) => e.preventDefault()}
				tabIndex={isInteractive ? undefined : -1}
				{...(isDraggable ? { ...sortableAttributes, ...listeners } : {})}
				onClick={onNavigateFromSidebar(item.href)}
				data-main-sidebar-active-item={isActive ? "true" : undefined}
				className={joinClasses(
					"group relative flex min-h-9 w-full select-none items-center gap-2 rounded-md py-2 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/35",
					paddingClass,
					depth < 0 && "font-semibold",
					isDraggable && "cursor-pointer active:cursor-grabbing",
					isActive
						? "bg-skyblue/14 font-semibold text-darknavy hover:bg-skyblue/18"
						: "text-darknavy/65 hover:bg-skyblue/10 hover:text-darknavy",
				)}
			>
				{shouldShowIcon
					? renderSidebarItemIcon(item, isActive, false)
					: null}
				{shouldShowModuleDot ? (
					<SidebarModuleDot isActive={isActive} />
				) : null}
				<span className="min-w-0 flex-1 truncate">{item.label}</span>
				{showPendingApprovalCount ? (
					<PendingApprovalBadge count={pendingApprovalCount} />
				) : null}
			</Link>
		</div>
	);
}

function PendingApprovalBadge({ count }: { count: number }) {
	return (
		<span
			className="inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-coralpink px-1.5 text-[10px] font-bold leading-none text-white shadow-[0_0_0_3px_rgb(var(--coralpink-rgb)/0.14)]"
			aria-label={`${count} pending approvals`}
		>
			{count > 99 ? "99+" : count}
		</span>
	);
}

function SidebarModuleDot({ isActive }: { isActive: boolean }) {
	return (
		<span
			className={joinClasses(
				"h-1.5 w-1.5 shrink-0 rounded-full transition-colors group-hover:bg-skyblue",
				isActive ? "bg-skyblue" : "bg-darknavy/30",
			)}
			aria-hidden="true"
		/>
	);
}
