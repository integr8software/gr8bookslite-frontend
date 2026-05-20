export function UserRoleAccessToggle({
  checked,
  disabled,
  isPartial,
  label,
  onChange,
}: {
  checked: boolean;
  disabled: boolean;
  isPartial?: boolean;
  label: string;
  onChange: () => void;
}) {
  return (
    <label
      className={[
        "flex min-h-8 items-center justify-center rounded border px-2 py-1 text-center text-xs font-semibold transition",
        checked
          ? "border-blue-200 bg-blue-50 text-blue-700"
          : isPartial
            ? "border-amber-200 bg-amber-50 text-amber-700"
            : "border-darknavy/10 bg-white text-darknavy/55",
        disabled
          ? "cursor-not-allowed opacity-60"
          : "cursor-pointer hover:border-blue-200",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={onChange}
        aria-label={label}
        className="sr-only"
      />
      <span className="truncate">{label}</span>
    </label>
  );
}
