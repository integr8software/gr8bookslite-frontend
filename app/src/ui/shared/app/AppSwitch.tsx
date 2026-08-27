export type AppSwitchOption<TValue extends string | boolean> = {
  label: string;
  value: TValue;
};

export type AppSwitchProps<TValue extends string | boolean> = {
  className?: string;
  disabled?: boolean;
  falseOption: AppSwitchOption<TValue>;
  id?: string;
  readOnly?: boolean;
  trueOption: AppSwitchOption<TValue>;
  value: TValue;
  onChange: (value: TValue) => void;
};

export function AppSwitch<TValue extends string | boolean>({
  className,
  disabled = false,
  falseOption,
  id,
  onChange,
  readOnly = false,
  trueOption,
  value,
}: AppSwitchProps<TValue>) {
  const isChecked = value === trueOption.value;
  const isDisabled = disabled || readOnly;

  function handleToggle() {
    if (isDisabled) {
      return;
    }

    onChange(isChecked ? falseOption.value : trueOption.value);
  }

  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={isChecked}
      aria-disabled={isDisabled}
      disabled={disabled}
      onClick={handleToggle}
      className={[
        "inline-flex min-h-11 w-full items-center justify-between gap-3 rounded-md border px-3 py-2.5 text-left text-sm font-semibold transition",
        readOnly
          ? "app-theme-field-readonly shadow-none"
          : isChecked
            ? "border-[var(--skyblue)] bg-[rgb(var(--skyblue-rgb)/0.05)] text-darknavy ring-2 ring-[rgb(var(--skyblue-rgb)/0.15)]"
            : "border-darknavy/15 bg-white text-darknavy hover:border-[rgb(var(--skyblue-rgb)/0.55)] hover:bg-[rgb(var(--skyblue-rgb)/0.05)]",
        isDisabled ? "cursor-default" : "cursor-pointer",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <span>{isChecked ? trueOption.label : falseOption.label}</span>
      <span
        className={[
          "relative h-6 w-11 shrink-0 rounded-full border transition",
          isChecked
            ? "border-[var(--skyblue)] bg-[var(--skyblue)]"
            : "border-darknavy/15 bg-darknavy/10",
        ]
          .filter(Boolean)
          .join(" ")}
        aria-hidden="true"
      >
        <span
          className={[
            "absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-white shadow-sm transition",
            isChecked ? "left-6" : "left-1",
          ]
            .filter(Boolean)
            .join(" ")}
        />
      </span>
    </button>
  );
}
