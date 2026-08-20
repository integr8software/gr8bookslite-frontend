"use client";

import dynamic from "next/dynamic";
import { useParams, usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useState } from "react";
import {
  InitialAppDisbursementTypeRecords,
  type AppDisbursementTypeRecord,
} from "@/app/src/ui/shared/transaction-setup/AppDisbursementTypeDialog";
import { useOfficialReceiptActionForm } from "@/app/src/hooks/modules/cash-receipt/official-receipt/useOfficialReceipt";
import type { OfficialReceiptModuleConfig } from "@/app/src/hooks/modules/cash-receipt/official-receipt/useOfficialReceipt";
import {
  OfficialReceiptActionTabs,
  OfficialReceiptHref,
} from "@/app/src/constants/modules/cash-receipt/official-receipt/OfficialReceiptConstants";
import { getPartyDisplayName } from "@/app/src/data/modules/party-management/PartyManagementData";
import { usePartyManagementStore } from "@/app/src/hooks/modules/party-management/usePartyManagement";
import { usePaymentTypeStore } from "@/app/src/hooks/modules/financial-maintenance/payment-type/usePaymentType";
import type {
  OfficialReceiptActionMode,
  OfficialReceiptActionTab,
  OfficialReceiptCopyFromRecord,
} from "@/app/src/types/modules/cash-receipt/official-receipt/OfficialReceiptTypes";
import type {
  DisbursementPaymentMethod,
  DisbursementType,
} from "@/app/src/types/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherTypes";
import { OfficialReceiptActionHeader } from "@/app/src/ui/modules/cash-receipt/official-receipt/OfficialReceiptActionHeader";
import { OfficialReceiptDetailsForm } from "@/app/src/ui/modules/cash-receipt/official-receipt/OfficialReceiptDetailsForm";
import { OfficialReceiptEntries } from "@/app/src/ui/modules/cash-receipt/official-receipt/OfficialReceiptEntries";
import { OfficialReceiptNotFound } from "@/app/src/ui/modules/cash-receipt/official-receipt/OfficialReceiptNotFound";
import { openOfficialReceiptPdf } from "@/app/src/ui/modules/cash-receipt/official-receipt/OfficialReceiptPdf";
import { OfficialReceiptReportPreview } from "@/app/src/ui/modules/cash-receipt/official-receipt/OfficialReceiptReportPreview";
import { ReceiptFileAttachmentFields } from "@/app/src/ui/modules/cash-receipt/shared/ReceiptFileAttachmentFields";
import { PartyManagementDrawer } from "@/app/src/ui/modules/party-management/PartyManagementDrawer";
import { ModuleTabs } from "@/app/src/ui/shared/module/module-tabs/ModuleTabs";

const AppPaymentTypeDialog = dynamic(
  () => import("@/app/src/ui/shared/transaction-setup/AppPaymentTypeDialog").then((module) => module.AppPaymentTypeDialog),
  { ssr: false },
);

const AppDisbursementTypeDialog = dynamic(
  () => import("@/app/src/ui/shared/transaction-setup/AppDisbursementTypeDialog").then((module) => module.AppDisbursementTypeDialog),
  { ssr: false },
);

type OfficialReceiptActionPageProps = OfficialReceiptModuleConfig & {
  baseHref?: string;
  copyFromRecords?: OfficialReceiptCopyFromRecord[];
  copyFromSources?: string[];
  notFoundFallback?: ReactNode;
  receiptCodeLabel?: string;
  receiptLabel?: string;
};

export function OfficialReceiptActionPage({
  baseHref = OfficialReceiptHref,
  copyFromRecords,
  copyFromSources,
  fallbackReceipts,
  notFoundFallback,
  receiptCodeLabel = "OR",
  receiptLabel = "Official Receipt",
  storageKey,
}: OfficialReceiptActionPageProps = {}) {
  const params = useParams<{ recordId?: string }>();
  const pathname = usePathname();
  const router = useRouter();
  const mode = getModeFromPathname(pathname);
  const isReadonly = mode === "view";
  const recordId = typeof params.recordId === "string" ? params.recordId : undefined;
  const [activeTab, setActiveTab] = useState<OfficialReceiptActionTab>("details");
  const receiptForm = useOfficialReceiptActionForm(
    mode,
    recordId,
    () => {
      router.push(baseHref);
    },
    {
      copyFromRecords,
      fallbackReceipts,
      receiptLabel: receiptLabel.toLowerCase(),
      storageKey,
    },
  );
  const paymentTypeStore = usePaymentTypeStore();
  const partyStore = usePartyManagementStore();
  const [isPaymentTypeDialogOpen, setIsPaymentTypeDialogOpen] = useState(false);
  const [isPartyDrawerOpen, setIsPartyDrawerOpen] = useState(false);
  const [isReportPreviewOpen, setIsReportPreviewOpen] = useState(false);
  const [isCollectionTypeDialogOpen, setIsCollectionTypeDialogOpen] = useState(false);
  const [collectionTypeRecords, setCollectionTypeRecords] = useState(InitialAppDisbursementTypeRecords);

  if (receiptForm.isNotFound) {
    return notFoundFallback ?? <OfficialReceiptNotFound />;
  }

  function createCollectionType(record: AppDisbursementTypeRecord) {
    setCollectionTypeRecords((currentRecords) => [record, ...currentRecords]);

    return record;
  }

  function updateCollectionType(record: AppDisbursementTypeRecord) {
    setCollectionTypeRecords((currentRecords) =>
      currentRecords.map((currentRecord) => (currentRecord.id === record.id ? record : currentRecord)),
    );

    return record;
  }

  function updatePartyFromName(partyName: string) {
    const selectedParty = partyStore.records.find((record) => getPartyDisplayName(record) === partyName);

    receiptForm.updateField("partyCode", selectedParty?.partyCodeNo ?? "");
  }

  return (
    <>
      <section className="grid gap-5">
        <OfficialReceiptActionHeader
          baseHref={baseHref}
          copyFromRecords={copyFromRecords}
          copyFromSources={copyFromSources}
          mode={mode}
          recordId={recordId}
          receiptLabel={receiptLabel}
          values={receiptForm.values}
          onCopyFrom={receiptForm.applyCopyFrom}
          onPreview={() => setIsReportPreviewOpen(true)}
          onSubmit={receiptForm.submitReceipt}
        />
        <ModuleTabs
          activeTab={activeTab}
          ariaLabel={`${receiptLabel} sections`}
          tabs={OfficialReceiptActionTabs}
          onTabChange={setActiveTab}
        />
        {activeTab === "details" ? (
          <>
            <OfficialReceiptDetailsForm
              isReadonly={isReadonly}
              receiptCodeLabel={receiptCodeLabel}
              values={receiptForm.values}
              onOpenPartyDrawer={() => setIsPartyDrawerOpen(true)}
              onOpenPaymentTypeDialog={() => setIsPaymentTypeDialogOpen(true)}
              onPartyNameChange={updatePartyFromName}
              onUpdateField={receiptForm.updateField}
            />
            <OfficialReceiptEntries
              entryView={receiptForm.entryView}
              isReadonly={isReadonly}
              rows={receiptForm.values.lineEntries}
              onEntryViewChange={receiptForm.setEntryView}
              onOpenCollectionTypeDialog={() => setIsCollectionTypeDialogOpen(true)}
              onRowsChange={receiptForm.updateLineEntries}
            />
          </>
        ) : (
          <ReceiptFileAttachmentFields
            attachments={receiptForm.values.attachments}
            inputId={`${receiptCodeLabel.toLowerCase()}-file-attachments`}
            inputName={`${receiptCodeLabel.toLowerCase()}Attachments`}
            isReadonly={isReadonly}
            uploadTitle={`Upload ${receiptLabel} Documents`}
            onAttachmentsChange={(attachments) => receiptForm.updateField("attachments", attachments)}
          />
        )}
      </section>

      <OfficialReceiptReportPreview
        isOpen={isReportPreviewOpen}
        values={receiptForm.values}
        onClose={() => setIsReportPreviewOpen(false)}
        onGeneratePdf={() => openOfficialReceiptPdf(receiptForm.values)}
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
          receiptForm.updateField("partyCode", record.partyCodeNo);
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

function getModeFromPathname(pathname: string): OfficialReceiptActionMode {
  if (pathname.includes("/view/")) {
    return "view";
  }

  if (pathname.includes("/edit/")) {
    return "edit";
  }

  return "add";
}
