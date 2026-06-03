"use client";

import { Suspense, type ReactNode } from "react";
import dynamic from "next/dynamic";
import { useMainLayout } from "@/app/src/hooks/shared/main-layout/useMainLayout";
import { MainLoadingScreen } from "@/app/src/ui/shared/app/MainLoadingScreen";
import { MainFooter } from "./MainFooter";
import { MainHelpModalLoading } from "./MainHelpModalLoading";
import { MainPageHeader } from "./MainPageHeader";
import { MainNavigationProgress } from "./NavigationProgress";
import { MainNotificationsPanel } from "./notifications-panel/NotificationsPanel";
import { MainSidebar } from "./sidebar/Sidebar";
import { MainTopbar } from "./main-topbar/MainTopbar";
import { NoBranchAccess } from "./NoBranchAccess";
import { joinClasses } from "./utils";
import { AiAssistantChat } from "@/app/src/ui/shared/ai-assistant/AiAssistantChat";
import { MaintenanceSpotlightTutorial } from "@/app/src/ui/modules/maintenance/MaintenanceSpotlightTutorial";

const MainHelpModal = dynamic(
	() =>
		import("@/app/src/ui/shared/main-layout/MainHelpModal").then(
			(mod) => mod.MainHelpModal,
		),
	{
		loading: () => <MainHelpModalLoading />,
	},
);

type MainLayoutProps = {
	children: ReactNode;
};

export function MainLayout({ children }: MainLayoutProps) {
	return (
		<Suspense
			fallback={
				<MainLoadingScreen message="Loading your workspace data..." />
			}
		>
			<MainLayoutContent>{children}</MainLayoutContent>
		</Suspense>
	);
}

function MainLayoutContent({ children }: MainLayoutProps) {
	const {
		activeHref,
		activeNavigationScope,
		availableCompanies,
		branchDropdownItems,
		breadcrumbs,
		canAccessMaster,
		canAccessWorkspace,
		canSwitchCompany,
		currentBranch,
		currentCompany,
		currentHelpArticle,
		currentUser,
		enabledQuickListTabs,
		expandedKeys,
		hasBranchAccess,
		helpArticles,
		homeHref,
		isCompanySwitching,
		companySwitchMessage,
		isShellLoading,
		isProfileLoading,
		isTopbarContextLoading,
		isBranchLoading,
		isHelpOpen,
		isNotificationsOpen,
		isSearchOpen,
		isSidebarOpen,
		isSidebarTransitionEnabled,
		navigationSections,
		notificationTab,
		query,
		recentlyVisitedModules,
		searchResults,
		selectedHelpArticleKey,
		shouldAutoRevealActiveRoute,
		unreadNotificationCount,
		visibleNotifications,
		closeHelp,
		closeNotifications,
		closeSearch,
		closeSidebar,
		loadBranchOptions,
		markSidebarNavigation,
		markAllNotificationsAsRead,
		markNotificationAsRead,
		openHelp,
		selectBranch,
		selectCompany,
		setNotificationTab,
		setQuery,
		setSelectedHelpArticleKey,
		toggleExpandedKey,
		toggleNotifications,
		toggleSearch,
		toggleSidebar,
		switchToMaster,
		switchToWorkspace,
	} = useMainLayout();
	const isCompanyBranchAccessLoading =
		activeNavigationScope === "company" && isBranchLoading && !hasBranchAccess;
	const shouldShowBranchContent =
		activeNavigationScope !== "company" ||
		hasBranchAccess ||
		isCompanyBranchAccessLoading;
	const isAdministrationScope = activeNavigationScope !== "company";
	const isSuperAdminSidebarIdentity =
		currentUser.userRole === "Super Admin";
	let administrationSidebarName = "Workspace";
	let administrationSidebarType = "Company Administration";

	if (isSuperAdminSidebarIdentity) {
		administrationSidebarName = "Integr8 Software Solutions Inc.";
		administrationSidebarType = "Master Control";
	} else if (activeNavigationScope === "master") {
		administrationSidebarName = "Master";
		administrationSidebarType = "Platform Administration";
	} else if (activeNavigationScope === "account") {
		administrationSidebarName = "Account";
		administrationSidebarType = "Account Settings";
	}

	if (isShellLoading) {
		return <MainLoadingScreen message="Loading your workspace data..." />;
	}

	if (isCompanySwitching) {
		return <MainLoadingScreen message={companySwitchMessage} />;
	}

	if (isCompanyBranchAccessLoading) {
		return <MainLoadingScreen message="Loading company branches..." />;
	}

	return (
		<div className="flex h-dvh max-w-full flex-col overflow-hidden bg-white text-darknavy">
			<MainNavigationProgress />

			<MainTopbar
				activeHref={activeHref}
				activeNavigationScope={activeNavigationScope}
				availableCompanies={availableCompanies}
				branchDropdownItems={branchDropdownItems}
				canAccessMaster={canAccessMaster}
				canAccessWorkspace={canAccessWorkspace}
				canSwitchCompany={canSwitchCompany}
				currentBranch={currentBranch}
				currentCompany={currentCompany}
				currentUser={currentUser}
				homeHref={homeHref}
				isBranchLoading={isBranchLoading}
				isHelpOpen={isHelpOpen}
				isProfileLoading={isProfileLoading}
				isTopbarContextLoading={isTopbarContextLoading}
				isNotificationsOpen={isNotificationsOpen}
				isSearchOpen={isSearchOpen}
				isSidebarOpen={isSidebarOpen}
				notificationTab={notificationTab}
				notifications={visibleNotifications}
				query={query}
				searchResults={searchResults}
				unreadNotificationCount={unreadNotificationCount}
				onCloseHelp={closeHelp}
				onCloseNotifications={closeNotifications}
				onCloseSearch={closeSearch}
				onCloseSidebar={closeSidebar}
				onLoadBranchOptions={loadBranchOptions}
				onMarkNotificationAsRead={markNotificationAsRead}
				onMarkAllNotificationsAsRead={markAllNotificationsAsRead}
				onNotificationTabChange={setNotificationTab}
				onOpenHelp={openHelp}
				onQueryChange={setQuery}
				onSelectBranch={selectBranch}
				onSelectCompany={selectCompany}
				onSwitchToMaster={switchToMaster}
				onSwitchToWorkspace={switchToWorkspace}
				onToggleNotifications={toggleNotifications}
				onToggleSearch={toggleSearch}
				onToggleSidebar={toggleSidebar}
			/>

			<div className="relative flex min-h-0 flex-1 max-w-full overflow-hidden">
				<button
					type="button"
					aria-label="Close sidebar overlay"
					onClick={closeSidebar}
					className={joinClasses(
						"fixed inset-0 z-40 bg-transparent backdrop-blur-sm transition-opacity duration-300 ease-out motion-reduce:transition-none lg:hidden",
						isSidebarOpen
							? "pointer-events-auto opacity-100"
							: "pointer-events-none opacity-0",
					)}
				/>

				<MainSidebar
					activeHref={activeHref}
					companyBadgeLabel={
						isAdministrationScope && !isSuperAdminSidebarIdentity
							? currentUser.initials
							: undefined
					}
					companyName={
						isAdministrationScope
							? administrationSidebarName
							: currentCompany.name
					}
					companyLogoUrl={
						isAdministrationScope
							? undefined
							: currentCompany.logoUrl
					}
					companyLogoVariant={
						isSuperAdminSidebarIdentity
							? "master-control"
							: undefined
					}
					typeOfCompany={
						isAdministrationScope
							? administrationSidebarType
							: (currentCompany.businessKind ?? "Company")
					}
					enabledQuickListTabs={enabledQuickListTabs}
					expandedKeys={expandedKeys}
					homeHref={homeHref}
					isLoading={isProfileLoading}
					isOpen={isSidebarOpen}
					isTransitionEnabled={isSidebarTransitionEnabled}
					navigationSections={navigationSections}
					recentlyVisitedModules={recentlyVisitedModules}
					shouldAutoScrollActiveItem={shouldAutoRevealActiveRoute}
					onClose={closeSidebar}
					onNavigateFromSidebar={markSidebarNavigation}
					onToggleExpandedKey={toggleExpandedKey}
				/>

				<main
					className={joinClasses(
						"flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto overflow-x-hidden px-3 py-4 motion-reduce:transition-none sm:px-5 lg:px-6",
						isSidebarTransitionEnabled &&
							"transition-[margin] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]",
						(isSidebarOpen || !isSidebarTransitionEnabled) &&
							"lg:ml-78",
						isNotificationsOpen && "xl:mr-88",
					)}
				>
					<MainPageHeader breadcrumbs={breadcrumbs} />
					<div className="w-full flex-1">
						{shouldShowBranchContent ? (
							children
						) : (
							<NoBranchAccess companyName={currentCompany.name} />
						)}
					</div>
					<MainFooter />
				</main>

				<aside
					data-main-notifications-root
					className={joinClasses(
						"fixed bottom-0 right-0 top-16 z-20 hidden overflow-hidden border-l border-darknavy/10 bg-white transition-[width,opacity,transform,border-color] duration-200 ease-out will-change-[width,opacity,transform] motion-reduce:transition-none xl:block",
						isNotificationsOpen
							? "w-88 translate-x-0 opacity-100"
							: "pointer-events-none w-0 translate-x-3 border-transparent opacity-0",
					)}
				>
					<div
						className={joinClasses(
							"h-full w-88 transition-opacity duration-150 ease-out motion-reduce:transition-none",
							isNotificationsOpen ? "opacity-100" : "opacity-0",
						)}
					>
						<MainNotificationsPanel
							notifications={visibleNotifications}
							tab={notificationTab}
							unreadCount={unreadNotificationCount}
							onClose={closeNotifications}
							onMarkAsRead={markNotificationAsRead}
							onMarkAllAsRead={markAllNotificationsAsRead}
							onTabChange={setNotificationTab}
							className="h-full border-0 shadow-none"
						/>
					</div>
				</aside>
			</div>

			{isHelpOpen ? (
				<MainHelpModal
					articles={helpArticles}
					currentArticle={currentHelpArticle}
					selectedArticleKey={selectedHelpArticleKey}
					onClose={closeHelp}
					onSelectArticle={setSelectedHelpArticleKey}
				/>
			) : null}
			<AiAssistantChat />
			<MaintenanceSpotlightTutorial />
		</div>
	);
}
