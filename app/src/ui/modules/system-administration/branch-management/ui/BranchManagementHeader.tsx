import Link from "next/link";
import { Plus } from "lucide-react";
import { BranchManagementHref } from "@/app/src/constants/modules/branch-manager/BranchManagementConstants";

export function BranchManagementHeader() {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="text-xl font-semibold text-darknavy">
          Branch Management
        </h2>
        <p className="mt-1 text-sm text-darknavy/55">
          Maintain company branches and satellite offices used by the main
          layout switcher.
        </p>
      </div>
      <Link
        href={`${BranchManagementHref}/add`}
        className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-skyblue px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-skyblue/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/35"
      >
        <Plus className="h-4 w-4" aria-hidden="true" />
        Add Branch
      </Link>
    </div>
  );
}
