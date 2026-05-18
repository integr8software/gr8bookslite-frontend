import Link from "next/link";
import { Edit3, Eye, Trash2 } from "lucide-react";

export function UserTypeRecordActions({
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
      <Link href={`${baseHref}/view/${id}`} aria-label="View" className={linkClassName}>
        <Eye className="h-4 w-4" aria-hidden="true" />
      </Link>
      <Link href={`${baseHref}/edit/${id}`} aria-label="Edit" className={linkClassName}>
        <Edit3 className="h-4 w-4" aria-hidden="true" />
      </Link>
      <button
        type="button"
        onClick={() => onDelete(id, name)}
        aria-label={`Delete ${name}`}
        className="flex h-9 w-9 items-center justify-center rounded-md text-coralpink hover:bg-coralpink/10"
      >
        <Trash2 className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}

const linkClassName =
  "flex h-9 w-9 items-center justify-center rounded-md text-darknavy/65 hover:bg-darknavy/5";
