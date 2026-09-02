import type {
  MainBranch,
  MainCompany,
  MainNavigationScope,
  MainNotification,
  MainSearchItem,
} from "@/app/src/types/shared/main-layout/MainLayoutDomainTypes";
import type {
  MainBreadcrumbDropdownItem,
  MainNotificationTab,
} from "@/app/src/types/shared/main-layout/MainLayoutTypes";

export type MainTopbarUser = {
  initials: string;
  name: string;
  profileImageUrl?: string;
  userRole: string;
  userRoleDetails?: {
    name: string;
  };
};

export type MainTopbarProps = {
  activeHref: string;
  activeNavigationScope: MainNavigationScope;
  availableCompanies: MainCompany[];
  branchDropdownItems: MainBreadcrumbDropdownItem[];
  canAccessMaster: boolean;
  canAccessWorkspace: boolean;
  canSwitchCompany: boolean;
  currentBranch: MainBranch | null;
  currentCompany: MainCompany;
  currentUser: MainTopbarUser;
  isBranchLoading: boolean;
  homeHref: string;
  isHelpOpen: boolean;
  isNotificationsOpen: boolean;
  isProfileLoading?: boolean;
  isTopbarContextLoading?: boolean;
  isSearchOpen: boolean;
  isSidebarOpen: boolean;
  notificationTab: MainNotificationTab;
  notifications: MainNotification[];
  query: string;
  searchResults: MainSearchItem[];
  unreadNotificationCount: number;
  onCloseHelp: () => void;
  onCloseNotifications: () => void;
  onCloseSearch: () => void;
  onCloseSidebar: () => void;
  onLoadBranchOptions: () => void;
  onMarkAllNotificationsAsRead: () => void;
  onMarkNotificationAsRead: (notificationId: string) => void;
  onNotificationTabChange: (tab: MainNotificationTab) => void;
  onOpenHelp: () => void;
  onQueryChange: (value: string) => void;
  onSelectBranch: (branchId: string) => void;
  onSelectCompany: (companyId: string) => void;
  onSwitchToMaster: () => void;
  onSwitchToWorkspace: () => void;
  onToggleNotifications: () => void;
  onToggleSearch: () => void;
  onToggleSidebar: () => void;
};

export type OpenSwitcherKey = "company" | "branch";

export type SwitcherVariant = "desktop" | "mobile";
