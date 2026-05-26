"use client";

import {
	useCallback,
	useEffect,
	useRef,
	useState,
	type PointerEvent as ReactPointerEvent,
} from "react";
import Link from "next/link";
import {
	Bell,
	CircleHelp,
	Menu,
	PanelLeftClose,
	PanelLeftOpen,
	Search,
} from "lucide-react";
import { useLogout } from "@/app/src/hooks/auth/useLogout";
import { LogoText } from "@/app/src/ui/shared/layout/LogoText";
import type {
	MainTopbarProps,
	OpenSwitcherKey,
} from "@/app/src/types/shared/main-layout/MainTopbarTypes";
import { MainNotificationsPanel } from "../notifications-panel/NotificationsPanel";
import { MainSearchPanel } from "../MainSearchPanel";
import { AccountMenu } from "./AccountMenu";
import { BranchSwitcher } from "./BranchSwitcher";
import { CompanySwitcher } from "./CompanySwitcher";
import { TopbarWorkspaceSkeleton } from "./TopbarSkeletons";
import {
	getTopbarUserDescriptor,
	isLargeNotificationPanel,
	joinClasses,
} from "@/app/src/ui/shared/main-layout/main-topbar/utils";

export function MainTopbar({
	activeHref,
	activeNavigationScope,
	availableCompanies,
	branchDropdownItems,
	canAccessMaster,
	canAccessWorkspace,
	canSwitchCompany,
	currentBranch,
	currentCompany,
	currentUser,
	isBranchLoading,
	homeHref,
	isHelpOpen,
	isNotificationsOpen,
	isProfileLoading = false,
	isSearchOpen,
	isSidebarOpen,
	notificationTab,
	notifications,
	query,
	searchResults,
	unreadNotificationCount,
	onCloseHelp,
	onCloseNotifications,
	onCloseSearch,
	onCloseSidebar,
	onLoadBranchOptions,
	onMarkAllNotificationsAsRead,
	onMarkNotificationAsRead,
	onNotificationTabChange,
	onOpenHelp,
	onQueryChange,
	onSelectBranch,
	onSelectCompany,
	onSwitchToMaster,
	onSwitchToWorkspace,
	onToggleNotifications,
	onToggleSearch,
	onToggleSidebar,
}: MainTopbarProps) {
	const logout = useLogout();
	const desktopSearchInputRef = useRef<HTMLInputElement>(null);
	const mobileSearchInputRef = useRef<HTMLInputElement>(null);
	const SidebarIcon = isSidebarOpen ? PanelLeftClose : PanelLeftOpen;
	const [openSwitcherState, setOpenSwitcherState] = useState<{
		href: string;
		key: OpenSwitcherKey | null;
	}>({
		href: activeHref,
		key: null,
	});
	const [profileMenuOpenPath, setProfileMenuOpenPath] = useState<
		string | null
	>(null);
	const openSwitcherKey =
		openSwitcherState.href === activeHref ? openSwitcherState.key : null;
	const isProfileMenuOpen = profileMenuOpenPath === activeHref;
	const userDescriptor = getTopbarUserDescriptor(currentUser);
	const settingsHref =
		activeNavigationScope === "master"
			? "/master/settings"
			: activeNavigationScope === "workspace"
				? "/workspace/settings"
				: "/settings";
	const canShowCompanySwitcher =
		canAccessMaster || canAccessWorkspace || canSwitchCompany;
	const canShowBranchSwitcher =
		activeNavigationScope === "company" && branchDropdownItems.length > 0;
	const hasBothMobileWorkspaceControls =
		canShowCompanySwitcher && canShowBranchSwitcher;
	const hasMobileWorkspaceControls =
		canShowCompanySwitcher || canShowBranchSwitcher;
	const topbarFloatingPanelTopClass = "top-14";

	const closeMobileSidebar = useCallback(() => {
		if (typeof window !== "undefined" && window.innerWidth < 1024) {
			onCloseSidebar();
		}
	}, [onCloseSidebar]);

	const closeSwitcher = useCallback(() => {
		setOpenSwitcherState({ href: activeHref, key: null });
	}, [activeHref]);

	const closeDropdownNotifications = useCallback(() => {
		if (!isLargeNotificationPanel()) {
			onCloseNotifications();
		}
	}, [onCloseNotifications]);

	const focusSearchInput = useCallback(() => {
		window.requestAnimationFrame(() => {
			const visibleInput = [
				desktopSearchInputRef.current,
				mobileSearchInputRef.current,
			].find((input) => input && input.getClientRects().length > 0);

			visibleInput?.focus();
			visibleInput?.select();
		});
	}, []);

	useEffect(() => {
		if (
			!isSearchOpen &&
			!isNotificationsOpen &&
			!isProfileMenuOpen &&
			!openSwitcherKey
		) {
			return;
		}

		function handlePointerDown(event: PointerEvent) {
			const target = event.target;

			if (!(target instanceof Element)) {
				return;
			}

			if (isSearchOpen && !target.closest("[data-main-search-root]")) {
				onCloseSearch();
			}

			if (
				isNotificationsOpen &&
				!isLargeNotificationPanel() &&
				!target.closest("[data-main-notifications-root]")
			) {
				onCloseNotifications();
			}

			if (
				isProfileMenuOpen &&
				!target.closest("[data-main-profile-root]")
			) {
				setProfileMenuOpenPath(null);
			}

			if (
				openSwitcherKey &&
				!target.closest("[data-main-switcher-root]")
			) {
				setOpenSwitcherState({ href: activeHref, key: null });
			}
		}

		document.addEventListener("pointerdown", handlePointerDown);

		return () => {
			document.removeEventListener("pointerdown", handlePointerDown);
		};
	}, [
		activeHref,
		isNotificationsOpen,
		isProfileMenuOpen,
		isSearchOpen,
		onCloseNotifications,
		onCloseSearch,
		openSwitcherKey,
	]);

	useEffect(() => {
		if (!isSearchOpen) {
			return;
		}

		focusSearchInput();
	}, [focusSearchInput, isSearchOpen]);

	useEffect(() => {
		function handleKeyDown(event: KeyboardEvent) {
			const isSearchShortcut =
				(event.ctrlKey || event.metaKey) &&
				event.key.toLowerCase() === "k";
			const isHelpShortcut = event.key === "F1";
			const isNotificationsShortcut = event.key === "F9";

			if (
				!isSearchShortcut &&
				!isHelpShortcut &&
				!isNotificationsShortcut
			) {
				return;
			}

			event.preventDefault();
			closeSwitcher();
			closeMobileSidebar();

			if (isHelpShortcut) {
				closeDropdownNotifications();
				onCloseSearch();

				if (isHelpOpen) {
					onCloseHelp();
					return;
				}

				onOpenHelp();
				return;
			}

			if (isNotificationsShortcut) {
				onCloseSearch();
				onCloseHelp();
				onToggleNotifications();
				return;
			}

			closeDropdownNotifications();

			if (isSearchOpen) {
				onCloseSearch();
				return;
			}

			onToggleSearch();
		}

		document.addEventListener("keydown", handleKeyDown);

		return () => {
			document.removeEventListener("keydown", handleKeyDown);
		};
	}, [
		activeHref,
		closeDropdownNotifications,
		closeMobileSidebar,
		closeSwitcher,
		focusSearchInput,
		isHelpOpen,
		isSearchOpen,
		isSidebarOpen,
		onCloseHelp,
		onCloseNotifications,
		onCloseSearch,
		onCloseSidebar,
		onOpenHelp,
		onToggleNotifications,
		onToggleSearch,
	]);

	function handleTopbarPointerDownCapture(
		event: ReactPointerEvent<HTMLElement>,
	) {
		if (!isSidebarOpen || typeof window === "undefined") {
			return;
		}

		const target = event.target;

		if (
			window.innerWidth >= 1024 ||
			!(target instanceof Element) ||
			target.closest("[data-main-sidebar-toggle]")
		) {
			return;
		}

		onCloseSidebar();
	}

	function handleToggleSearch() {
		closeSwitcher();
		closeMobileSidebar();
		closeDropdownNotifications();
		onToggleSearch();
	}

	function handleToggleNotifications() {
		closeSwitcher();
		closeMobileSidebar();
		onToggleNotifications();
	}

	function handleToggleSidebar() {
		closeSwitcher();
		closeDropdownNotifications();
		onToggleSidebar();
	}

	function handleOpenHelp() {
		closeSwitcher();
		closeMobileSidebar();
		closeDropdownNotifications();
		onOpenHelp();
	}

	function toggleSwitcher(key: OpenSwitcherKey) {
		const next = openSwitcherKey === key ? null : key;

		if (next === "branch") {
			onLoadBranchOptions();
		}

		closeMobileSidebar();
		onCloseSearch();
		closeDropdownNotifications();
		setProfileMenuOpenPath(null);
		setOpenSwitcherState({ href: activeHref, key: next });
	}

	function toggleProfileMenu() {
		closeSwitcher();
		closeMobileSidebar();
		onCloseSearch();
		closeDropdownNotifications();
		setProfileMenuOpenPath((current) =>
			current === activeHref ? null : activeHref,
		);
	}

	return (
		<header
			data-main-topbar-root
			onPointerDownCapture={handleTopbarPointerDownCapture}
			className="sticky top-0 z-50 border-b border-darknavy/10 bg-white/95 backdrop-blur"
		>
			<div className="flex h-16 items-center gap-2 px-3 sm:px-4 lg:px-6">
				<button
					type="button"
					data-main-sidebar-toggle
					data-spotlight-id="workspace-sidebar-toggle"
					onClick={handleToggleSidebar}
					aria-label="Toggle sidebar"
					aria-pressed={isSidebarOpen}
					className="flex h-10 w-10 items-center justify-center rounded-md text-darknavy transition hover:bg-darknavy/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/35"
				>
					<Menu className="h-5 w-5 lg:hidden" aria-hidden="true" />
					<SidebarIcon
						className="hidden h-5 w-5 lg:block"
						aria-hidden="true"
					/>
				</button>

				<Link
					href={homeHref}
					className="mr-1 hidden min-w-fit rounded-md px-2 py-1.5 text-xl font-semibold transition hover:bg-darknavy/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/35 sm:inline-flex"
				>
					<LogoText brandSuffixClassName="text-sm" />
				</Link>

				<nav
					aria-label="Workspace controls"
					className="hidden min-w-0 flex-1 items-center gap-2 md:flex md:max-w-92 lg:max-w-md xl:max-w-lg"
				>
					{isProfileLoading ? (
						<TopbarWorkspaceSkeleton />
					) : canShowCompanySwitcher ? (
						<div data-spotlight-id="workspace-company-switcher">
							<CompanySwitcher
								activeNavigationScope={activeNavigationScope}
								availableCompanies={availableCompanies}
								canAccessMaster={canAccessMaster}
								canAccessWorkspace={canAccessWorkspace}
								currentCompany={currentCompany}
								isOpen={openSwitcherKey === "company"}
								onClose={closeSwitcher}
								onSelectCompany={onSelectCompany}
								onSwitchToMaster={onSwitchToMaster}
								onSwitchToWorkspace={onSwitchToWorkspace}
								onToggle={() => toggleSwitcher("company")}
							/>
						</div>
					) : null}

					{canShowBranchSwitcher ? (
						<BranchSwitcher
							branchDropdownItems={branchDropdownItems}
							currentBranch={currentBranch}
							isLoading={isBranchLoading}
							isOpen={openSwitcherKey === "branch"}
							onClose={closeSwitcher}
							onSelectBranch={onSelectBranch}
							onToggle={() => toggleSwitcher("branch")}
						/>
					) : null}
				</nav>

				<div className="ml-auto flex shrink-0 items-center justify-end gap-1 sm:gap-2">
					<div
						className="relative hidden w-52 shrink-0 xl:block 2xl:w-72"
						data-main-search-root
						data-spotlight-id="workspace-search"
					>
						<button
							type="button"
							onClick={handleToggleSearch}
							aria-expanded={isSearchOpen}
							className="flex h-10 w-full items-center gap-3 rounded-md border border-darknavy/10 bg-white px-3 text-left text-sm text-darknavy/45 shadow-sm transition hover:border-skyblue/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/35"
						>
							<Search
								className="h-4 w-4 shrink-0"
								aria-hidden="true"
							/>
							<span className="min-w-0 flex-1 truncate">
								Search anything...
							</span>
							<kbd className="hidden shrink-0 rounded border border-darknavy/10 bg-offwhite px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-darknavy/50 2xl:inline-flex">
								Ctrl + K
							</kbd>
						</button>
						{isSearchOpen ? (
							<MainSearchPanel
								inputRef={desktopSearchInputRef}
								query={query}
								results={searchResults}
								onClose={onCloseSearch}
								onQueryChange={onQueryChange}
								className="absolute right-0 top-12 w-[24rem]"
							/>
						) : null}
					</div>

					<button
						type="button"
						onClick={handleToggleSearch}
						aria-label="Search"
						aria-expanded={isSearchOpen}
						data-main-search-root
						data-spotlight-id="workspace-search"
						className="flex h-10 w-10 items-center justify-center rounded-full text-darknavy transition-all duration-200 ease-out hover:bg-darknavy/5 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/35 motion-reduce:transition-none motion-reduce:active:scale-100 md:rounded-md xl:hidden"
					>
						<Search className="h-5 w-5" aria-hidden="true" />
					</button>

					<div
						className="relative"
						data-main-notifications-root
						data-spotlight-id="workspace-notifications"
					>
						<button
							type="button"
							onClick={handleToggleNotifications}
							aria-label="Notifications"
							aria-expanded={isNotificationsOpen}
							className="relative flex h-10 w-10 items-center justify-center rounded-full text-darknavy transition-all duration-200 ease-out hover:bg-darknavy/5 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/35 motion-reduce:transition-none motion-reduce:active:scale-100 md:rounded-md"
						>
							<Bell className="h-5 w-5" aria-hidden="true" />
							{unreadNotificationCount > 0 ? (
								<span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-coralpink ring-2 ring-white" />
							) : null}
						</button>

						<div
							className={joinClasses(
								"fixed right-2 z-50 w-[calc(100vw-1rem)] max-w-88 origin-top-right transition-[opacity,transform] duration-150 ease-out will-change-[opacity,transform] motion-reduce:transition-none sm:right-4 sm:w-80 sm:max-w-none md:top-18 md:w-96 xl:hidden",
								topbarFloatingPanelTopClass,
								isNotificationsOpen
									? "pointer-events-auto translate-y-0 scale-100 opacity-100"
									: "pointer-events-none translate-y-1 scale-[0.98] opacity-0",
							)}
						>
							<MainNotificationsPanel
								notifications={notifications}
								tab={notificationTab}
								unreadCount={unreadNotificationCount}
								onClose={onCloseNotifications}
								onMarkAsRead={onMarkNotificationAsRead}
								onMarkAllAsRead={onMarkAllNotificationsAsRead}
								onTabChange={onNotificationTabChange}
								className="max-h-[calc(100vh-5.5rem)] rounded-lg"
							/>
						</div>
					</div>

					<button
						type="button"
						onClick={handleOpenHelp}
						aria-label="Help"
						className="flex h-10 w-10 items-center justify-center rounded-full text-darknavy transition-all duration-200 ease-out hover:bg-darknavy/5 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/35 motion-reduce:transition-none motion-reduce:active:scale-100 md:rounded-md"
					>
						<CircleHelp className="h-5 w-5" aria-hidden="true" />
					</button>

					<AccountMenu
						activeNavigationScope={activeNavigationScope}
						currentCompany={currentCompany}
						currentUser={currentUser}
						isOpen={isProfileMenuOpen}
						isProfileLoading={isProfileLoading}
						settingsHref={settingsHref}
						userDescriptor={userDescriptor}
						onClose={() => setProfileMenuOpenPath(null)}
						onLogout={() => void logout()}
						onToggle={toggleProfileMenu}
					/>
				</div>
			</div>

			{hasMobileWorkspaceControls ? (
				<nav
					aria-label="Mobile workspace controls"
					className={joinClasses(
						"grid grid-cols-1 gap-2 border-t border-darknavy/10 px-3 py-2 md:hidden",
						hasBothMobileWorkspaceControls && "sm:grid-cols-2",
					)}
				>
					{canShowCompanySwitcher ? (
						<CompanySwitcher
							activeNavigationScope={activeNavigationScope}
							availableCompanies={availableCompanies}
							canAccessMaster={canAccessMaster}
							canAccessWorkspace={canAccessWorkspace}
							currentCompany={currentCompany}
							isOpen={openSwitcherKey === "company"}
							variant="mobile"
							onClose={closeSwitcher}
							onSelectCompany={onSelectCompany}
							onSwitchToMaster={onSwitchToMaster}
							onSwitchToWorkspace={onSwitchToWorkspace}
							onToggle={() => toggleSwitcher("company")}
						/>
					) : null}

					{canShowBranchSwitcher ? (
						<BranchSwitcher
							branchDropdownItems={branchDropdownItems}
							currentBranch={currentBranch}
							isLoading={isBranchLoading}
							isOpen={openSwitcherKey === "branch"}
							mobileMenuTopClass="top-[10.75rem] sm:top-[7.75rem]"
							variant="mobile"
							onClose={closeSwitcher}
							onSelectBranch={onSelectBranch}
							onToggle={() => toggleSwitcher("branch")}
						/>
					) : null}
				</nav>
			) : null}

			{isSearchOpen ? (
				<div data-main-search-root>
					<MainSearchPanel
						inputRef={mobileSearchInputRef}
						query={query}
						results={searchResults}
						onClose={onCloseSearch}
						onQueryChange={onQueryChange}
						className={joinClasses(
							"fixed left-3 right-3 md:top-18 xl:hidden",
							topbarFloatingPanelTopClass,
						)}
					/>
				</div>
			) : null}
		</header>
	);
}
