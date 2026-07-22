import { useEffect, useState, type KeyboardEvent } from "react";
import { formatCurrency } from "@/app/src/utils/currency.util";
import type {
  ItemFormValues,
  ItemPriceListRecord,
} from "@/app/src/types/modules/maintenance/items/ItemManagementTypes";

type ItemPriceListsTableProps = {
  isReadonly: boolean;
  priceLists: ItemPriceListRecord[];
  values: ItemFormValues;
  onUpdatePrice: (priceListId: string, price: number) => void;
};

export function ItemPriceListsTable({
  isReadonly,
  onUpdatePrice,
  priceLists,
  values,
}: ItemPriceListsTableProps) {
  const activePriceLists = priceLists.filter((priceList) => priceList.status === "Active");

  return (
    <section className="rounded-lg border border-darknavy/10 bg-white p-4 shadow-sm sm:p-5">
      <div>
        <h2 className="text-base font-semibold text-darknavy">Price Lists</h2>
        <p className="mt-1 text-sm text-darknavy/55">
          Maintain multi-pricing for retail, wholesale, dealer, VIP, and other customer groups.
        </p>
      </div>
      <div className="mt-4 overflow-auto">
        <table className="w-full min-w-[56rem] text-left text-sm">
          <thead className="bg-darknavy/[0.03] text-xs font-semibold uppercase tracking-wide text-darknavy/50">
            <tr>
              <th className="px-3 py-3">Price List</th>
              <th className="px-3 py-3">Customer Type</th>
              <th className="px-3 py-3">Pricing Mode</th>
              <th className="px-3 py-3 text-right">Item Price</th>
              <th className="px-3 py-3 text-right">Retail Difference</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-darknavy/8">
            {activePriceLists.map((priceList) => {
              const price =
                values.priceListPrices.find(
                  (priceListPrice) => priceListPrice.priceListId === priceList.id,
                )?.price ?? values.sellingPrice;

              return (
                <tr key={priceList.id}>
                  <td className="px-3 py-3">
                    <div className="font-semibold text-darknavy">{priceList.name}</div>
                    <div className="mt-0.5 text-xs text-darknavy/45">
                      {priceList.code} | {priceList.currency}
                    </div>
                  </td>
                  <td className="px-3 py-3 text-darknavy/70">{priceList.customerType}</td>
                  <td className="px-3 py-3 text-darknavy/70">{priceList.pricingMode}</td>
                  <td className="px-3 py-3">
                    <DecimalNumberInput
                      value={price}
                      readOnly={isReadonly}
                      onValueChange={(value) => onUpdatePrice(priceList.id, value)}
                    />
                  </td>
                  <td className="px-3 py-3 text-right font-semibold">
                    {formatCurrency(price - values.sellingPrice)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function DecimalNumberInput({
  readOnly,
  value,
  onValueChange,
}: {
  readOnly: boolean;
  value: number;
  onValueChange: (value: number) => void;
}) {
  const [draftValue, setDraftValue] = useState(String(value));

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Keep the editable draft synchronized when parent numeric value changes.
    setDraftValue(String(value));
  }, [value]);

  function handleChange(nextValue: string) {
    if (/[eE+-]/.test(nextValue)) {
      return;
    }

    setDraftValue(nextValue);

    if (!nextValue.trim()) {
      return;
    }

    const parsedValue = Number(nextValue);

    if (Number.isFinite(parsedValue) && parsedValue >= 0) {
      onValueChange(parsedValue);
    }
  }

  function handleBlur() {
    if (!draftValue.trim()) {
      onValueChange(0);
      setDraftValue("0");
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (["e", "E", "+", "-"].includes(event.key)) {
      event.preventDefault();
    }
  }

  return (
    <input
      type="number"
      min={0}
      step="any"
      inputMode="decimal"
      value={draftValue}
      readOnly={readOnly}
      onBlur={handleBlur}
      onChange={(event) => handleChange(event.target.value)}
      onKeyDown={handleKeyDown}
      className={`${fieldClassName} text-right`}
    />
  );
}

const fieldClassName =
  "min-h-10 w-full rounded-md border border-darknavy/15 bg-white px-3 text-sm font-medium text-darknavy outline-none transition focus:border-skyblue focus:ring-2 focus:ring-skyblue/20 read-only:bg-offwhite/65";
