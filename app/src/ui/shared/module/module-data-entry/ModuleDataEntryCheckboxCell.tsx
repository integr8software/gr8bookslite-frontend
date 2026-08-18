type ModuleDataEntryCheckboxCellProps = {
  checked: boolean;
  inputId: string;
  inputName?: string;
  isReadonly: boolean;
  label: string;
  onChange: (checked: boolean) => void;
};

export function ModuleDataEntryCheckboxCell({
  checked,
  inputId,
  inputName,
  isReadonly,
  label,
  onChange,
}: ModuleDataEntryCheckboxCellProps) {
  return (
    <label
      htmlFor={inputId}
      className={`flex h-10 w-full items-center justify-center ${
        isReadonly ? "cursor-default bg-darknavy/[0.03]" : "cursor-pointer"
      }`}
      title={label}
    >
      <input
        id={inputId}
        name={inputName}
        type="checkbox"
        checked={checked}
        disabled={isReadonly}
        aria-label={label}
        className="h-4 w-4 rounded border-darknavy/25 accent-skyblue outline-none focus-visible:ring-2 focus-visible:ring-skyblue/35 disabled:cursor-default disabled:opacity-60"
        onChange={(event) => onChange(event.target.checked)}
      />
    </label>
  );
}
