"use client";

import { useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import { Clock3, X } from "lucide-react";
import type {
	MainNavigationSection,
	MainSearchItem,
} from "@/app/src/data/shared/MainLayout/ModuleShellTypes";
import { SidebarIdentitySkeleton, SidebarLogo } from "@/app/src/ui/shared/main-layout/sidebar/SidebarIdentity";
import {
	SidebarCategorySection,
	SidebarItem,
	SidebarSection,
} from "@/app/src/ui/shared/main-layout/sidebar/SidebarNavigation";
import { joinClasses, pathMatches, useIncrementalVisibleCount } from "@/app/src/ui/shared/main-layout/sidebar/utils";

const QuickListInitialCount = 4;
const QuickListBatchSize = 6;

type MainSidebarProps = {
	activeHref: string;
	companyBadgeLabel?: string;
	companyName: string;
	companyLogoUrl?: string;
	typeOfCompany: string;
	enabledQuickListTabs: Array<"recent">;
	expandedKeys: string[];
	homeHref: string;
	isLoading?: boolean;
	isOpen: boolean;
	isTransitionEnabled: boolean;
	navigationSections: MainNavigationSection[];
	recentlyVisitedModules: MainSearchItem[];
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
	typeOfCompany,
	enabledQuickListTabs,
	expandedKeys,
	homeHref,
	isLoading = false,
	isOpen,
	isTransitionEnabled,
	navigationSections,
	recentlyVisitedModules,
	shouldAutoScrollActiveItem,
	onClose,
	onNavigateFromSidebar,
	onToggleExpandedKey,
}: MainSidebarProps) {
	const scrollContainerRef = useRef<HTMLDivElement | null>(null);
	const pendingAutoScrollTimeoutRef = useRef<ReturnType<
		typeof setTimeout
	> | null>(null);
	const clearSidebarNavigationTimeoutRef = useRef<ReturnType<
		typeof setTimeout
	> | null>(null);
	const sidebarNavigationHrefRef = useRef<string | null>(null);
	const sidebarInteractionUntilRef = useRef(0);
	const quickListItems = recentlyVisitedModules;
	const shouldShowQuickList =
		enabledQuickListTabs.includes("recent") && quickListItems.length > 0;
	const [quickListVisibleCount, hasMoreQuickListItems, setQuickListSentinel] =
		useIncrementalVisibleCount(
			quickListItems.length,
			QuickListInitialCount,
			QuickListBatchSize,
			true,
		);
	const visibleQuickListItems = quickListItems.slice(
		0,
		quickListVisibleCount,
	);
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
					className="min-h-0 flex-1 scroll-smooth overflow-y-auto overscroll-contain px-3 py-4"
				>
					{shouldShowQuickList ? (
						<div className="mb-5">
							<div className="mb-2 flex items-center gap-2 px-3">
								<Clock3
									className="h-3.5 w-3.5 shrink-0 text-darknavy/45"
									aria-hidden="true"
								/>
								<p className="text-xs font-semibold uppercase tracking-[0.18em] text-darknavy/45">
									Recently Viewed
								</p>
							</div>
							<div className="space-y-1">
								{visibleQuickListItems.map((item) => (
									<Link
										key={item.key}
										href={item.href}
										onClick={handleNavigateFromSidebar(
											item.href,
										)}
										className="flex min-h-9 items-center gap-2 rounded-md px-3 text-sm text-darknavy/75 transition hover:bg-darknavy/5 hover:text-darknavy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-darknavy/25"
									>
										<span className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-darknavy">
											<Clock3
												className="h-3.5 w-3.5"
												aria-hidden="true"
											/>
										</span>
										<span className="min-w-0 flex-1 truncate">
											{item.label}
										</span>
									</Link>
								))}
								{hasMoreQuickListItems ? (
									<div
										ref={setQuickListSentinel}
										className="h-3"
										aria-hidden="true"
									/>
								) : null}
							</div>
						</div>
					) : null}

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
				</div>
			</div>
		</aside>
	);
}

function isAdminNavigationSection(section: MainNavigationSection) {
	return (
		section.key.startsWith("workspace-") || section.key.startsWith("master-")
	);
}
