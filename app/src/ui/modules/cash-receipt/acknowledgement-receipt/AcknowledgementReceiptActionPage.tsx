"use client";

import dynamic from "next/dynamic";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  InitialAppDisbursementTypeRecords,
  type AppDisbursementTypeRecord,
} from "@/app/src/ui/shared/transaction-setup/AppDisbursementTypeDialog";
import { useAcknowledgementReceiptActionForm } from "@/app/src/hooks/modules/cash-receipt/acknowledgement-receipt/useAcknowledgementReceipt";
import { AcknowledgementReceiptHref } from "@/app/src/constants/modules/cash-receipt/acknowledgement-receipt/AcknowledgementReceiptConstants";
import { getPartyDisplayName } from "@/app/src/data/modules/maintenance/party-management/PartyManagementData";
import { usePartyManagementStore } from "@/app/src/hooks/modules/maintenance/party-management/usePartyManagement";
import { usePaymentTypeStore } from "@/app/src/hooks/modules/maintenance/payment-type/usePaymentType";
import type { AcknowledgementReceiptActionMode } from "@/app/src/types/modules/cash-receipt/acknowledgement-receipt/AcknowledgementReceiptTypes";
import type { DisbursementPaymentMethod, DisbursementType } from "@/app/src/types/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherTypes";
import { AcknowledgementReceiptActionHeader } from "@/app/src/ui/modules/cash-receipt/acknowledgement-receipt/AcknowledgementReceiptActionHeader";
import { AcknowledgementReceiptDetailsForm } from "@/app/src/ui/modules/cash-receipt/acknowledgement-receipt/AcknowledgementReceiptDetailsForm";
import { AcknowledgementReceiptEntries } from "@/app/src/ui/modules/cash-receipt/acknowledgement-receipt/AcknowledgementReceiptEntries";
import { openAcknowledgementReceiptPdf } from "@/app/src/ui/modules/cash-receipt/acknowledgement-receipt/AcknowledgementReceiptPdf";
import { AcknowledgementReceiptReportPreview } from "@/app/src/ui/modules/cash-receipt/acknowledgement-receipt/AcknowledgementReceiptReportPreview";
import { PartyManagementDrawer } from "@/app/src/ui/modules/maintenance/party-management/PartyManagementDrawer";

const AppPaymentTypeDialog = dynamic(
  () =>
    import("@/app/src/ui/shared/transaction-setup/AppPaymentTypeDialog").then(
      (module) => module.AppPaymentTypeDialog,
    ),
  { ssr: false },
);

const AppDisbursementTypeDialog = dynamic(
  () =>
    import("@/app/src/ui/shared/transaction-setup/AppDisbursementTypeDialog").then(
      (module) => module.AppDisbursementTypeDialog,
    ),
  { ssr: false },
);

export function AcknowledgementReceiptActionPage() {
  const params = useParams<{ recordId?: string }>();
  const pathname = usePathname();
  const router = useRouter();
  const mode = getModeFromPathname(pathname);
  const isReadonly = mode === "view";
  const recordId = typeof params.recordId === "string" ? params.recordId : undefined;
  const receiptForm = useAcknowledgementReceiptActionForm(mode, recordId, () => {
    router.push(AcknowledgementReceiptHref);
  });
  const paymentTypeStore = usePaymentTypeStore();
  const partyStore = usePartyManagementStore();
  const [isPaymentTypeDialogOpen, setIsPaymentTypeDialogOpen] = useState(false);
  const [isPartyDrawerOpen, setIsPartyDrawerOpen] = useState(false);
  const [isReportPreviewOpen, setIsReportPreviewOpen] = useState(false);
  const [isCollectionTypeDialogOpen, setIsCollectionTypeDialogOpen] =
    useState(false);
  const [collectionTypeRecords, setCollectionTypeRecords] = useState(
    InitialAppDisbursementTypeRecords,
  );

  function createCollectionType(record: AppDisbursementTypeRecord) {
    setCollectionTypeRecords((currentRecords) => [record, ...currentRecords]);

    return record;
  }

  function updateCollectionType(record: AppDisbursementTypeRecord) {
    setCollectionTypeRecords((currentRecords) =>
      currentRecords.map((currentRecord) =>
        currentRecord.id === record.id ? record : currentRecord,
      ),
    );

    return record;
  }

  return (
    <>
      <section className="grid gap-5">
        <AcknowledgementReceiptActionHeader
          mode={mode}
          values={receiptForm.values}
          onCopyFrom={receiptForm.applyCopyFrom}
          onPreview={() => setIsReportPreviewOpen(true)}
          onSubmit={receiptForm.submitReceipt}
        />
        <AcknowledgementReceiptDetailsForm
          isReadonly={isReadonly}
          values={receiptForm.values}
          onOpenPartyDrawer={() => setIsPartyDrawerOpen(true)}
          onOpenPaymentTypeDialog={() => setIsPaymentTypeDialogOpen(true)}
          onUpdateField={receiptForm.updateField}
        />
        <AcknowledgementReceiptEntries
          entryView={receiptForm.entryView}
          isReadonly={isReadonly}
          rows={receiptForm.values.lineEntries}
          onEntryViewChange={receiptForm.setEntryView}
          onOpenCollectionTypeDialog={() => setIsCollectionTypeDialogOpen(true)}
          onRowsChange={receiptForm.updateLineEntries}
        />
      </section>

      <AcknowledgementReceiptReportPreview
        isOpen={isReportPreviewOpen}
        values={receiptForm.values}
        onClose={() => setIsReportPreviewOpen(false)}
        onPrint={() => openAcknowledgementReceiptPdf(receiptForm.values)}
      />

      {!isReadonly && isPaymentTypeDialogOpen ? (
        <AppPaymentTypeDialog
          isOpen
          isLoading={paymentTypeStore.isLoading}
          isMutating={paymentTypeStore.isMutating}
          records={paymentTypeStore.paymentTypes}
          onClose={() => setIsPaymentTypeDialogOpen(false)}
          onCreateRecord={paymentTypeStore.addPaymentType}
          onUpdateRecord={paymentTypeStore.updatePaymentType}
          onSelect={(paymentType: DisbursementPaymentMethod) => {
            receiptForm.updateField("paymentType", paymentType);
            setIsPaymentTypeDialogOpen(false);
          }}
        />
      ) : null}
      <PartyManagementDrawer
        isOpen={!isReadonly && isPartyDrawerOpen}
        isPending={partyStore.isMutating}
        records={partyStore.records}
        onAddRecord={partyStore.addRecord}
        onClose={() => setIsPartyDrawerOpen(false)}
        onCreateParty={(record) => {
          receiptForm.updateField("customerName", getPartyDisplayName(record));
          setIsPartyDrawerOpen(false);
        }}
      />
      <AppDisbursementTypeDialog
        isOpen={!isReadonly && isCollectionTypeDialogOpen}
        title="Collection Type Maintenance"
        description="Maintain collection type name, classification type, and status."
        searchPlaceholder="Search collection type or type..."
        saveErrorMessage="Could not save collection type. Please try again."
        loadingLabel="Loading collection types..."
        emptyLabel="No collection types matched the current filter."
        records={collectionTypeRecords}
        onClose={() => setIsCollectionTypeDialogOpen(false)}
        onCreateRecord={createCollectionType}
        onUpdateRecord={updateCollectionType}
        onSelect={(collectionType: DisbursementType) => {
          receiptForm.updateFirstLineEntry({ collectionType });
          setIsCollectionTypeDialogOpen(false);
        }}
      />
    </>
  );
}

function getModeFromPathname(pathname: string): AcknowledgementReceiptActionMode {
  if (pathname.includes("/view/")) {
    return "view";
  }

  if (pathname.includes("/edit/")) {
    return "edit";
  }

  return "add";
}
