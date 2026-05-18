import Link from "next/link";
import { Plus } from "lucide-react";

export function UserGroupHeader({
  addHref,
  description,
  title,
}: {
  addHref: string;
  description: string;
  title: string;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="text-xl font-semibold text-darknavy">{title}</h2>
        <p className="mt-1 text-sm text-darknavy/55">{description}</p>
      </div>
      <Link
        href={addHref}
        className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-skyblue px-4 text-sm font-semibold text-white"
      >
        <Plus className="h-4 w-4" aria-hidden="true" />
        Add Group
      </Link>
    </div>
  );
}
