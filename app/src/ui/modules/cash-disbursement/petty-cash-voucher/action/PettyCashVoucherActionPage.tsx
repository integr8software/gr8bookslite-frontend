"use client";

import { useRouter } from "next/navigation";
import {
  PettyCashVoucherActionTabs,
  PettyCashVoucherLink,
} from "@/app/src/constants/modules/cash-disbursement/petty-cash-voucher/PettyCashVoucherConstants";
import { usePettyCashVoucherActionPage } from "@/app/src/hooks/modules/cash-disbursement/petty-cash-voucher/usePettyCashVoucherActionPage";
import type { PettyCashVoucherFormMode } from "@/app/src/types/modules/cash-disbursement/petty-cash-voucher/PettyCashVoucherTypes";
import { ResponsibilityCenterDrawer } from "@/app/src/ui/modules/financial-maintenance/responsibility-center/ResponsibilityCenterDrawer";
import { PartyManagementDrawer } from "@/app/src/ui/modules/party-management/PartyManagementDrawer";
import { ModuleTabs } from "@/app/src/ui/shared/module/module-tabs/ModuleTabs";
import { TransactionSummaryCards } from "@/app/src/ui/shared/transaction-setup/TransactionSummaryCards";
import { PettyCashVoucherActionHeader } from "@/app/src/ui/modules/cash-disbursement/petty-cash-voucher/action/PettyCashVoucherActionHeader";
import { PettyCashVoucherDetailsFields } from "@/app/src/ui/modules/cash-disbursement/petty-cash-voucher/action/PettyCashVoucherDetailsFields";
import { PettyCashVoucherFileAttachmentFields } from "@/app/src/ui/modules/cash-disbursement/petty-cash-voucher/action/PettyCashVoucherFileAttachmentFields";
import { PettyCashVoucherNotFound } from "@/app/src/ui/modules/cash-disbursement/petty-cash-voucher/action/PettyCashVoucherNotFound";
import { PettyCashVoucherReportPreview } from "@/app/src/ui/modules/cash-disbursement/petty-cash-voucher/reports/PettyCashVoucherReportPreview";
import { openPettyCashVoucherPdf } from "@/app/src/ui/modules/cash-disbursement/petty-cash-voucher/reports/PettyCashVoucherPdf";

export function PettyCashVoucherActionPage({ mode }: { mode: PettyCashVoucherFormMode }) {
  const router = useRouter();
  const closePage = () => router.push(PettyCashVoucherLink);
  const page = usePettyCashVoucherActionPage({ mode, onSaved: closePage });

  if (page.needsRecord && !page.existingVoucher) {
    return <PettyCashVoucherNotFound />;
  }

  return (
    <>
      <section className="grid gap-5">
        <PettyCashVoucherActionHeader page={page} />

        <ModuleTabs
          activeTab={page.activeTab}
          ariaLabel="Petty cash voucher sections"
          tabs={PettyCashVoucherActionTabs}
          onTabChange={page.setActiveTab}
        />

        {page.activeTab === "details" ? (
          <>
            <PettyCashVoucherDetailsFields
              canAddParty={page.partyStore.permissions.canCreate}
              canAddResponsibilityCenter={page.responsibilityCenterStore.permissions.canCreate}
              page={page}
              onOpenPartyDrawer={page.openPartyDrawer}
              onOpenResponsibilityCenterDrawer={page.openResponsibilityCenterDrawer}
            />
            <TransactionSummaryCards
              grossAmount={page.values.amount}
              vatRate={page.values.vatRate || "0.00%"}
              vatAmount={page.values.vatAmount}
              ewtRate={page.values.ewtRate || "0.00%"}
              ewtAmount={page.values.ewtAmount}
              netAmount={page.values.netAmount}
              taxLabelType="EWT"
            />
          </>
        ) : (
          <PettyCashVoucherFileAttachmentFields page={page} />
        )}
      </section>
      <PartyManagementDrawer
        isOpen={!page.isReadonly && page.isPartyDrawerOpen}
        isPending={page.partyStore.isMutating}
        records={page.partyStore.records}
        title="Add Party Name"
        onAddRecord={page.partyStore.addRecord}
        onClose={page.closePartyDrawer}
        onCreateParty={page.handleCreateParty}
      />
      <ResponsibilityCenterDrawer
        isOpen={!page.isReadonly && page.isResponsibilityCenterDrawerOpen}
        mode="add"
        onClose={page.closeResponsibilityCenterDrawer}
        onSaved={page.handleSaveResponsibilityCenter}
      />
      <PettyCashVoucherReportPreview
        isOpen={page.isReportPreviewOpen}
        page={page}
        onClose={page.closeReportPreview}
        onGeneratePdf={() => openPettyCashVoucherPdf(page.values)}
      />
    </>
  );
}
