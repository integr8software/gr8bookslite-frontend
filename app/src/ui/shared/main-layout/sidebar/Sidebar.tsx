"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { Folder, RotateCcw, X } from "lucide-react";
import {
	DndContext,
	DragOverlay,
	KeyboardSensor,
	PointerSensor,
	closestCenter,
	pointerWithin,
	useSensor,
	useSensors,
	type CollisionDetection,
	type DragEndEvent,
	type DragOverEvent,
	type DragStartEvent,
} from "@dnd-kit/core";
import {
	arrayMove,
	sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import toast from "react-hot-toast";
import type {
	MainNavigationItem,
	MainNavigationSection,
} from "@/app/src/types/shared/main-layout/MainLayoutDomainTypes";
import { useNavigationOrder } from "@/app/src/hooks/shared/main-layout/sidebar/useSidebarOrderPreference";
import { useAppStore } from "@/app/src/hooks/shared/app/useAppStore";
import { useAuthProfileQuery } from "@/app/src/hooks/auth/useAuthProfileQuery";
import { SidebarIdentitySkeleton, SidebarLogo } from "./SidebarIdentity";
import { MainIcons, SidebarAllowedIcons, renderSidebarItemIcon } from "./SidebarIcons";
import { SidebarNavigationContent } from "./SidebarNavigationContent";
import { getActiveNavigationHref, joinClasses, pathMatches } from "./utils";

const ApprovalManagementHref = "/system-administration/approval-management";
const ApprovalTransactionsHref = `${ApprovalManagementHref}/approval-transactions`;
const HiddenSidebarKeys = new Set([
	"maintenance-approval-setup",
	"maintenance-approval-transactions",
	"system-administration-approval-setup",
	"system-administration-approval-transactions",
	"system-administration-approver-setup",
]);

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
	userModuleItems?: unknown[];
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
	canCustomizeSidebar = true,
	shouldAutoScrollActiveItem,
	onClose,
	onNavigateFromSidebar,
	onToggleExpandedKey,
}: MainSidebarProps) {
	const companyId = useAppStore((state) => state.activeCompanyId);
	const branchUnitId = useAppStore((state) => state.activeBranchId);
	const accessToken = useAppStore((state) => state.accessToken);
	const authProfileQuery = useAuthProfileQuery({ accessToken });
	const userId = authProfileQuery.data?.user.id;

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
		[onClose, onNavigateFromSidebar, suppressAutoScrollFromSidebarInteraction],
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

	const normalizedNavigationSections = useMemo(
		() => normalizeApprovalManagementNavigation(navigationSections),
		[navigationSections],
	);

	const isDraggable = canCustomizeSidebar;

	const {
		orderedSections,
		setLiveSections,
		updateSections,
		cancelLiveReorder,
		resetOrder,
		hasCustomOrder,
	} = useNavigationOrder({
		companyId,
		branchUnitId,
		userId,
		sections: normalizedNavigationSections,
	});

	const [isMounted, setIsMounted] = useState(false);
	const [activeId, setActiveId] = useState<string | null>(null);
	const autoExpandTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const lastOverKeyRef = useRef<string | null>(null);

	useEffect(() => {
		setIsMounted(true);
	}, []);

	const activeEntity = useMemo(() => {
		if (!activeId) return null;
		for (const section of orderedSections) {
			if (section.key === activeId) {
				return { type: "section" as const, section };
			}
			for (const item of section.items) {
				if (item.key === activeId) {
					return { type: "item" as const, item, section };
				}
			}
		}
		return null;
	}, [activeId, orderedSections]);

	const sensors = useSensors(
		useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		}),
	);

	const collisionDetection: CollisionDetection = useCallback((args) => {
		const pointerCollisions = pointerWithin(args);
		if (pointerCollisions.length > 0) {
			return pointerCollisions;
		}
		return closestCenter(args);
	}, []);

	const handleDragStart = useCallback(({ active }: DragStartEvent) => {
		setActiveId(String(active.id));
	}, []);

	const handleDragOver = useCallback(
		({ active, over }: DragOverEvent) => {
			if (!over) {
				if (autoExpandTimerRef.current) {
					clearTimeout(autoExpandTimerRef.current);
					autoExpandTimerRef.current = null;
				}
				lastOverKeyRef.current = null;
				return;
			}

			const activeId = String(active.id);
			const overId = String(over.id);

			if (activeId === overId) return;

			// Check if active is a top-level section
			const isActiveSection = orderedSections.some((s) => s.key === activeId);
			if (isActiveSection) {
				const activeSecIdx = orderedSections.findIndex((s) => s.key === activeId);
				const overSecIdx = orderedSections.findIndex((s) => s.key === overId);
				if (activeSecIdx !== -1 && overSecIdx !== -1 && activeSecIdx !== overSecIdx) {
					setLiveSections(arrayMove(orderedSections, activeSecIdx, overSecIdx));
				}
				return;
			}

			// Spring-loaded folder auto-opening:
			const targetSection = orderedSections.find(
				(s) => s.key === overId || s.items.some((i) => i.key === overId),
			);

			if (targetSection && !expandedKeys.includes(targetSection.key)) {
				if (lastOverKeyRef.current !== targetSection.key) {
					lastOverKeyRef.current = targetSection.key;
					if (autoExpandTimerRef.current) {
						clearTimeout(autoExpandTimerRef.current);
					}
					autoExpandTimerRef.current = setTimeout(() => {
						onToggleExpandedKey(targetSection.key);
					}, 200);
				}
			} else {
				if (autoExpandTimerRef.current) {
					clearTimeout(autoExpandTimerRef.current);
					autoExpandTimerRef.current = null;
				}
				lastOverKeyRef.current = null;
			}

			// Cross-container item movement:
			// Find which section active item is currently in
			let sourceSectionIndex = -1;
			let sourceItemIndex = -1;

			for (let i = 0; i < orderedSections.length; i++) {
				const idx = orderedSections[i].items.findIndex((item) => item.key === activeId);
				if (idx !== -1) {
					sourceSectionIndex = i;
					sourceItemIndex = idx;
					break;
				}
			}

			if (sourceSectionIndex === -1) return;

			// Find which section overId is in
			let targetSectionIndex = -1;
			let targetItemIndex = -1;

			for (let i = 0; i < orderedSections.length; i++) {
				const idx = orderedSections[i].items.findIndex((item) => item.key === overId);
				if (idx !== -1) {
					targetSectionIndex = i;
					targetItemIndex = idx;
					break;
				}
				if (orderedSections[i].key === overId) {
					targetSectionIndex = i;
					targetItemIndex = orderedSections[i].items.length;
					break;
				}
			}

			if (targetSectionIndex === -1) return;

			// If moving into a DIFFERENT section container, transfer item live!
			if (sourceSectionIndex !== targetSectionIndex) {
				const itemToMove = orderedSections[sourceSectionIndex].items[sourceItemIndex];
				const targetSectionObj = orderedSections[targetSectionIndex];

				let newIndex: number;
				if (targetItemIndex >= 0 && targetItemIndex < targetSectionObj.items.length) {
					const isBelowOver =
						over &&
						active.rect.current.translated &&
						over.rect &&
						active.rect.current.translated.top > over.rect.top + over.rect.height / 2;
					newIndex = isBelowOver ? targetItemIndex + 1 : targetItemIndex;
				} else {
					newIndex = targetSectionObj.items.length;
				}

				newIndex = Math.max(0, Math.min(newIndex, targetSectionObj.items.length));

				const nextSections = orderedSections.map((section, idx) => {
					if (idx === sourceSectionIndex) {
						return {
							...section,
							items: section.items.filter((_, i) => i !== sourceItemIndex),
						};
					}
					if (idx === targetSectionIndex) {
						const newItems = [...section.items];
						newItems.splice(newIndex, 0, itemToMove);
						return {
							...section,
							items: newItems,
						};
					}
					return section;
				});

				setLiveSections(nextSections);
			}
		},
		[expandedKeys, onToggleExpandedKey, orderedSections, setLiveSections],
	);

	const handleDragCancel = useCallback(() => {
		if (autoExpandTimerRef.current) {
			clearTimeout(autoExpandTimerRef.current);
			autoExpandTimerRef.current = null;
		}
		lastOverKeyRef.current = null;
		setActiveId(null);
		cancelLiveReorder();
	}, [cancelLiveReorder]);

	const handleDragEnd = useCallback(
		({ active, over }: DragEndEvent) => {
			if (autoExpandTimerRef.current) {
				clearTimeout(autoExpandTimerRef.current);
				autoExpandTimerRef.current = null;
			}
			lastOverKeyRef.current = null;
			setActiveId(null);

			if (!over) {
				updateSections(orderedSections);
				return;
			}

			const activeId = String(active.id);
			const overId = String(over.id);

			// 1. Reordering top-level sections
			const activeSectionIndex = orderedSections.findIndex(
				(s) => s.key === activeId,
			);
			const overSectionIndex = orderedSections.findIndex(
				(s) => s.key === overId,
			);

			if (activeSectionIndex !== -1 && overSectionIndex !== -1) {
				if (activeSectionIndex !== overSectionIndex) {
					const next = arrayMove(
						orderedSections,
						activeSectionIndex,
						overSectionIndex,
					);
					updateSections(next);
				} else {
					updateSections(orderedSections);
				}
				return;
			}

			// 2. Reordering items within the same section:
			let activeSecIdx = -1;
			let activeItmIdx = -1;
			let overSecIdx = -1;
			let overItmIdx = -1;

			for (let i = 0; i < orderedSections.length; i++) {
				const aIdx = orderedSections[i].items.findIndex((it) => it.key === activeId);
				if (aIdx !== -1) {
					activeSecIdx = i;
					activeItmIdx = aIdx;
				}
				const oIdx = orderedSections[i].items.findIndex((it) => it.key === overId);
				if (oIdx !== -1) {
					overSecIdx = i;
					overItmIdx = oIdx;
				}
			}

			if (
				activeSecIdx !== -1 &&
				overSecIdx !== -1 &&
				activeSecIdx === overSecIdx &&
				activeItmIdx !== overItmIdx
			) {
				const nextSections = orderedSections.map((sec, idx) => {
					if (idx === activeSecIdx) {
						return {
							...sec,
							items: arrayMove(sec.items, activeItmIdx, overItmIdx),
						};
					}
					return sec;
				});
				updateSections(nextSections);
				return;
			}

			// Finalize and persist current live sections
			updateSections(orderedSections);
		},
		[orderedSections, updateSections],
	);

	useEffect(() => {
		return () => {
			if (autoExpandTimerRef.current) {
				clearTimeout(autoExpandTimerRef.current);
				autoExpandTimerRef.current = null;
			}
		};
	}, []);

	const navigationActiveHref = getActiveNavigationHref(
		orderedSections.flatMap((section) => section.items),
		activeHref,
	);

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
					className="min-h-0 flex-1 scroll-smooth overflow-y-auto overflow-x-hidden overscroll-contain px-3 py-4"
				>
					<DndContext
						sensors={sensors}
						collisionDetection={collisionDetection}
						onDragStart={handleDragStart}
						onDragOver={handleDragOver}
						onDragEnd={handleDragEnd}
						onDragCancel={handleDragCancel}
					>
						<SidebarNavigationContent
							activeHref={navigationActiveHref}
							expandedKeys={expandedKeys}
							sections={orderedSections}
							isDraggable={isDraggable}
							onInteract={suppressAutoScrollFromSidebarInteraction}
							onNavigateFromSidebar={handleNavigateFromSidebar}
							onToggleExpandedKey={onToggleExpandedKey}
						/>

						{isMounted
							? createPortal(
									<DragOverlay dropAnimation={null}>
										{activeEntity?.type === "section" ? (
											<div className="pointer-events-none flex min-h-10 w-64 select-none items-center gap-2 rounded-md bg-white/80 px-3 py-2 text-sm font-semibold text-darknavy opacity-50 shadow-md">
												<Folder className="h-4 w-4 shrink-0 text-darknavy/65" />
												<span className="min-w-0 flex-1 truncate">
													{activeEntity.section.title}
												</span>
											</div>
										) : activeEntity?.type === "item" ? (
											<div className="pointer-events-none flex min-h-9 w-60 select-none items-center gap-2 rounded-md bg-white/80 px-3 py-2 text-sm font-semibold text-darknavy opacity-50 shadow-md">
												{renderSidebarItemIcon(activeEntity.item, false, false)}
												<span className="min-w-0 flex-1 truncate">
													{activeEntity.item.label}
												</span>
											</div>
										) : null}
									</DragOverlay>,
									document.body,
							  )
							: null}
					</DndContext>
				</div>

				{hasCustomOrder && isDraggable ? (
					<div className="border-t border-darknavy/10 px-3 py-2">
						<button
							type="button"
							onClick={() => {
								resetOrder();
								toast.success("Sidebar order reset to default");
							}}
							className="flex w-full items-center justify-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium text-darknavy/50 transition hover:bg-darknavy/5 hover:text-darknavy"
						>
							<RotateCcw className="h-3.5 w-3.5" />
							Reset sidebar order
						</button>
					</div>
				) : null}
			</div>
		</aside>
	);
}

function normalizeApprovalManagementNavigation(
	sections: MainNavigationSection[],
): MainNavigationSection[] {
	const normalizedSections: MainNavigationSection[] = [];

	for (const section of sections) {
		if (isHiddenApprovalManagementSection(section)) {
			continue;
		}

		if (section.key === "approval-management") {
			normalizedSections.push(
				createApprovalManagementSection(section.items[0]),
			);
			continue;
		}

		const approvalItem = findApprovalManagementItem(section.items);

		if (isApprovalManagementSection(section)) {
			normalizedSections.push(createApprovalManagementSection(approvalItem));
			continue;
		}

		const nextSection = {
			...section,
			items: normalizeApprovalManagementItems(section.items),
		};

		normalizedSections.push(nextSection);

		if (section.key === "system-administration" && approvalItem) {
			normalizedSections.push(createApprovalManagementSection(approvalItem));
		}
	}

	return normalizedSections;
}

function isApprovalManagementSection(section: MainNavigationSection) {
	return (
		section.title === "Approval Management" ||
		section.key === "approval-management-root" ||
		section.href === ApprovalManagementHref
	);
}

function isHiddenApprovalManagementSection(section: MainNavigationSection) {
	return (
		HiddenSidebarKeys.has(section.key) ||
		section.title === "Approver Setup" ||
		section.title === "Approval Setup" ||
		section.title === "Approval Transactions" ||
		section.href === ApprovalTransactionsHref
	);
}

function normalizeApprovalManagementItems(
	items: MainNavigationItem[],
): MainNavigationItem[] {
	return items
		.filter(
			(item) =>
				!isHiddenApprovalManagementItem(item) &&
				!isApprovalManagementItem(item),
		)
		.map((item) => {
			return {
				...item,
				children: item.children
					? normalizeApprovalManagementItems(item.children)
					: undefined,
			};
		});
}

function isHiddenApprovalManagementItem(item: MainNavigationItem) {
	return (
		HiddenSidebarKeys.has(item.key) ||
		item.label === "Approver Setup" ||
		item.label === "Approval Setup" ||
		item.label === "Approval Transactions" ||
		item.href === ApprovalTransactionsHref
	);
}

function isApprovalManagementItem(item: MainNavigationItem) {
	return (
		item.key === "system-administration-approval-management" ||
		item.key === "maintenance-approval" ||
		(item.href === ApprovalManagementHref &&
			item.label === "Approval Management")
	);
}

function findApprovalManagementItem(
	items: MainNavigationItem[],
): MainNavigationItem | undefined {
	for (const item of items) {
		if (isApprovalManagementItem(item)) {
			return item;
		}

		const child = item.children
			? findApprovalManagementItem(item.children)
			: undefined;

		if (child) {
			return child;
		}
	}
}

function createApprovalManagementSection(
	item?: MainNavigationItem,
): MainNavigationSection {
	const approvalItem = item ?? {
		key: "approval-management",
		label: "Approval Management",
		href: ApprovalManagementHref,
		accessKey: "maintenance.approval" as const,
		iconName: "shieldCheck",
	};

	return {
		key: "approval-management",
		title: "Approval Management",
		href: ApprovalManagementHref,
		icon: "approval",
		iconName: "shieldCheck",
		accessKey: approvalItem.accessKey,
		permissionCode: approvalItem.permissionCode,
		items: createApprovalManagementChildren(approvalItem),
	};
}

function createApprovalManagementChildren(
	item: MainNavigationItem,
): MainNavigationItem[] {
	return [
		{
			key: "approval-management-setup",
			label: "Approver Setup",
			href: ApprovalManagementHref,
			accessKey: item.accessKey,
			permissionCode: item.permissionCode,
			requiredActions: item.requiredActions,
			iconName: "shieldCheck",
		},
		{
			key: "approval-management-transactions",
			label: "Approval Transactions",
			href: `${ApprovalManagementHref}/approval-transactions`,
			accessKey: item.accessKey,
			permissionCode: item.permissionCode,
			requiredActions: item.requiredActions,
			iconName: "clipboardCheck",
		},
	];
}
