"use client";

import type { ReactNode } from "react";
import dynamic from "next/dynamic";
import { BookOpenText } from "lucide-react";
import { useMainLayout } from "@/app/src/hooks/shared/useMainLayout";
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
    breadcrumbs,
    canSwitchCompany,
    currentCompany,
    currentHelpArticle,
    currentUser,
    expandedKeys,
    favoriteModules,
    hasBranchAccess,
    helpArticles,
    isCurrentPageFavorite,
    isHelpOpen,
    isNotificationsOpen,
    isSearchOpen,
    isSidebarOpen,
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
    setNotificationTab,
    setQuery,
    setQuickListTab,
    setSelectedHelpArticleKey,
    toggleCurrentPageFavorite,
    toggleExpandedKey,
    toggleNotifications,
    toggleSearch,
    toggleSidebar,
  } = useMainLayout();

  return (
    <div className="min-h-screen max-w-full overflow-x-hidden bg-white text-darknavy">
      <MainTopbar
        activeHref={activeHref}
        breadcrumbs={breadcrumbs}
        canSwitchCompany={canSwitchCompany}
        currentCompany={currentCompany}
        currentUser={currentUser}
        isCurrentPageFavorite={isCurrentPageFavorite}
        isNotificationsOpen={isNotificationsOpen}
        isSearchOpen={isSearchOpen}
        isSidebarOpen={isSidebarOpen}
        notificationTab={notificationTab}
        notifications={visibleNotifications}
        query={query}
        searchResults={searchResults}
        unreadNotificationCount={unreadNotificationCount}
        onBreadcrumbOpen={(breadcrumbKey) => {
          if (breadcrumbKey === "branch") {
            loadBranchOptions();
          }
        }}
        onCloseNotifications={closeNotifications}
        onCloseSearch={closeSearch}
        onMarkNotificationAsRead={markNotificationAsRead}
        onNotificationTabChange={setNotificationTab}
        onOpenHelp={openHelp}
        onQueryChange={setQuery}
        onSelectBranch={selectBranch}
        onToggleFavorite={toggleCurrentPageFavorite}
        onToggleNotifications={toggleNotifications}
        onToggleSearch={toggleSearch}
        onToggleSidebar={toggleSidebar}
      />

      <div className="relative flex min-h-[calc(100vh-4rem)] max-w-full overflow-x-hidden">
        {isSidebarOpen ? (
          <button
            type="button"
            aria-label="Close sidebar overlay"
            onClick={closeSidebar}
            className="fixed inset-0 z-40 bg-darknavy/35 lg:hidden"
          />
        ) : null}

        <MainSidebar
          activeHref={activeHref}
          companyName={currentCompany.name}
          expandedKeys={expandedKeys}
          favoriteModules={favoriteModules}
          isOpen={isSidebarOpen}
          navigationSections={navigationSections}
          quickListTab={quickListTab}
          recentlyVisitedModules={recentlyVisitedModules}
          onClose={closeSidebar}
          onQuickListTabChange={setQuickListTab}
          onToggleExpandedKey={toggleExpandedKey}
        />

        <main className="min-w-0 flex-1 overflow-x-hidden px-3 py-4 sm:px-5 lg:px-6">
          {hasBranchAccess ? children : (
            <NoBranchAccess companyName={currentCompany.name} />
          )}
        </main>

        <aside
          data-main-notifications-root
          className={joinClasses(
            "hidden overflow-hidden border-l border-darknavy/10 bg-white transition-[width,opacity,transform,border-color] duration-200 ease-out will-change-[width,opacity,transform] motion-reduce:transition-none xl:block",
            isNotificationsOpen
              ? "w-[22rem] translate-x-0 opacity-100"
              : "pointer-events-none w-0 translate-x-3 border-transparent opacity-0",
          )}
        >
          <div
            className={joinClasses(
              "h-full w-[22rem] transition-opacity duration-150 ease-out motion-reduce:transition-none",
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

function HelpModalLoading() {
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-darknavy/40 px-3 py-4 backdrop-blur-sm">
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
