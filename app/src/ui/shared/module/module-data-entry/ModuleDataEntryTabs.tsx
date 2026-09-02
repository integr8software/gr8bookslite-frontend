"use client";

import {
  createContext,
  useContext,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { ModuleDataEntryProps } from "@/app/src/types/shared/module/module-data-entry/DataEntryTypes";
import { ModuleDataEntry } from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntry";

type ModuleDataEntryTab<TTab extends string> = {
  id: TTab;
  label: string;
};

const ModuleDataEntryTabsContext = createContext<ReactNode>(null);

export function ModuleDataEntryTabs<TTab extends string>({
  activeTab,
  ariaLabel,
  children,
  onTabChange,
  tabs,
}: {
  activeTab: TTab;
  ariaLabel: string;
  children: ReactNode;
  onTabChange: (tab: TTab) => void;
  tabs: ModuleDataEntryTab<TTab>[];
}) {
  const tabListRef = useRef<HTMLDivElement>(null);
  const [tabListWidth, setTabListWidth] = useState(0);

  useLayoutEffect(() => {
    const tabList = tabListRef.current;

    if (!tabList) {
      return;
    }

    function updateTabListWidth() {
      setTabListWidth(tabList?.getBoundingClientRect().width ?? 0);
    }

    updateTabListWidth();
    const resizeObserver = new ResizeObserver(updateTabListWidth);
    resizeObserver.observe(tabList);

    return () => resizeObserver.disconnect();
  }, []);

  const tabList = (
    <div
      ref={tabListRef}
      role="tablist"
      aria-label={ariaLabel}
      className="inline-flex rounded-lg border border-darknavy/10 bg-offwhite/70 p-1"
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={activeTab === tab.id}
          onClick={() => onTabChange(tab.id)}
          className={[
            "h-8 rounded-md px-3 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coralpink/25",
            activeTab === tab.id
              ? "bg-white text-coralpink shadow-sm ring-1 ring-darknavy/10"
              : "text-darknavy/55 hover:bg-white/70 hover:text-darknavy",
          ].join(" ")}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );

  const tabListPlaceholder = (
    <span
      aria-hidden="true"
      className="block h-[42px] shrink-0"
      style={{ width: tabListWidth }}
    />
  );

  return (
    <div className="relative min-w-0">
      <div className="absolute left-4 top-3 z-[60]">{tabList}</div>
      <ModuleDataEntryTabsContext.Provider value={tabListPlaceholder}>
        {children}
      </ModuleDataEntryTabsContext.Provider>
    </div>
  );
}

export function TabbedModuleDataEntry<TRow extends { id: string }>(props: ModuleDataEntryProps<TRow>) {
  const tabs = useContext(ModuleDataEntryTabsContext);

  return <ModuleDataEntry {...props} title={tabs ?? props.title} />;
}
