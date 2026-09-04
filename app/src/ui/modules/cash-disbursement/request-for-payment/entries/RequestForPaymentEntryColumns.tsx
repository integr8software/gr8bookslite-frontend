import {
  RequestForPaymentRefTypeOptions,
  RequestForPaymentResponsibilityCenterLookupOptions,
} from "@/app/src/constants/modules/cash-disbursement/request-for-payment/RequestForPaymentConstants";
import type {
  RequestForPaymentActionPageState,
  RequestForPaymentItem,
  RequestForPaymentItemColumnId,
  RequestForPaymentOpenResponsibilityCenterDrawerHandler,
  RequestForPaymentRefType,
} from "@/app/src/types/modules/cash-disbursement/request-for-payment/RequestForPaymentTypes";
import type { AppAdvancedDropdownOption } from "@/app/src/types/shared/advanced-dropdown/AppAdvancedDropdownTypes";
import type { ModuleDataEntryColumn } from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntry";
import { ModuleDataEntryDropdownCell } from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntryDropdownCell";
import { ModuleDataEntryInputCell } from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntryInputCell";
import { ModuleDataEntryMoneyCell } from "@/app/src/ui/shared/module/module-data-entry/ModuleDataEntryMoneyCell";

export function createRequestForPaymentItemColumns(
  page: RequestForPaymentActionPageState,
  labels: Record<RequestForPaymentItemColumnId, string>,
  widths: Record<RequestForPaymentItemColumnId, number>,
  onOpenResponsibilityCenterDrawer?: RequestForPaymentOpenResponsibilityCenterDrawerHandler,
): Record<RequestForPaymentItemColumnId, ModuleDataEntryColumn<RequestForPaymentItem>> {
  const text = (
    id: RequestForPaymentItemColumnId,
    type: "text" | "date" = "text",
  ): ModuleDataEntryColumn<RequestForPaymentItem> => ({
    header: labels[id],
    id,
    width: widths[id],
    widthClassName: "w-auto",
    renderCell: (row, _index, context) => (
      <ModuleDataEntryInputCell
        id={context.fieldId}
        name={context.fieldName}
        type={type}
        value={String(row[id] ?? "")}
        readOnly={page.isReadonly}
        placeholder={`Enter ${labels[id]}`}
        onChange={(value) => page.updateItem(row.id, { [id]: value })}
      />
    ),
  });

  const money = (id: RequestForPaymentItemColumnId): ModuleDataEntryColumn<RequestForPaymentItem> => ({
    header: labels[id],
    id,
    width: widths[id],
    widthClassName: "w-auto",
    renderCell: (row, _index, context) => (
      <ModuleDataEntryMoneyCell
        id={context.fieldId}
        name={context.fieldName}
        value={row[id]}
        readOnly={page.isReadonly}
        placeholder="0.00"
        onChange={(value) => page.updateItem(row.id, { [id]: value })}
      />
    ),
  });

  const dropdown = (
    id: RequestForPaymentItemColumnId,
    options: AppAdvancedDropdownOption[],
    onSelectOption?: (row: RequestForPaymentItem, option: AppAdvancedDropdownOption) => void,
    addAction?: { label: string; onClick: (row: RequestForPaymentItem) => void },
  ): ModuleDataEntryColumn<RequestForPaymentItem> => ({
    header: labels[id],
    id,
    width: widths[id],
    widthClassName: "w-auto",
    renderCell: (row, _index, context) => (
      <ModuleDataEntryDropdownCell
        id={context.fieldId}
        name={context.fieldName}
        value={String(row[id] ?? "")}
        readOnly={page.isReadonly}
        options={options}
        placeholder={`Select ${labels[id]}`}
        searchPlaceholder={`Search ${labels[id]}`}
        addAction={
          addAction
            ? {
                label: addAction.label,
                onClick: () => addAction.onClick(row),
              }
            : undefined
        }
        onChange={(value: string) => {
          if (onSelectOption) {
            const found = options.find((opt) => opt.value === value);
            if (found) {
              onSelectOption(row, found);
              return;
            }
          }
          page.updateItem(row.id, { [id]: value });
        }}
      />
    ),
  });

  return {
    date: text("date", "date"),
    refType: dropdown("refType", RequestForPaymentRefTypeOptions, (row, option) => {
      page.updateItem(row.id, { refType: option.value as RequestForPaymentRefType });
    }),
    refNumber: text("refNumber"),
    particulars: text("particulars"),
    responsibilityCenterCode: text("responsibilityCenterCode"),
    responsibilityCenterName: dropdown(
      "responsibilityCenterName",
      RequestForPaymentResponsibilityCenterLookupOptions,
      (row, option) => {
        page.updateItem(row.id, {
          responsibilityCenterCode: option.value,
          responsibilityCenterName: option.name,
        });
      },
      onOpenResponsibilityCenterDrawer
        ? {
            label: "Add Responsibility Center",
            onClick: (row) => onOpenResponsibilityCenterDrawer(row.id),
          }
        : undefined,
    ),
    amount: money("amount"),
  };
}
