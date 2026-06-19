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
        "relative flex h-8 min-w-0 items-center justify-center rounded border px-2 text-center text-xs font-semibold leading-none transition",
        checked
          ? "permission-neutral-control"
          : isPartial
            ? "border-amber-500/35 bg-amber-500/12 text-amber-500"
            : "border-darknavy/10 bg-white text-darknavy/55",
        disabled
          ? "cursor-not-allowed opacity-60"
          : "cursor-pointer",
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
      <span className="block max-w-full truncate">{label}</span>
    </label>
  );
}
