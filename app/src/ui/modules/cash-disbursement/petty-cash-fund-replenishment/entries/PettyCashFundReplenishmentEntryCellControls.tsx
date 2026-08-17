import { PettyCashFundReplenishmentEntryInputClassName } from "@/app/src/constants/modules/cash-disbursement/petty-cash-fund-replenishment/PettyCashFundReplenishmentConstants";
import { MoneyNumberField } from "@/app/src/ui/shared/money/MoneyNumberField";

export function PettyCashFundReplenishmentEntryInput({ id, name, onChange, placeholder, readOnly, type = "text", value }: { id: string; name: string; onChange: (value: string) => void; placeholder?: string; readOnly: boolean; type?: "date" | "text"; value: string }) {
  return <input id={id} name={name} type={type} value={value} readOnly={readOnly} placeholder={placeholder} title={placeholder} onChange={(event) => onChange(event.target.value)} className={PettyCashFundReplenishmentEntryInputClassName} />;
}

export function PettyCashFundReplenishmentMoneyInput({ id, name, onChange, readOnly, value }: { id: string; name: string; onChange: (value: string) => void; readOnly: boolean; value: string }) {
  return <MoneyNumberField id={id} name={name} value={value} readOnly={readOnly} onValueChange={onChange} className={`${PettyCashFundReplenishmentEntryInputClassName} text-right tabular-nums`} />;
}
