import {
  PurchaseRequestAddResponsibilityCenterLabel,
  PurchaseRequestCurrencyOptions,
  PurchaseRequestResponsibilityCenterLabel,
  PurchaseRequestResponsibilityCenterPlaceholder,
  PurchaseRequestResponsibilityCenterSearchPlaceholder,
  PurchaseRequestStatusOptions,
  PurchaseRequestTypeOptions,
} from "@/app/src/constants/modules/purchasing/purchase-request/PurchaseRequestConstants";
import type {
  PurchaseRequestFieldUpdater,
  PurchaseRequestFormValues,
  PurchaseRequestStatus,
} from "@/app/src/types/modules/purchasing/purchase-request/PurchaseRequestTypes";
import type { AppAdvancedDropdownOption } from "@/app/src/types/shared/advanced-dropdown/AppAdvancedDropdownTypes";
import {
  formatPurchaseTypesFromSelection,
  parsePurchaseTypesToSelection,
} from "@/app/src/data/modules/party-management/PartyPurchaseTypeData";
import {
  PurchaseRequestDateField,
  PurchaseRequestFieldClassName,
  PurchaseRequestFieldShell,
  PurchaseRequestSelectField,
  PurchaseRequestTextField,
} from "@/app/src/ui/modules/purchasing/purchase-request/form/PurchaseRequestFieldControls";
import { AppAdvancedDropdown } from "@/app/src/ui/shared/advanced-dropdown/AppAdvancedDropdown";
import { AppLookupDropdown } from "@/app/src/ui/shared/advanced-dropdown/AppLookupDropdown";
import { AppLimitedTextarea } from "@/app/src/ui/shared/app/AppLimitedTextarea";
import { CurrencyExchangeRateRow } from "@/app/src/ui/shared/app/CurrencyExchangeRateRow";
import { MoneyNumberField } from "@/app/src/ui/shared/money/MoneyNumberField";

type PurchaseRequestSupplierFieldsProps = {
  isReadonly: boolean;
  partyOptions: AppAdvancedDropdownOption[];
  projectOptions: AppAdvancedDropdownOption[];
  responsibilityCenterOptions: AppAdvancedDropdownOption[];
  values: PurchaseRequestFormValues;
  onOpenPartyDrawer: () => void;
  onOpenProjectDrawer: () => void;
  onOpenResponsibilityCenterDrawer: () => void;
  onSelectParty: (partyCode: string, partyName: string) => void;
  onSelectProject: (projectCode: string, projectName: string) => void;
  onSelectResponsibilityCenter: (centerId: string, centerName: string) => void;
  onUpdateField: PurchaseRequestFieldUpdater<PurchaseRequestFormValues>;
};

export function PurchaseRequestSupplierFields({
  isReadonly,
  onOpenPartyDrawer,
  onOpenProjectDrawer,
  onOpenResponsibilityCenterDrawer,
  onSelectParty,
  onSelectProject,
  onSelectResponsibilityCenter,
  onUpdateField,
  partyOptions,
  projectOptions,
  responsibilityCenterOptions,
  values,
}: PurchaseRequestSupplierFieldsProps) {
  return (
    <div className="grid min-w-0 gap-4 xl:grid-cols-2 2xl:grid-cols-3">
      <div className="grid min-w-0 gap-4">
        <PurchaseRequestFieldShell controlId="purchase-request-vce-name" label="Party Name" isRequired>
          <AppLookupDropdown
            id="purchase-request-vce-name"
            value={values.vceCode}
            readOnly={isReadonly}
            options={partyOptions}
            placeholder="Select Party Name"
            searchPlaceholder="Search Party Name"
            addAction={!isReadonly ? { label: "Add Party Name", onClick: onOpenPartyDrawer } : undefined}
            onChange={onSelectParty}
          />
        </PurchaseRequestFieldShell>
        <PurchaseRequestFieldShell controlId="purchase-request-vendor-address" label="Address">
          <textarea
            id="purchase-request-vendor-address"
            readOnly={isReadonly}
            value={values.vendorAddress ?? ""}
            onChange={(event) => onUpdateField("vendorAddress", event.target.value)}
            className={`${PurchaseRequestFieldClassName} min-h-20 py-3`}
          />
        </PurchaseRequestFieldShell>
        <PurchaseRequestFieldShell controlId="purchase-request-project-name" label="Project Name">
          <AppLookupDropdown
            id="purchase-request-project-name"
            value={values.projectCode}
            readOnly={isReadonly}
            options={projectOptions}
            placeholder="Select Project Name"
            searchPlaceholder="Search Project Name"
            addAction={!isReadonly ? { label: "Add Project Name", onClick: onOpenProjectDrawer } : undefined}
            onChange={onSelectProject}
          />
        </PurchaseRequestFieldShell>
        <PurchaseRequestFieldShell controlId="purchase-request-remarks" label="Remarks">
          <AppLimitedTextarea
            id="purchase-request-remarks"
            readOnly={isReadonly}
            value={values.remarks ?? ""}
            onChange={(event) => onUpdateField("remarks", event.target.value)}
            className={`${PurchaseRequestFieldClassName} min-h-20 py-3`}
            counterMode="remaining"
            maxLength={250}
          />
        </PurchaseRequestFieldShell>
      </div>

      <div className="grid min-w-0 content-start gap-4 2xl:col-start-2">
        <PurchaseRequestTextField
          id="purchase-request-vce-code"
          label="Party Code"
          isRequired
          readOnly={isReadonly}
          value={values.vceCode}
          onChange={(value) => onUpdateField("vceCode", value)}
        />
        <PurchaseRequestFieldShell controlId="purchase-request-purchase-type" label="Purchase Type" isRequired>
          <AppAdvancedDropdown
            id="purchase-request-purchase-type"
            disabled={isReadonly}
            emptyMessage="No matching purchase type found."
            isSearchable={false}
            options={PurchaseRequestTypeOptions.map((option) => ({
              name: option,
              value: option,
            }))}
            placeholder="--Select Purchase Type--"
            removeSelectionOnSelectedOptionClick
            selectionMode="multiple"
            showSelectionRemoveButton={false}
            value={parsePurchaseTypesToSelection(values.purchaseType)}
            onChange={(selected) =>
              onUpdateField(
                "purchaseType",
                formatPurchaseTypesFromSelection(selected),
              )
            }
          />
        </PurchaseRequestFieldShell>
        <PurchaseRequestTextField
          id="purchase-request-project-code"
          label="Project Code"
          readOnly
          value={values.projectCode}
          onChange={(value) => onUpdateField("projectCode", value)}
        />
        <PurchaseRequestFieldShell controlId="purchase-request-currency" label="Currency">
          <CurrencyExchangeRateRow
            exchangeRateControlId="purchase-request-exchange-rate"
            currencyControl={
              <AppAdvancedDropdown
                id="purchase-request-currency"
                className="w-full min-w-0"
                value={values.currency ?? ""}
                readOnly={isReadonly}
                options={PurchaseRequestCurrencyOptions.map((option) => ({
                  name: option,
                  value: option,
                }))}
                placeholder="PHP"
                onChange={(value) => onUpdateField("currency", String(value))}
              />
            }
            exchangeRateControl={
              <MoneyNumberField
                id="purchase-request-exchange-rate"
                value={String(values.exchangeRate ?? "")}
                readOnly={isReadonly}
                onValueChange={(value) => onUpdateField("exchangeRate", Number(value) || 0)}
                className={`${PurchaseRequestFieldClassName} text-right tabular-nums`}
              />
            }
          />
        </PurchaseRequestFieldShell>
        <PurchaseRequestFieldShell
          controlId="purchase-request-responsibility-center"
          label={PurchaseRequestResponsibilityCenterLabel}
        >
          <AppLookupDropdown
            id="purchase-request-responsibility-center"
            value={values.responsibilityCenterId || values.responsibilityCenter}
            readOnly={isReadonly}
            options={responsibilityCenterOptions}
            placeholder={PurchaseRequestResponsibilityCenterPlaceholder}
            searchPlaceholder={PurchaseRequestResponsibilityCenterSearchPlaceholder}
            addAction={
              !isReadonly
                ? {
                    label: PurchaseRequestAddResponsibilityCenterLabel,
                    onClick: onOpenResponsibilityCenterDrawer,
                  }
                : undefined
            }
            onChange={onSelectResponsibilityCenter}
          />
        </PurchaseRequestFieldShell>
      </div>

      <div className="grid min-w-0 content-start gap-4 2xl:col-start-3">
        <PurchaseRequestTextField
          id="purchase-request-trans-no"
          label="PR No."
          isRequired
          readOnly={isReadonly}
          value={values.transNo}
          onChange={(value) => onUpdateField("transNo", value)}
        />
        <PurchaseRequestDateField
          id="purchase-request-pr-date"
          label="PR Date"
          readOnly={isReadonly}
          value={values.prDate}
          onChange={(value) => onUpdateField("prDate", value)}
        />
        <PurchaseRequestSelectField
          id="purchase-request-status"
          label="Status"
          readOnly
          value={values.status}
          options={PurchaseRequestStatusOptions}
          onChange={(value) => onUpdateField("status", value as PurchaseRequestStatus)}
        />
      </div>
    </div>
  );
}
