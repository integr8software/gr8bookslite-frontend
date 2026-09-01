"use client";

import dynamic from "next/dynamic";
import { useParams, usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import {
  InitialAppDisbursementTypeRecords,
  type AppDisbursementTypeRecord,
} from "@/app/src/ui/shared/transaction-setup/AppDisbursementTypeDialog";
import { useAcknowledgementReceiptActionForm } from "@/app/src/hooks/modules/cash-receipt/acknowledgement-receipt/useAcknowledgementReceipt";
import type { AcknowledgementReceiptModuleConfig } from "@/app/src/hooks/modules/cash-receipt/acknowledgement-receipt/useAcknowledgementReceipt";
import {
  AcknowledgementReceiptActionTabs,
  AcknowledgementReceiptHref,
} from "@/app/src/constants/modules/cash-receipt/acknowledgement-receipt/AcknowledgementReceiptConstants";
import { getPartyDisplayName } from "@/app/src/data/modules/party-management/PartyManagementData";
import { usePartyManagementStore } from "@/app/src/hooks/modules/party-management/usePartyManagement";
import { usePaymentTypeStore } from "@/app/src/hooks/modules/financial-maintenance/payment-type/usePaymentType";
import type {
  AcknowledgementReceiptActionMode,
  AcknowledgementReceiptActionTab,
  AcknowledgementReceiptCopyFromRecord,
} from "@/app/src/types/modules/cash-receipt/acknowledgement-receipt/AcknowledgementReceiptTypes";
import type {
  DisbursementPaymentMethod,
  DisbursementType,
} from "@/app/src/types/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherTypes";
import type { PaymentTypeRecord } from "@/app/src/types/modules/financial-maintenance/payment-type/PaymentTypeTypes";
import type { PartyInformationRecord } from "@/app/src/types/modules/party-management/PartyManagementTypes";
import type { AppAdvancedDropdownOption } from "@/app/src/types/shared/advanced-dropdown/AppAdvancedDropdownTypes";
import { AcknowledgementReceiptActionHeader } from "@/app/src/ui/modules/cash-receipt/acknowledgement-receipt/form/AcknowledgementReceiptActionHeader";
import { AcknowledgementReceiptDetailsForm } from "@/app/src/ui/modules/cash-receipt/acknowledgement-receipt/form/AcknowledgementReceiptDetailsForm";
import { AcknowledgementReceiptEntries } from "@/app/src/ui/modules/cash-receipt/acknowledgement-receipt/entries/AcknowledgementReceiptEntries";
import { AcknowledgementReceiptNotFound } from "@/app/src/ui/modules/cash-receipt/acknowledgement-receipt/overview/AcknowledgementReceiptNotFound";
import { openAcknowledgementReceiptPdf } from "@/app/src/ui/modules/cash-receipt/acknowledgement-receipt/reports/AcknowledgementReceiptPdf";
import { AcknowledgementReceiptReportPreview } from "@/app/src/ui/modules/cash-receipt/acknowledgement-receipt/reports/AcknowledgementReceiptReportPreview";
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

type AcknowledgementReceiptActionPageProps<
  TReceipt = Parameters<typeof useAcknowledgementReceiptActionForm>[3] extends AcknowledgementReceiptModuleConfig<infer TConfigReceipt>
    ? TConfigReceipt
    : never,
> = AcknowledgementReceiptModuleConfig<TReceipt> & {
  baseHref?: string;
  copyFromRecords?: AcknowledgementReceiptCopyFromRecord[];
  copyFromSources?: string[];
  notFoundFallback?: ReactNode;
  receiptCodeLabel?: string;
  receiptLabel?: string;
};

export function AcknowledgementReceiptActionPage<TReceipt>({
  api,
  baseHref = AcknowledgementReceiptHref,
  copyFromRecords,
  copyFromSources,
  notFoundFallback,
  receiptCodeLabel = "AR",
  receiptLabel = "Collection Receipt",
  storageKey,
}: AcknowledgementReceiptActionPageProps<TReceipt> = {}) {
  const params = useParams<{ recordId?: string }>();
  const pathname = usePathname();
  const router = useRouter();
  const mode = getModeFromPathname(pathname);
  const isReadonly = mode === "view";
  const recordId = typeof params.recordId === "string" ? params.recordId : undefined;
  const [activeTab, setActiveTab] = useState<AcknowledgementReceiptActionTab>("details");
  const receiptForm = useAcknowledgementReceiptActionForm(
    mode,
    recordId,
    () => {
      router.push(baseHref);
    },
    {
      api,
      copyFromRecords,
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
  const partyOptions = useMemo(() => createPartyOptions(partyStore.records), [partyStore.records]);
  const paymentTypeOptions = useMemo(() => createPaymentTypeOptions(paymentTypeStore.paymentTypes), [paymentTypeStore.paymentTypes]);

  if (receiptForm.isNotFound) {
    return notFoundFallback ?? <AcknowledgementReceiptNotFound />;
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

  return (
    <>
      <section className="grid gap-5">
        <AcknowledgementReceiptActionHeader
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
          tabs={AcknowledgementReceiptActionTabs}
          onTabChange={setActiveTab}
        />
        {activeTab === "details" ? (
          <>
            <AcknowledgementReceiptDetailsForm
              isReadonly={isReadonly}
              partyOptions={partyOptions}
              paymentTypeOptions={paymentTypeOptions}
              receiptCodeLabel={receiptCodeLabel}
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

      <AcknowledgementReceiptReportPreview
        isOpen={isReportPreviewOpen}
        values={receiptForm.values}
        onClose={() => setIsReportPreviewOpen(false)}
        onGeneratePdf={() => openAcknowledgementReceiptPdf(receiptForm.values)}
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
            const selectedRecord = paymentTypeStore.paymentTypes.find((record) => record.paymentType === paymentType);

            receiptForm.updateField("paymentId", selectedRecord?.id ?? "");
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

function getModeFromPathname(pathname: string): AcknowledgementReceiptActionMode {
  if (pathname.includes("/view/")) {
    return "view";
  }

  if (pathname.includes("/edit/")) {
    return "edit";
  }

  return "add";
}

function createPartyOptions(records: PartyInformationRecord[]): AppAdvancedDropdownOption[] {
  return records
    .filter((record) => record.status === "Active" && record.partyCodeNo.trim())
    .map((record) => ({
      description: record.partyTypes.join(", "),
      label: record.partyCodeNo,
      name: getPartyDisplayName(record),
      selectedDetails: record.partyCodeNo,
      value: record.partyCodeNo,
    }));
}

function createPaymentTypeOptions(records: PaymentTypeRecord[]): AppAdvancedDropdownOption[] {
  return records
    .filter((record) => record.status === "Active" && record.paymentType.trim())
    .sort((leftRecord, rightRecord) =>
      leftRecord.sortOrder === rightRecord.sortOrder
        ? leftRecord.paymentType.localeCompare(rightRecord.paymentType)
        : leftRecord.sortOrder - rightRecord.sortOrder,
    )
    .map((record) => ({
      description: record.description || record.type,
      label: record.type,
      name: record.paymentType,
      value: record.id,
    }));
}
