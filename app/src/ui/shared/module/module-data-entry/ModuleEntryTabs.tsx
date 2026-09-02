import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";

export type ModuleEntryTabItem<T extends string = string> = {
  id: T;
  label: string;
};

export type ModuleEntryTabsProps<T extends string = string> = {
  activeTab: T;
  onTabChange: (tab: T) => void;
  tabs: readonly ModuleEntryTabItem<T>[];
  ariaLabel?: string;
};

export function ModuleEntryTabs<T extends string = string>({
  activeTab,
  onTabChange,
  tabs,
  ariaLabel = "Entry view tabs",
}: ModuleEntryTabsProps<T>) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className="inline-flex items-center gap-1 rounded-lg border border-darknavy/10 bg-offwhite/70 p-1"
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onTabChange(tab.id)}
            className={joinClasses(
              "h-8 rounded-md px-3 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/25",
              isActive
                ? "bg-white text-skyblue shadow-sm ring-1 ring-darknavy/10"
                : "text-darknavy/55 hover:bg-white/70 hover:text-darknavy",
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
