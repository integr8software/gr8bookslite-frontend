"use client";

import type { ReactNode } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { BookOpenText, ChevronRight } from "lucide-react";
import {
  useMainLayout,
  type MainBreadcrumb,
} from "@/app/src/hooks/shared/useMainLayout";
import { MainNotificationsPanel } from "./MainNotificationsPanel";
import { MainSidebar } from "./MainSidebar";
import { MainTopbar } from "./MainTopbar";
import { NoBranchAccess } from "./NoBranchAccess";

const MainHelpModal = dynamic(
  () => import("./MainHelpModal").then((mod) => mod.MainHelpModal),
  {
    loading: () => <HelpModalLoading />,
  },
);

type MainLayoutProps = {
  children: ReactNode;
};

export function MainLayout({ children }: MainLayoutProps) {
  const {
    activeHref,
    activeNavigationScope,
    availableCompanies,
    branchDropdownItems,
    breadcrumbs,
    canAccessWorkspace,
    canSwitchCompany,
    currentBranch,
    currentCompany,
    currentHelpArticle,
    currentUser,
    enabledQuickListTabs,
    expandedKeys,
    favoriteModules,
    hasBranchAccess,
    helpArticles,
    isBranchLoading,
    isCurrentPageFavorite,
    isHelpOpen,
    isNotificationsOpen,
    isSearchOpen,
    isSidebarOpen,
    moduleTitle,
    navigationSections,
    notificationTab,
    query,
    quickListTab,
    recentlyVisitedModules,
    searchResults,
    selectedHelpArticleKey,
    unreadNotificationCount,
    visibleNotifications,
    closeHelp,
    closeNotifications,
    closeSearch,
    closeSidebar,
    loadBranchOptions,
    markNotificationAsRead,
    openHelp,
    selectBranch,
    selectCompany,
    setNotificationTab,
    setQuery,
    setQuickListTab,
    setSelectedHelpArticleKey,
    toggleCurrentPageFavorite,
    toggleExpandedKey,
    toggleNotifications,
    toggleSearch,
    toggleSidebar,
    switchToWorkspace,
  } = useMainLayout();
  const shouldShowBranchContent =
    activeNavigationScope !== "company" || hasBranchAccess;

  return (
    <div className="min-h-screen max-w-full overflow-x-clip bg-white text-darknavy">
      <MainTopbar
        activeHref={activeHref}
        activeNavigationScope={activeNavigationScope}
        availableCompanies={availableCompanies}
        branchDropdownItems={branchDropdownItems}
        canAccessWorkspace={canAccessWorkspace}
        canSwitchCompany={canSwitchCompany}
        currentBranch={currentBranch}
        currentCompany={currentCompany}
        currentUser={currentUser}
        isBranchLoading={isBranchLoading}
        isCurrentPageFavorite={isCurrentPageFavorite}
        isNotificationsOpen={isNotificationsOpen}
        isSearchOpen={isSearchOpen}
        isSidebarOpen={isSidebarOpen}
        notificationTab={notificationTab}
        notifications={visibleNotifications}
        query={query}
        searchResults={searchResults}
        unreadNotificationCount={unreadNotificationCount}
        onCloseNotifications={closeNotifications}
        onCloseSearch={closeSearch}
        onCloseSidebar={closeSidebar}
        onLoadBranchOptions={loadBranchOptions}
        onMarkNotificationAsRead={markNotificationAsRead}
        onNotificationTabChange={setNotificationTab}
        onOpenHelp={openHelp}
        onQueryChange={setQuery}
        onSelectBranch={selectBranch}
        onSelectCompany={selectCompany}
        onSwitchToWorkspace={switchToWorkspace}
        onToggleFavorite={toggleCurrentPageFavorite}
        onToggleNotifications={toggleNotifications}
        onToggleSearch={toggleSearch}
        onToggleSidebar={toggleSidebar}
      />

      <div className="relative flex min-h-[calc(100vh-7.5rem)] max-w-full overflow-x-hidden md:min-h-[calc(100vh-4rem)]">
        <button
          type="button"
          aria-label="Close sidebar overlay"
          onClick={closeSidebar}
          className={joinClasses(
            "fixed inset-0 z-40 bg-darknavy/35 transition-opacity duration-300 ease-out motion-reduce:transition-none lg:hidden",
            isSidebarOpen
              ? "pointer-events-auto opacity-100"
              : "pointer-events-none opacity-0",
          )}
        />

        <MainSidebar
          activeHref={activeHref}
          companyName={
            activeNavigationScope === "workspace"
              ? "Work Space"
              : currentCompany.name
          }
          enabledQuickListTabs={enabledQuickListTabs}
          expandedKeys={expandedKeys}
          favoriteModules={favoriteModules}
          homeHref={
            activeNavigationScope === "workspace" ? "/workspace" : "/dashboard"
          }
          isOpen={isSidebarOpen}
          navigationSections={navigationSections}
          quickListTab={quickListTab}
          recentlyVisitedModules={recentlyVisitedModules}
          onClose={closeSidebar}
          onQuickListTabChange={setQuickListTab}
          onToggleExpandedKey={toggleExpandedKey}
        />

        <main
          className={joinClasses(
            "min-w-0 flex-1 overflow-x-hidden px-3 py-4 transition-[margin] duration-500 ease-out motion-reduce:transition-none sm:px-5 lg:px-6",
            isSidebarOpen && "lg:ml-78",
            isNotificationsOpen && "xl:mr-88",
          )}
        >
          <MainPageHeader breadcrumbs={breadcrumbs} title={moduleTitle} />
          {shouldShowBranchContent ? children : (
            <NoBranchAccess companyName={currentCompany.name} />
          )}
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
    </div>
  );
}

type MainPageHeaderProps = {
  breadcrumbs: MainBreadcrumb[];
  title: string;
};

function MainPageHeader({ breadcrumbs, title }: MainPageHeaderProps) {
  return (
    <div className="mx-auto mb-4 flex w-full max-w-[94rem] flex-col gap-2">
      <nav
        aria-label="Breadcrumb"
        className="flex min-w-0 flex-wrap items-center gap-1 text-xs font-medium text-darknavy/50"
      >
        {breadcrumbs.map((breadcrumb, index) => {
          const isLast = index === breadcrumbs.length - 1;
          const content = (
            <span
              className={joinClasses(
                "block max-w-[14rem] truncate rounded py-1 sm:max-w-[18rem]",
                isLast ? "text-darknavy" : "hover:text-darknavy",
              )}
            >
              {breadcrumb.label}
            </span>
          );

          return (
            <span
              key={breadcrumb.key}
              className="flex min-w-0 items-center gap-1"
            >
              {index > 0 ? (
                <ChevronRight
                  className="h-3.5 w-3.5 shrink-0 text-darknavy/30"
                  aria-hidden="true"
                />
              ) : null}
              {!isLast && breadcrumb.href ? (
                <Link
                  href={breadcrumb.href}
                  className="rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/35"
                >
                  {content}
                </Link>
              ) : (
                <span aria-current={isLast ? "page" : undefined}>
                  {content}
                </span>
              )}
            </span>
          );
        })}
      </nav>
      <h1 className="text-2xl font-semibold tracking-tight text-darknavy sm:text-3xl">
        {title}
      </h1>
    </div>
  );
}

function HelpModalLoading() {
  return (
    <div className="fixed inset-0 z-70 flex items-center justify-center bg-darknavy/40 px-3 py-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-lg border border-darknavy/10 bg-white p-6 text-center shadow-[0_30px_90px_rgba(33,39,56,0.25)]">
        <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-md bg-skyblue/15 text-darknavy">
          <BookOpenText className="h-5 w-5" aria-hidden="true" />
        </div>
        <p className="mt-4 text-sm font-semibold text-darknavy">
          Loading manual...
        </p>
      </div>
    </div>
  );
}

function joinClasses(...classes: Array<string | undefined | false>) {
  return classes.filter(Boolean).join(" ");
}
