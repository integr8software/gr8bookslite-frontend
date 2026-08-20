import { RevolvingFundReplenishmentEntryInputClassName } from "@/app/src/constants/modules/cash-disbursement/revolving-fund-replenishment/RevolvingFundReplenishmentConstants";
import { MoneyNumberField } from "@/app/src/ui/shared/money/MoneyNumberField";

export function RevolvingFundReplenishmentEntryInput({
  id,
  name,
  onChange,
  placeholder,
  readOnly,
  type = "text",
  value,
}: {
  id: string;
  name: string;
  onChange: (value: string) => void;
  placeholder?: string;
  readOnly: boolean;
  type?: "date" | "text";
  value: string;
}) {
  return (
    <>
      <label htmlFor={id} className="sr-only">{name}</label>
      <input id={id} name={name} type={type} value={value} readOnly={readOnly} placeholder={placeholder} title={placeholder} onChange={(event) => onChange(event.target.value)} className={RevolvingFundReplenishmentEntryInputClassName} />
    </>
  );
}

export function RevolvingFundReplenishmentMoneyInput({
  id,
  name,
  onChange,
  readOnly,
  value,
}: {
  id: string;
  name: string;
  onChange: (value: string) => void;
  readOnly: boolean;
  value: string;
}) {
  return (
    <>
      <label htmlFor={id} className="sr-only">{name}</label>
      <MoneyNumberField id={id} name={name} value={value} readOnly={readOnly} onValueChange={onChange} className={`${RevolvingFundReplenishmentEntryInputClassName} text-right tabular-nums`} />
    </>
  );
}
