import Link from "next/link";
import { CheckCircle2, CircleOff, Edit3, Eye } from "lucide-react";
import {
  getNextUserStatus,
  type UserStatus,
} from "@/app/src/data/modules/system-administration/user-management/UserManagementData";

export function UserRoleRecordActions({
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
    <div className="flex items-center gap-1 lg:justify-end">
      <Link href={`${baseHref}/view/${id}`} aria-label={`View ${name}`} className={linkClassName}>
        <Eye className="h-4 w-4" aria-hidden="true" />
      </Link>
      <Link href={`${baseHref}/edit/${id}`} aria-label={`Edit ${name}`} className={linkClassName}>
        <Edit3 className="h-4 w-4" aria-hidden="true" />
      </Link>
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
  "flex h-9 w-9 items-center justify-center rounded-md text-coralpink hover:bg-coralpink/10";
const activeButtonClassName =
  "flex h-9 w-9 items-center justify-center rounded-md text-emerald-700 hover:bg-emerald-50";
const linkClassName =
  "flex h-9 w-9 items-center justify-center rounded-md text-darknavy/65 hover:bg-darknavy/5";
