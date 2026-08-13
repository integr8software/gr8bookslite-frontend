import { useMemo } from "react";
import { ModuleTabs, type ModuleTabItem } from "@/app/src/ui/shared/module/module-tabs/ModuleTabs";
import type { ReceivingReportActionTab } from "@/app/src/types/modules/inventory/receiving-report/ReceivingReportTypes";

export function ReceivingReportTabs({
  activeTab,
  attachmentCount,
  onTabChange,
}: {
  activeTab: ReceivingReportActionTab;
  attachmentCount: number;
  onTabChange: (tab: ReceivingReportActionTab) => void;
}) {
  const tabs = useMemo<ModuleTabItem<ReceivingReportActionTab>[]>(
    () => [
      { id: "details", label: "Details" },
      { badge: attachmentCount, id: "attachments", label: "Attachments" },
    ],
    [attachmentCount],
  );

  return (
    <ModuleTabs
      activeTab={activeTab}
      ariaLabel="Receiving report sections"
      tabs={tabs}
      onTabChange={onTabChange}
    />
  );
}
