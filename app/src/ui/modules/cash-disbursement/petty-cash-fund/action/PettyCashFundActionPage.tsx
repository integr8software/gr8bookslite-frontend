"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  PettyCashFundActionTabs,
  PettyCashFundHref,
} from "@/app/src/constants/modules/cash-disbursement/petty-cash-fund/PettyCashFundConstants";
import { getPartyDisplayName } from "@/app/src/data/modules/party-management/PartyManagementData";
import { usePettyCashFundActionPage } from "@/app/src/hooks/modules/cash-disbursement/petty-cash-fund/usePettyCashFund";
import { usePartyManagementStore } from "@/app/src/hooks/modules/party-management/usePartyManagement";
import type { PartyInformationRecord } from "@/app/src/types/modules/party-management/PartyManagementTypes";
import { PartyManagementDrawer } from "@/app/src/ui/modules/party-management/PartyManagementDrawer";
import { ResponsibilityCenterDrawer } from "@/app/src/ui/modules/financial-maintenance/responsibility-center/ResponsibilityCenterDrawer";
import { ModuleTabs } from "@/app/src/ui/shared/module/module-tabs/ModuleTabs";
import { PettyCashFundActionHeader } from "@/app/src/ui/modules/cash-disbursement/petty-cash-fund/action/PettyCashFundActionHeader";
import { PettyCashFundDetailsFields } from "@/app/src/ui/modules/cash-disbursement/petty-cash-fund/action/PettyCashFundDetailsFields";
import { PettyCashFundFileAttachmentFields } from "@/app/src/ui/modules/cash-disbursement/petty-cash-fund/action/PettyCashFundFileAttachmentFields";
import { PettyCashFundNotFound } from "@/app/src/ui/modules/cash-disbursement/petty-cash-fund/action/PettyCashFundNotFound";
import { PettyCashFundEntrySection } from "@/app/src/ui/modules/cash-disbursement/petty-cash-fund/entries/PettyCashFundEntrySection";
import { PettyCashFundReportPreview } from "@/app/src/ui/modules/cash-disbursement/petty-cash-fund/reports/PettyCashFundReportPreview";

export function PettyCashFundActionPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"details" | "attachments">("details");
  const [isPartyDrawerOpen, setIsPartyDrawerOpen] = useState(false);
  const [isProjectDrawerOpen, setIsProjectDrawerOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const partyStore = usePartyManagementStore();
  const page = usePettyCashFundActionPage({ onSaved: () => router.push(PettyCashFundHref) });
  if (page.isRecordMissing) return <PettyCashFundNotFound />;
  function handleCreateParty(record: PartyInformationRecord) {
    page.updateField("partyCode", record.partyCodeNo);
    page.updateField("partyName", getPartyDisplayName(record));
    setIsPartyDrawerOpen(false);
  }
  return (
    <>
      <section className="grid gap-5">
        <PettyCashFundActionHeader page={page} onPreview={() => setIsPreviewOpen(true)} />
        <ModuleTabs activeTab={activeTab} ariaLabel="Petty cash fund sections" tabs={PettyCashFundActionTabs} onTabChange={setActiveTab} />
        {activeTab === "details" ? (
          <>
            <PettyCashFundDetailsFields
              page={page}
              onOpenPartyDrawer={() => setIsPartyDrawerOpen(true)}
              onOpenProjectDrawer={() => setIsProjectDrawerOpen(true)}
            />
            <PettyCashFundEntrySection page={page} />
          </>
        ) : (
          <PettyCashFundFileAttachmentFields page={page} />
        )}
      </section>
      <PartyManagementDrawer
        isOpen={!page.isReadonly && isPartyDrawerOpen}
        isPending={partyStore.isMutating}
        records={partyStore.records}
        title="Add Custodian"
        onAddRecord={partyStore.addRecord}
        onClose={() => setIsPartyDrawerOpen(false)}
        onCreateParty={handleCreateParty}
      />
      <ResponsibilityCenterDrawer
        isOpen={!page.isReadonly && isProjectDrawerOpen}
        mode="add"
        onClose={() => setIsProjectDrawerOpen(false)}
        onSaved={(center) => {
          page.updateField("projectCode", center.code);
          page.updateField("projectName", center.name);
          setIsProjectDrawerOpen(false);
        }}
      />
      <PettyCashFundReportPreview isOpen={isPreviewOpen} onClose={() => setIsPreviewOpen(false)} page={page} />
    </>
  );
}
