import {
  ReceivingReportResponsibilityCenterOptions,
  ReceivingReportTermsOfPaymentOptions,
  ReceivingReportWarehouseOptions,
} from "@/app/src/constants/modules/inventory/receiving-report/ReceivingReportConstants";
import {
  CurrencyExchangeRateField,
  SelectField,
  TextAreaField,
  TextField,
} from "@/app/src/ui/modules/inventory/receiving-report/action/ReceivingReportFields";
import type { ReceivingReportSectionProps } from "@/app/src/types/modules/inventory/receiving-report/ReceivingReportTypes";

export function ReceivingReportVendorSection({ errors, isReadonly, onChange, values }: ReceivingReportSectionProps) {
  return (
    <div className="grid gap-5">
      <div className="grid gap-x-4 gap-y-2 xl:grid-cols-2 2xl:grid-cols-[minmax(0,1.35fr)_minmax(0,1.2fr)_minmax(0,0.95fr)]">
        <div className="grid min-w-0 content-start gap-4">
          <TextField
            label="Party Name"
            name="vceName"
            value={values.vceName}
            disabled={isReadonly}
            required
            error={errors.vceName}
            onChange={onChange}
          />
          <TextField
            label="Address"
            name="address"
            value={values.address}
            disabled={isReadonly}
            required
            error={errors.address}
            onChange={onChange}
          />
          <TextField label="Contact Person" name="contactPerson" value={values.contactPerson} disabled={isReadonly} onChange={onChange} />
          <TextField
            label="Contact No"
            name="contactNo"
            value={values.contactNo}
            disabled={isReadonly}
            required
            error={errors.contactNo}
            onChange={onChange}
          />
          <TextField label="Project Code" name="projectCode" value={values.projectCode} disabled={isReadonly} onChange={onChange} />
          <TextField label="Project Name" name="projectName" value={values.projectName} disabled={isReadonly} onChange={onChange} />
          <TextAreaField label="Remarks" name="remarks" value={values.remarks} disabled={isReadonly} onChange={onChange} />
        </div>
        <div className="grid min-w-0 content-start gap-4">
          <TextField
            label="Party Code"
            name="vceCode"
            value={values.vceCode}
            disabled
            required
            error={errors.vceCode}
            onChange={onChange}
          />
          <SelectField
            label="Warehouse"
            name="warehouse"
            value={values.warehouse}
            disabled={isReadonly}
            required
            error={errors.warehouse}
            options={ReceivingReportWarehouseOptions}
            onChange={onChange}
          />
          <SelectField
            label="Terms of Payment"
            name="termsOfPayment"
            value={values.termsOfPayment}
            disabled={isReadonly}
            error={errors.termsOfPayment}
            options={ReceivingReportTermsOfPaymentOptions}
            onChange={onChange}
          />
          <TextField
            label="Due Date"
            name="dueDate"
            type="date"
            value={values.dueDate}
            disabled={isReadonly}
            error={errors.dueDate}
            onChange={onChange}
          />
          <CurrencyExchangeRateField
            currencyValue={values.currency}
            exchangeRateValue={values.exchangeRate}
            disabled={isReadonly}
            currencyError={errors.currency}
            exchangeRateError={errors.exchangeRate}
            onChange={onChange}
          />
          <SelectField
            label="Responsibility Center"
            name="responsibilityCenter"
            value={values.responsibilityCenter}
            disabled={isReadonly}
            required
            error={errors.responsibilityCenter}
            options={ReceivingReportResponsibilityCenterOptions}
            onChange={onChange}
          />
        </div>
        <div className="grid min-w-0 content-start gap-4">
          <TextField label="RR No." name="transNo" value={values.transNo} disabled required error={errors.transNo} onChange={onChange} />
          <TextField
            label="RR Date"
            name="documentDate"
            type="date"
            value={values.documentDate}
            disabled={isReadonly}
            required
            error={errors.documentDate}
            onChange={onChange}
          />
          <TextField
            label="PO No."
            name="poNo"
            value={values.poNo}
            disabled={isReadonly}
            required
            error={errors.poNo}
            onChange={onChange}
          />
          <TextField label="DR No." name="drNo" value={values.drNo} disabled={isReadonly} onChange={onChange} />
          <TextField label="SI No." name="siNo" value={values.siNo} disabled={isReadonly} onChange={onChange} />
          <TextField label="IMP No." name="importationRefNo" value={values.importationRefNo} disabled={isReadonly} onChange={onChange} />
          <TextField label="Status" name="status" value={values.status} disabled required error={errors.status} onChange={onChange} />
        </div>
      </div>
    </div>
  );
}
