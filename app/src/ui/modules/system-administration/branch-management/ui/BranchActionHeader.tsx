import Link from "next/link";
import { ArrowLeft, Edit3, Save, Trash2, X } from "lucide-react";
import type { MainBranch } from "@/app/src/data/shared/MainLayout/ModuleShellTypes";
import { BranchManagementHref } from "@/app/src/constants/modules/branch-manager/BranchManagementConstants";
import type { BranchActionMode } from "@/app/src/types/modules/branch-manager/BranchActionTypes";

type BranchActionHeaderProps = {
  branch?: MainBranch;
  isReadonly: boolean;
  mode: BranchActionMode;
  onDeleteBranch: () => void;
};

export function BranchActionHeader({
  branch,
  isReadonly,
  mode,
  onDeleteBranch,
}: BranchActionHeaderProps) {
  const pageTitle =
    mode === "view"
      ? "View Branch"
      : mode === "edit"
        ? "Edit Branch"
        : "Add Branch";
  const helperText =
    mode === "view"
      ? "Review branch and satellite details used by the topbar switcher."
      : mode === "edit"
        ? "Update the branch record shared with the topbar switcher."
        : "New records are added to the shared branch mock data used by the topbar switcher.";

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h2 className="text-xl font-semibold text-darknavy">{pageTitle}</h2>
        <p className="mt-1 text-sm text-darknavy/55">{helperText}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {mode === "view" ? (
          <Link
            href={BranchManagementHref}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-darknavy/15 bg-white px-4 text-sm font-semibold text-darknavy shadow-sm transition hover:border-skyblue/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/35"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back
          </Link>
        ) : null}
        {mode === "view" && branch ? (
          <Link
            href={`${BranchManagementHref}/edit/${branch.id}`}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-darknavy/15 bg-white px-4 text-sm font-semibold text-darknavy shadow-sm transition hover:border-skyblue/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/35"
          >
            <Edit3 className="h-4 w-4" aria-hidden="true" />
            Edit
          </Link>
        ) : null}
        {branch ? (
          <button
            type="button"
            onClick={onDeleteBranch}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-coralpink/25 bg-white px-4 text-sm font-semibold text-coralpink shadow-sm transition hover:bg-coralpink/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coralpink/30"
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
            Delete
          </button>
        ) : null}
        {mode === "edit" && branch ? (
          <Link
            href={`${BranchManagementHref}/view/${branch.id}`}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-darknavy/15 bg-white px-4 text-sm font-semibold text-darknavy shadow-sm transition hover:border-skyblue/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/35"
          >
            <X className="h-4 w-4" aria-hidden="true" />
            Cancel
          </Link>
        ) : null}
        {!isReadonly ? (
          <button
            type="submit"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-skyblue px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-skyblue/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/35"
          >
            <Save className="h-4 w-4" aria-hidden="true" />
            Save Branch
          </button>
        ) : null}
      </div>
    </div>
  );
}
