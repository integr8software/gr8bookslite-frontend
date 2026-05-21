import Link from "next/link";
import { CircleOff, Edit3, Eye } from "lucide-react";

export function UserListRecordActions({
  baseHref,
  id,
  name,
  onDelete,
}: {
  baseHref: string;
  id: string;
  name: string;
  onDelete: (id: string, name: string) => void;
}) {
  return (
    <div className="flex items-center gap-1 lg:justify-end">
      <IconLink href={`${baseHref}/view/${id}`} label="View">
        <Eye className="h-4 w-4" aria-hidden="true" />
      </IconLink>
      <IconLink href={`${baseHref}/edit/${id}`} label="Edit">
        <Edit3 className="h-4 w-4" aria-hidden="true" />
      </IconLink>
      <button
        type="button"
        onClick={() => onDelete(id, name)}
        aria-label={`Set ${name} inactive`}
        className="flex h-9 w-9 items-center justify-center rounded-md text-coralpink transition hover:bg-coralpink/10"
      >
        <CircleOff className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}

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
