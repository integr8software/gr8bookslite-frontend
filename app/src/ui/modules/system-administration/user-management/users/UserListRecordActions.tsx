import Link from "next/link";
import { CheckCircle2, CircleOff, Edit3, Eye } from "lucide-react";
import {
  getNextUserStatus,
  type UserStatus,
} from "@/app/src/data/modules/system-administration/user-management/UserManagementData";

export function UserListRecordActions({
  baseHref,
  id,
  name,
  status,
  onStatusChange,
}: {
  baseHref: string;
  id: string;
  name: string;
  status: UserStatus;
  onStatusChange: () => void;
}) {
  const nextStatus = getNextUserStatus(status);
  const StatusIcon = nextStatus === "Inactive" ? CircleOff : CheckCircle2;
  const statusButtonClassName =
    nextStatus === "Inactive" ? inactiveButtonClassName : activeButtonClassName;

  return (
    <div className="flex items-center justify-center gap-1">
      <IconLink href={`${baseHref}/view/${id}`} label={`View ${name}`}>
        <Eye className="h-4 w-4" aria-hidden="true" />
      </IconLink>
      <IconLink href={`${baseHref}/edit/${id}`} label={`Edit ${name}`}>
        <Edit3 className="h-4 w-4" aria-hidden="true" />
      </IconLink>
      <button
        type="button"
        onClick={onStatusChange}
        aria-label={`Set ${name} as ${nextStatus.toLowerCase()}`}
        className={statusButtonClassName}
      >
        <StatusIcon className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}

const inactiveButtonClassName =
  "flex h-9 w-9 items-center justify-center rounded-md text-coralpink transition hover:bg-coralpink/10";
const activeButtonClassName =
  "flex h-9 w-9 items-center justify-center rounded-md text-emerald-700 transition hover:bg-emerald-50";

function IconLink({
  children,
  href,
  label,
}: {
  children: React.ReactNode;
  href: string;
  label: string;
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      className="flex h-9 w-9 items-center justify-center rounded-md text-darknavy/65 transition hover:bg-darknavy/5"
    >
      {children}
    </Link>
  );
}
