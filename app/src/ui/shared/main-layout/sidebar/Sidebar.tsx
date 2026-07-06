"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
	GripVertical,
	Save,
	Settings2,
	X,
} from "lucide-react";
import {
	DndContext,
	KeyboardSensor,
	PointerSensor,
	closestCenter,
	useDroppable,
	useSensor,
	useSensors,
	type DragEndEvent,
} from "@dnd-kit/core";
import {
	SortableContext,
	arrayMove,
	sortableKeyboardCoordinates,
	useSortable,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import type {
	MainNavigationSection,
} from "@/app/src/data/shared/main-layout/MainLayoutTypes";
import { useAuthProfileQuery } from "@/app/src/hooks/auth/useAuthProfileQuery";
import { useAppStore } from "@/app/src/hooks/shared/app/useAppStore";
import { AuthQueryKeys } from "@/app/src/services/auth/AuthQueryKeys";
import {
	GetUserSidebarCustomization,
	SaveUserSidebarCustomization,
	type UserSidebarApiItem,
} from "@/app/src/services/company/user-sidebar/UserSidebarApi";
import { SidebarIdentitySkeleton, SidebarLogo } from "./SidebarIdentity";
import { SidebarAllowedIcons } from "./SidebarIcons";
import {
	SidebarCategorySection,
	SidebarItem,
	SidebarSection,
} from "./SidebarNavigation";
import { joinClasses, pathMatches } from "./utils";

type TreeItem = Omit<UserSidebarApiItem, "children"> & { children: TreeItem[] };
type GapDropData = {
	type: "gap";
	parentId: number | null;
	index: number;
	depth: number;
};

const InlineCustomizerRootDropId = "inline-sidebar-customizer-root";
const InlineCustomizerGapPrefix = "inline-sidebar-gap:";
const MaxCustomizationDepth = 2;

type MainSidebarProps = {
	activeHref: string;
	companyBadgeLabel?: string;
	companyName: string;
	companyLogoUrl?: string;
	companyLogoVariant?: "company" | "master-control";
	typeOfCompany: string;
	expandedKeys: string[];
	homeHref: string;
	isLoading?: boolean;
	isOpen: boolean;
	isTransitionEnabled: boolean;
	navigationSections: MainNavigationSection[];
	userModuleItems: UserSidebarApiItem[];
	canCustomizeSidebar?: boolean;
	shouldAutoScrollActiveItem: boolean;
	onClose: () => void;
	onNavigateFromSidebar: (href: string) => void;
	onToggleExpandedKey: (key: string) => void;
};

export function MainSidebar({
	activeHref,
	companyBadgeLabel,
	companyName,
	companyLogoUrl,
	companyLogoVariant,
	typeOfCompany,
	expandedKeys,
	homeHref,
	isLoading = false,
	isOpen,
	isTransitionEnabled,
	navigationSections,
	userModuleItems,
	canCustomizeSidebar,
	shouldAutoScrollActiveItem,
	onClose,
	onNavigateFromSidebar,
	onToggleExpandedKey,
}: MainSidebarProps) {
	const [isCustomizing, setIsCustomizing] = useState(false);
	const scrollContainerRef = useRef<HTMLDivElement | null>(null);
	const pendingAutoScrollTimeoutRef = useRef<ReturnType<
		typeof setTimeout
	> | null>(null);
	const clearSidebarNavigationTimeoutRef = useRef<ReturnType<
		typeof setTimeout
	> | null>(null);
	const sidebarNavigationHrefRef = useRef<string | null>(null);
	const sidebarInteractionUntilRef = useRef(0);
	const suppressAutoScrollFromSidebarInteraction = useCallback(() => {
		sidebarInteractionUntilRef.current = Date.now() + 1800;

		if (pendingAutoScrollTimeoutRef.current) {
			clearTimeout(pendingAutoScrollTimeoutRef.current);
			pendingAutoScrollTimeoutRef.current = null;
		}
	}, []);
	const handleNavigateFromSidebar = useCallback(
		(href: string) => () => {
			suppressAutoScrollFromSidebarInteraction();
			sidebarNavigationHrefRef.current = href;

			if (clearSidebarNavigationTimeoutRef.current) {
				clearTimeout(clearSidebarNavigationTimeoutRef.current);
			}

			clearSidebarNavigationTimeoutRef.current = setTimeout(() => {
				sidebarNavigationHrefRef.current = null;
				clearSidebarNavigationTimeoutRef.current = null;
			}, 5000);

			onNavigateFromSidebar(href);

			if (typeof window !== "undefined" && window.innerWidth < 1024) {
				onClose();
			}
		},
		[
			onClose,
			onNavigateFromSidebar,
			suppressAutoScrollFromSidebarInteraction,
		],
	);

	useEffect(() => {
		if (!isOpen || !shouldAutoScrollActiveItem) {
			return;
		}

		if (Date.now() < sidebarInteractionUntilRef.current) {
			return;
		}

		if (sidebarNavigationHrefRef.current) {
			if (!pathMatches(sidebarNavigationHrefRef.current, activeHref)) {
				return;
			}

			if (clearSidebarNavigationTimeoutRef.current) {
				clearTimeout(clearSidebarNavigationTimeoutRef.current);
			}

			clearSidebarNavigationTimeoutRef.current = setTimeout(() => {
				sidebarNavigationHrefRef.current = null;
				clearSidebarNavigationTimeoutRef.current = null;
			}, 1200);

			return;
		}

		sidebarNavigationHrefRef.current = null;
		if (clearSidebarNavigationTimeoutRef.current) {
			clearTimeout(clearSidebarNavigationTimeoutRef.current);
			clearSidebarNavigationTimeoutRef.current = null;
		}

		const scrollContainer = scrollContainerRef.current;

		if (!scrollContainer) {
			return;
		}

		const timeoutId = setTimeout(() => {
			pendingAutoScrollTimeoutRef.current = null;
			const activeItem = scrollContainer.querySelector<HTMLElement>(
				"[data-main-sidebar-active-item='true']",
			);

			activeItem?.scrollIntoView({
				behavior: "smooth",
				block: "center",
				inline: "nearest",
			});
		}, 360);
		pendingAutoScrollTimeoutRef.current = timeoutId;

		return () => {
			clearTimeout(timeoutId);
			if (pendingAutoScrollTimeoutRef.current === timeoutId) {
				pendingAutoScrollTimeoutRef.current = null;
			}
		};
	}, [activeHref, expandedKeys, isOpen, shouldAutoScrollActiveItem]);

	useEffect(() => {
		return () => {
			if (clearSidebarNavigationTimeoutRef.current) {
				clearTimeout(clearSidebarNavigationTimeoutRef.current);
			}
		};
	}, []);

	return (
		<aside
			data-main-sidebar-root
			data-spotlight-id="workspace-sidebar"
			onPointerDownCapture={suppressAutoScrollFromSidebarInteraction}
			className={joinClasses(
				"fixed inset-y-0 left-0 z-50 w-78 transform-gpu overflow-hidden border-r border-darknavy/10 bg-white shadow-[18px_0_45px_rgba(33,39,56,0.10)] will-change-transform motion-reduce:transition-none lg:bottom-0 lg:top-16 lg:z-20 lg:h-auto lg:shadow-none",
				isTransitionEnabled &&
					"transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]",
				isOpen
					? "translate-x-0"
					: joinClasses(
							"pointer-events-none -translate-x-full",
							!isTransitionEnabled && "lg:translate-x-0",
						),
			)}
		>
			<div className="flex h-full min-h-0 w-78 flex-col">
				<div className="flex items-center justify-between border-b border-darknavy/10 px-4 py-4">
					<Link
						href={homeHref}
						aria-label={`${companyName} dashboard`}
						className="flex min-w-0 items-center gap-3 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-darknavy/25"
					>
						{isLoading ? (
							<SidebarIdentitySkeleton />
						) : (
							<>
								<SidebarLogo
									companyBadgeLabel={companyBadgeLabel}
									companyLogoUrl={companyLogoUrl}
									companyName={companyName}
									variant={companyLogoVariant}
								/>
								<span className="min-w-0">
									<span className="block truncate text-base font-semibold leading-5 text-darknavy">
										{companyName}
									</span>
									<span className="block truncate text-xs text-darknavy/55">
										{typeOfCompany}
									</span>
								</span>
							</>
						)}
					</Link>

					<button
						type="button"
						onClick={onClose}
						aria-label="Close sidebar"
						className="flex h-9 w-9 items-center justify-center rounded-md text-darknavy/65 transition hover:bg-darknavy/5 hover:text-darknavy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-darknavy/25 lg:hidden"
					>
						<X className="h-5 w-5" aria-hidden="true" />
					</button>
				</div>

				<div
					ref={scrollContainerRef}
					className={joinClasses(
						"min-h-0 flex-1 scroll-smooth overflow-y-auto overflow-x-hidden overscroll-contain px-3 py-4",
						isCustomizing && "pb-20",
					)}
				>
					{isCustomizing ? (
						<InlineSidebarCustomizer
							userModuleItems={userModuleItems}
							onCancel={() => setIsCustomizing(false)}
							onSaved={() => setIsCustomizing(false)}
						/>
					) : (
						<div className="space-y-2">
							{navigationSections.map((section) =>
								section.key === "workspace" ||
								section.key === "workspace-modules" ? (
									<div key={section.key} className="space-y-3">
										<p className="px-3 text-xs font-semibold uppercase tracking-[0.18em] text-darknavy/38">
											{section.title}
										</p>
										{section.items.map((item) => (
											<SidebarItem
												key={item.key}
												activeHref={activeHref}
												expandedKeys={expandedKeys}
												item={item}
												depth={-1}
												onInteract={
													suppressAutoScrollFromSidebarInteraction
												}
												onNavigateFromSidebar={
													handleNavigateFromSidebar
												}
												onToggleExpandedKey={
													onToggleExpandedKey
												}
											/>
										))}
									</div>
								) : isDirectNavigationSection(section) ? (
									<SidebarSection
										key={section.key}
										activeHref={activeHref}
										expandedKeys={expandedKeys}
										section={section}
										onInteract={
											suppressAutoScrollFromSidebarInteraction
										}
										onNavigateFromSidebar={
											handleNavigateFromSidebar
										}
										onToggleExpandedKey={onToggleExpandedKey}
									/>
								) : isAdminNavigationSection(section) ? (
									<SidebarCategorySection
										key={section.key}
										activeHref={activeHref}
										expandedKeys={expandedKeys}
										section={section}
										onInteract={
											suppressAutoScrollFromSidebarInteraction
										}
										onNavigateFromSidebar={
											handleNavigateFromSidebar
										}
										onToggleExpandedKey={onToggleExpandedKey}
									/>
								) : (
									<SidebarSection
										key={section.key}
										activeHref={activeHref}
										expandedKeys={expandedKeys}
										section={section}
										onInteract={
											suppressAutoScrollFromSidebarInteraction
										}
										onNavigateFromSidebar={
											handleNavigateFromSidebar
										}
										onToggleExpandedKey={onToggleExpandedKey}
									/>
								),
							)}
						</div>
					)}
				</div>
				{canCustomizeSidebar && !isCustomizing ? <div className="border-t border-darknavy/10 p-3"><button type="button" onClick={() => setIsCustomizing(true)} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-darknavy/65 hover:bg-darknavy/5 hover:text-darknavy"><Settings2 className="h-4 w-4"/>Customize sidebar</button></div> : null}
			</div>
		</aside>
	);
}

function InlineSidebarCustomizer({
	userModuleItems,
	onCancel,
	onSaved,
}: {
	userModuleItems: UserSidebarApiItem[];
	onCancel: () => void;
	onSaved: () => void;
}) {
	const companyId = useAppStore((state) => state.activeCompanyId);
	const branchUnitId = useAppStore((state) => state.activeBranchId);
	const accessToken = useAppStore((state) => state.accessToken);
	const authProfileQuery = useAuthProfileQuery({ accessToken });
	const targetUserId = authProfileQuery.data?.user.id;
	const queryClient = useQueryClient();
	const [items, setItems] = useState<TreeItem[]>([]);
	const [dirty, setDirty] = useState(false);
	const [activeDragId, setActiveDragId] = useState<string | null>(null);
	const sensors = useSensors(
		useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
		useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
	);
	const query = useQuery({
		queryKey: ["user-sidebar-customization", companyId, branchUnitId, targetUserId],
		queryFn: () =>
			GetUserSidebarCustomization(companyId!, {
				branchUnitId: branchUnitId!,
				userId: targetUserId,
			}),
		enabled: Boolean(companyId && branchUnitId && targetUserId),
	});
	const sourceItems = query.data?.items ?? userModuleItems;
	const displayedItems = useMemo(
		() => (dirty ? items : sourceItems.map(normalize)),
		[dirty, items, sourceItems],
	);
	const {
		isOver: isRootDroppableOver,
		setNodeRef: setRootDroppableNodeRef,
	} = useDroppable({ id: InlineCustomizerRootDropId });
	const save = useMutation({
		mutationFn: async () => {
			const customization = query.data ?? (await query.refetch()).data;
			if (!customization) {
				throw new Error("Sidebar version is unavailable.");
			}

			return SaveUserSidebarCustomization(
				companyId!,
				{ branchUnitId: branchUnitId!, userId: targetUserId },
				{
					version: customization.version,
					items: displayedItems.map((item) => serialize(item)),
					applyScope: "CURRENT_BRANCH",
				},
			);
		},
		onSuccess: (data) => {
			setItems(data.items.map(normalize));
			setDirty(false);
			queryClient.setQueryData(
				["user-sidebar-customization", companyId, branchUnitId, targetUserId],
				data,
			);
			queryClient.invalidateQueries({ queryKey: AuthQueryKeys.profiles() });
			toast.success("Sidebar saved");
			onSaved();
		},
		onError: () => toast.error("Could not save sidebar changes."),
	});

	function update(nextItems: TreeItem[]) {
		setItems(nextItems);
		setDirty(true);
	}

	function moveToRoot(itemId: number) {
		const source = locate(displayedItems, itemId);
		if (!source || source.parentId == null) return;
		update([...removeItem(displayedItems, source.item.id), source.item]);
	}

	function onDragEnd({ active, over }: DragEndEvent) {
		setActiveDragId(null);
		if (!over || active.id === over.id) return;
		const source = locate(displayedItems, Number(active.id));
		if (!source) return;
		const withoutSource = removeItem(displayedItems, source.item.id);

		if (over.id === InlineCustomizerRootDropId) {
			update([...withoutSource, source.item]);
			return;
		}

		const gap = getGapData(over.id);
		if (gap) {
			const siblings =
				gap.parentId == null
					? withoutSource
					: locate(withoutSource, gap.parentId)?.item.children ?? [];
			update(replaceChildren(withoutSource, gap.parentId, insertAt(siblings, gap.index, source.item)));
			return;
		}

		const target = locate(displayedItems, Number(over.id));
		if (!target) return;

		if (target.item.itemType !== "LINK" && canNest(source.item, target)) {
			update(appendChild(withoutSource, target.item.id, source.item));
			return;
		}

		if (source.parentId !== target.parentId) return;
		const siblings =
			source.parentId == null ? displayedItems : locate(displayedItems, source.parentId)!.item.children;
		update(replaceChildren(displayedItems, source.parentId, arrayMove(siblings, source.index, target.index)));
	}

	return (
		<div className="space-y-2">
			<DndContext
				sensors={sensors}
				collisionDetection={closestCenter}
				onDragStart={({ active }) => setActiveDragId(String(active.id))}
				onDragCancel={() => setActiveDragId(null)}
				onDragEnd={onDragEnd}
			>
				<div
					ref={setRootDroppableNodeRef}
					className={joinClasses(
						"rounded-md transition",
						isRootDroppableOver && "bg-skyblue/5",
					)}
				>
					<CustomizerGap
						depth={0}
						index={0}
						parentId={null}
					/>
					<InlineTree
						items={displayedItems}
						depth={0}
						parentId={null}
						isDragging={Boolean(activeDragId)}
						onChange={update}
						onMoveToRoot={moveToRoot}
					/>
				</div>
			</DndContext>
			<div className="fixed bottom-0 left-0 z-20 flex w-78 gap-2 border-t border-darknavy/10 bg-white px-3 py-3">
				<button
					type="button"
					className="h-9 flex-1 rounded-md border border-darknavy/10 text-sm font-semibold text-darknavy"
					onClick={onCancel}
				>
					Cancel
				</button>
				<button
					type="button"
					disabled={!dirty || save.isPending}
					className="inline-flex h-9 flex-1 items-center justify-center gap-2 rounded-md bg-skyblue text-sm font-semibold text-white disabled:opacity-45"
					onClick={() => save.mutate()}
				>
					<Save className="h-4 w-4" />
					Save
				</button>
			</div>
		</div>
	);
}

function InlineTree({
	items,
	depth,
	parentId,
	isDragging,
	onChange,
	onMoveToRoot,
}: {
	items: TreeItem[];
	depth: number;
	parentId: number | null;
	isDragging: boolean;
	onChange: (items: TreeItem[]) => void;
	onMoveToRoot: (itemId: number) => void;
}) {
	return (
		<SortableContext
			items={items.map((item) => String(item.id))}
			strategy={verticalListSortingStrategy}
		>
			<div className="space-y-0.5">
				{items.map((item, index) => (
					<div key={item.id}>
						<InlineEditableRow
							item={item}
							depth={depth}
							parentId={parentId}
							isDragging={isDragging}
							onChildren={(children) =>
								onChange(items.map((value) => value.id === item.id ? { ...value, children } : value))
							}
							onMoveToRoot={onMoveToRoot}
						/>
						<CustomizerGap
							depth={depth}
							index={index + 1}
							parentId={parentId}
						/>
					</div>
				))}
			</div>
		</SortableContext>
	);
}

function InlineEditableRow({
	item,
	depth,
	parentId,
	isDragging,
	onChildren,
	onMoveToRoot,
}: {
	item: TreeItem;
	depth: number;
	parentId: number | null;
	isDragging: boolean;
	onChildren: (children: TreeItem[]) => void;
	onMoveToRoot: (itemId: number) => void;
}) {
	const {
		attributes,
		isDragging: isSortableDragging,
		listeners,
		setNodeRef,
		transform,
		transition,
	} = useSortable({ id: String(item.id) });
	const isStructural = item.itemType !== "LINK";
	const configuredIcon = item.iconName ? SidebarAllowedIcons[item.iconName] : undefined;
	const ConfiguredIcon = configuredIcon;
	const shouldShowDefaultFolder = !configuredIcon && isStructural;
	const shouldShowDefaultFile = !configuredIcon && !isStructural && parentId == null;
	const shouldShowDefaultDot =
		!configuredIcon && !shouldShowDefaultFolder && !shouldShowDefaultFile;
	const rowPadding =
		depth === 0 ? "px-3" : depth === 1 ? "pl-6 pr-3" : "pl-8 pr-3";

	return (
		<div
			ref={setNodeRef}
			style={{
				transform: CSS.Transform.toString(transform),
				transition,
			}}
			className={joinClasses("rounded-md", isSortableDragging && "opacity-45")}
		>
			<div
				className={joinClasses(
					"group flex min-h-8 w-full items-center gap-2 rounded-md py-1 text-sm hover:bg-darknavy/[0.035]",
					rowPadding,
				)}
			>
				{shouldShowDefaultFolder ? (
					<SidebarAllowedIcons.folder className="h-4 w-4 shrink-0 text-darknavy/65" />
				) : shouldShowDefaultFile ? (
					<SidebarAllowedIcons.link className="h-4 w-4 shrink-0 text-darknavy/65" />
				) : shouldShowDefaultDot ? (
					<span
						aria-hidden="true"
						className="h-1.5 w-1.5 shrink-0 rounded-full bg-darknavy/30 transition-colors group-hover:bg-skyblue"
					/>
				) : ConfiguredIcon ? (
					<ConfiguredIcon className="h-4 w-4 shrink-0 text-darknavy/65" />
				) : null}
				<span
					className={joinClasses(
						"min-w-0 flex-1 bg-transparent outline-none",
						isStructural
							? "font-semibold text-darknavy"
							: "font-medium text-darknavy/80",
					)}
				>
					{item.label}
				</span>
				<button
					type="button"
					aria-label={`Drag ${item.label}`}
					{...attributes}
					{...listeners}
					className="grid h-7 w-7 shrink-0 cursor-grab place-items-center rounded text-darknavy/35 hover:bg-darknavy/5 hover:text-darknavy/55 active:cursor-grabbing"
				>
					<GripVertical className="h-3.5 w-3.5" />
				</button>
			</div>
			{isStructural ? (
				<div className="ml-3 border-l border-darknavy/10 pl-0.5">
					<CustomizerGap
						depth={depth + 1}
						index={0}
						parentId={item.id}
					/>
					<SortableContext
						items={item.children.map((child) => String(child.id))}
						strategy={verticalListSortingStrategy}
					>
						<div>
							{item.children.map((child, index) => (
								<div key={child.id}>
									<InlineEditableRow
										item={child}
										depth={depth + 1}
										parentId={item.id}
										isDragging={isDragging}
										onChildren={(children) =>
											onChildren(item.children.map((value) => value.id === child.id ? { ...value, children } : value))
										}
										onMoveToRoot={onMoveToRoot}
									/>
									<CustomizerGap
										depth={depth + 1}
										index={index + 1}
										parentId={item.id}
									/>
								</div>
							))}
						</div>
					</SortableContext>
				</div>
			) : null}
		</div>
	);
}

function CustomizerGap({
	depth,
	index,
	parentId,
}: {
	depth: number;
	index: number;
	parentId: number | null;
}) {
	const { isOver, setNodeRef } = useDroppable({
		id: getGapId({ type: "gap", parentId, index, depth }),
	});
	const widthClass =
		depth === 0 ? "w-full" : depth === 1 ? "w-[calc(100%-0.75rem)]" : "w-[calc(100%-1.5rem)]";

	return (
		<div
			ref={setNodeRef}
			className={joinClasses(
				"group relative -my-px flex h-1 items-center",
				depth === 1 && "pl-3",
				depth >= 2 && "pl-6",
			)}
		>
			<div
				className={joinClasses(
					"relative h-px transition",
					widthClass,
					isOver ? "bg-skyblue" : "bg-transparent group-hover:bg-skyblue/45",
				)}
			/>
		</div>
	);
}

function isAdminNavigationSection(section: MainNavigationSection) {
	return (
		!section.href &&
		(section.key.startsWith("workspace-") ||
			section.key.startsWith("master-"))
	);
}

function isDirectNavigationSection(section: MainNavigationSection) {
	return Boolean(
		section.href &&
			section.items.length === 1 &&
			section.items[0]?.href === section.href,
	);
}

function normalize(item: UserSidebarApiItem): TreeItem {
	return { ...item, children: item.children.map(normalize) };
}

function serialize(item: TreeItem): UserSidebarApiItem {
	return {
		key: item.key,
		label: item.label,
		itemType: item.itemType,
		moduleId: item.itemType === "LINK" ? item.moduleId : undefined,
		iconName: item.iconName || undefined,
		children: item.children.map(serialize),
	} as UserSidebarApiItem;
}

function locate(
	items: TreeItem[],
	id: number,
	parentId: number | null = null,
	depth = 0,
): { item: TreeItem; parentId: number | null; index: number; depth: number } | null {
	for (const [index, item] of items.entries()) {
		if (item.id === id) return { item, parentId, index, depth };
		const child = locate(item.children, id, item.id, depth + 1);
		if (child) return child;
	}
	return null;
}

function removeItem(items: TreeItem[], id: number): TreeItem[] {
	return items
		.filter((item) => item.id !== id)
		.map((item) => ({ ...item, children: removeItem(item.children, id) }));
}

function replaceChildren(
	items: TreeItem[],
	parentId: number | null,
	children: TreeItem[],
): TreeItem[] {
	if (parentId == null) return children;
	return items.map((item) =>
		item.id === parentId
			? { ...item, children }
			: { ...item, children: replaceChildren(item.children, parentId, children) },
	);
}

function insertAt(items: TreeItem[], index: number, item: TreeItem) {
	return [...items.slice(0, index), item, ...items.slice(index)];
}

function appendChild(
	items: TreeItem[],
	parentId: number,
	child: TreeItem,
): TreeItem[] {
	return items.map((item) =>
		item.id === parentId
			? { ...item, children: [...item.children, child] }
			: { ...item, children: appendChild(item.children, parentId, child) },
	);
}

function canNest(
	source: TreeItem,
	target: { item: TreeItem; depth: number },
) {
	if (target.item.itemType === "LINK") return false;
	if (source.itemType === "SECTION") {
		return target.item.itemType === "SECTION" && target.depth < MaxCustomizationDepth - 1;
	}
	if (source.itemType === "CONTAINER" && target.depth >= MaxCustomizationDepth - 1) return false;
	return target.depth + getTreeDepth(source) <= MaxCustomizationDepth;
}

function getTreeDepth(item: TreeItem): number {
	return item.children.length
		? 1 + Math.max(...item.children.map(getTreeDepth))
		: 1;
}

function getGapId(data: GapDropData) {
	return `${InlineCustomizerGapPrefix}${data.parentId ?? "root"}:${data.index}:${data.depth}`;
}

function getGapData(id: unknown): GapDropData | null {
	const text = String(id);
	if (!text.startsWith(InlineCustomizerGapPrefix)) return null;
	const [parentToken, indexToken, depthToken] = text
		.slice(InlineCustomizerGapPrefix.length)
		.split(":");
	const index = Number(indexToken);
	const depth = Number(depthToken);
	if (!Number.isInteger(index) || !Number.isInteger(depth)) return null;
	return {
		type: "gap",
		parentId: parentToken === "root" ? null : Number(parentToken),
		index,
		depth,
	};
}
