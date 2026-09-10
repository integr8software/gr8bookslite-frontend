"use client";
import { usePartyInformationTabs } from "@/app/src/hooks/modules/party-management/usePartyInformationTabs";
import type {
  PartyInformationDetailsFieldsProps,
  PartyInformationTab,
} from "@/app/src/types/modules/party-management/PartyManagementTypes";
import { PartyAccountingInformationTab } from "@/app/src/ui/modules/party-management/forms/tabs/PartyAccountingInformationTab";
import { PartyBankInformationTab } from "@/app/src/ui/modules/party-management/forms/tabs/PartyBankInformationTab";
import { PartyBasicInformationTab } from "@/app/src/ui/modules/party-management/forms/tabs/PartyBasicInformationTab";
import { PartyContactInformationTab } from "@/app/src/ui/modules/party-management/forms/tabs/PartyContactInformationTab";
import { PartyTaxInformationTab } from "@/app/src/ui/modules/party-management/forms/tabs/PartyTaxInformationTab";
import { ModuleTabs } from "@/app/src/ui/shared/module/module-tabs/ModuleTabs";

export function PartyInformationDetailsFields(props: PartyInformationDetailsFieldsProps) {
  const fields = usePartyInformationTabs(props);
  const { activeTab, setActiveTab, basicErrorCount, contactErrorCount, bankErrorCount, taxErrorCount, accountingErrorCount } = fields;
  const tabs: PartyInformationTab[] = [
    {
      id: "basic-information",
      label: "Basic Information",
      badge: basicErrorCount,
      badgeTone: basicErrorCount > 0 ? "error" : "info",
      content: <PartyBasicInformationTab {...fields} />,
    },
    {
      id: "contact-information",
      label: "Contact Information",
      badge: contactErrorCount,
      badgeTone: contactErrorCount > 0 ? "error" : "info",
      content: <PartyContactInformationTab {...fields} />,
    },
    {
      id: "bank-information",
      label: "Bank Information",
      badge: bankErrorCount,
      badgeTone: bankErrorCount > 0 ? "error" : "info",
      content: <PartyBankInformationTab {...fields} />,
    },
    {
      id: "tax-information",
      label: "Tax Information",
      badge: taxErrorCount,
      badgeTone: taxErrorCount > 0 ? "error" : "info",
      content: <PartyTaxInformationTab {...fields} />,
    },
    {
      id: "accounting-information",
      label: "Accounting Information",
      badge: accountingErrorCount,
      badgeTone: accountingErrorCount > 0 ? "error" : "info",
      content: <PartyAccountingInformationTab {...fields} />,
    },
  ];
  const activeTabContent = tabs.find((tab) => tab.id === activeTab)?.content;
  return (
    <div className="grid gap-5">
      <ModuleTabs activeTab={activeTab} ariaLabel="Party information sections" tabs={tabs} onTabChange={setActiveTab} />
      <section className="min-w-0 rounded-lg border border-darknavy/10 bg-white p-4 shadow-sm shadow-darknavy/5 sm:p-5">
        {activeTabContent}
      </section>
    </div>
  );
}
