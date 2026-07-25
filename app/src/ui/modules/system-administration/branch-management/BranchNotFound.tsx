import Link from "next/link";
import { BranchManagementHref } from "@/app/src/constants/modules/system-administration/branch-manager/BranchManagementConstants";

export function BranchNotFound() {
  return (
    <section className="rounded-lg border border-darknavy/10 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-semibold text-darknavy">Branch Not Found</h2>
      <p className="mt-2 text-sm text-darknavy/55">
        The selected branch record is not available in the branch list.
      </p>
      <Link
        href={BranchManagementHref}
        className="mt-4 inline-flex h-10 items-center rounded-md bg-skyblue px-4 text-sm font-semibold text-white"
      >
        Back to Branch Management
      </Link>
    </section>
  );
}
