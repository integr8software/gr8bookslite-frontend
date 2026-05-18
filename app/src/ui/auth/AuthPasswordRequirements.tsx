type AuthPasswordRequirementsProps = {
  password: string;
};

function RequirementItem({
  met,
  label,
}: {
  met: boolean;
  label: string;
}) {
  return (
    <li className={`text-xs ${met ? "text-green-600" : "text-darknavy/60"}`}>
      {label}
    </li>
  );
}

export function AuthPasswordRequirements({
  password,
}: AuthPasswordRequirementsProps) {
  return (
    <ul className="mt-3 space-y-1">
      <RequirementItem
        met={password.length >= 8}
        label="At least 8 characters"
      />
      <RequirementItem
        met={/[A-Z]/.test(password)}
        label="At least 1 uppercase letter"
      />
      <RequirementItem
        met={/\d/.test(password)}
        label="At least 1 number"
      />
      <RequirementItem
        met={/[a-z]/.test(password)}
        label="At least 1 lowercase letter"
      />
      <RequirementItem
        met={/[^A-Za-z0-9]/.test(password)}
        label="At least 1 special character"
      />
    </ul>
  );
}
