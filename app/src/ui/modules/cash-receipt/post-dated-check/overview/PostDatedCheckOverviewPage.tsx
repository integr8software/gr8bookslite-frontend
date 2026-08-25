"use client";
import Link from "next/link";
import { CalendarClock, Plus, Search } from "lucide-react";
import { PostDatedCheckHref } from "@/app/src/constants/modules/cash-receipt/post-dated-check/PostDatedCheckConstants";
import { usePostDatedCheckOverviewPage } from "@/app/src/hooks/modules/cash-receipt/post-dated-check/usePostDatedCheckOverviewPage";
import type { PostDatedCheckRecord, PostDatedCheckStatus } from "@/app/src/types/modules/cash-receipt/post-dated-check/PostDatedCheckTypes";
import { ModuleHeader, moduleHeaderActionClassNames } from "@/app/src/ui/shared/module/ModuleHeader";
import { ModuleStatisticCards } from "@/app/src/ui/shared/module/ModuleStatisticCards";
import { formatCurrency } from "@/app/src/utils/currency.util";

export function PostDatedCheckOverviewPage() {
  const page = usePostDatedCheckOverviewPage();
  const cards = [
    {
      label: "Total Transaction",
      value: page.statistics?.totalRegistries ?? 0,
      summary: "All registries",
      icon: CalendarClock,
      iconClassName: "bg-skyblue/20 text-skyblue",
    },
    {
      label: "Draft",
      value: page.statistics?.draftRegistries ?? 0,
      summary: "Editable",
      icon: CalendarClock,
      iconClassName: "bg-citron/30 text-darknavy",
    },
    {
      label: "For Approval",
      value: page.statistics?.approvedRegistries ?? 0,
      summary: "Awaiting posting",
      icon: CalendarClock,
      iconClassName: "bg-skyblue/20 text-skyblue",
    },
    {
      label: "Posted",
      value: page.statistics?.closedRegistries ?? 0,
      summary: "Completed",
      icon: CalendarClock,
      iconClassName: "bg-emerald-100 text-emerald-700",
    },
  ];
  return (
    <section className="grid gap-5">
      <ModuleHeader
        variant="panel"
        titleAs="h1"
        title="Post Dated Check"
        description="Register and monitor party post-dated checks."
        eyebrow={
          <>
            <CalendarClock className="h-3.5 w-3.5" />
            Cash receipt
          </>
        }
        actions={
          <Link href={`${PostDatedCheckHref}/add`} className={moduleHeaderActionClassNames.primary}>
            <Plus className="h-4 w-4" />
            Create Post Dated Check
          </Link>
        }
      />
      <ModuleStatisticCards items={cards} isLoading={page.isLoading} />
      {page.error ? (
        <div role="alert" className="rounded-lg border border-coralpink/30 bg-coralpink/5 p-4 text-sm font-semibold text-coralpink">
          {page.error instanceof Error ? page.error.message : "Could not load Post Dated Check."}
        </div>
      ) : null}
      <section className="overflow-hidden rounded-lg border border-darknavy/10 bg-white shadow-sm">
        <div className="border-b border-darknavy/10 p-3">
          <label className="relative block max-w-xl">
            <Search className="absolute left-3 top-3 h-4 w-4 text-darknavy/40" />
            <span className="sr-only">Search PDC registries</span>
            <input
              className="h-10 w-full rounded-md border border-darknavy/15 pl-9 pr-3 text-sm outline-none focus:border-skyblue"
              placeholder="Search registry, party, bank, or PDC number"
              value={page.search}
              onChange={(event) => page.setSearch(event.target.value)}
            />
          </label>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-[72rem] w-full text-left text-sm">
            <thead className="bg-offwhite text-xs uppercase tracking-wide text-darknavy/65">
              <tr>
                {["Registry No.", "Registry Date", "Party Code", "Party Name", "Total Amount", "Status", "Actions"].map((header) => (
                  <th className="px-4 py-3" key={header}>
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-darknavy/10">
              {page.records.map((record) => (
                <RegistryRow
                  key={record.id}
                  record={record}
                  pending={page.isStatusPending}
                  onStatus={(status) => page.updateStatus(record.id, status)}
                />
              ))}
              {!page.isLoading && page.records.length === 0 ? (
                <tr>
                  <td className="px-4 py-12 text-center text-darknavy/55" colSpan={7}>
                    No Post Dated Check found.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  );
}
function RegistryRow({
  record,
  pending,
  onStatus,
}: {
  record: PostDatedCheckRecord;
  pending: boolean;
  onStatus: (status: PostDatedCheckStatus) => void;
}) {
  return (
    <tr className="text-darknavy">
      <td className="px-4 py-3 font-semibold">
        <Link className="text-skyblue hover:underline" href={`${PostDatedCheckHref}/view/${record.id}`}>
          {record.registryNo}
        </Link>
      </td>
      <td className="px-4 py-3">{record.registryDate}</td>
      <td className="px-4 py-3">{record.partyCode}</td>
      <td className="px-4 py-3">{record.partyName}</td>
      <td className="px-4 py-3 text-right tabular-nums">{formatCurrency(record.totalAmount)}</td>
      <td className="px-4 py-3">{record.status}</td>
      <td className="px-4 py-3">
        <div className="flex gap-2">
          <Link className="rounded border border-darknavy/15 px-2 py-1 hover:bg-offwhite" href={`${PostDatedCheckHref}/view/${record.id}`}>
            View
          </Link>
          {record.status === "Draft" ? (
            <>
              <Link
                className="rounded border border-darknavy/15 px-2 py-1 hover:bg-offwhite"
                href={`${PostDatedCheckHref}/edit/${record.id}`}
              >
                Edit
              </Link>
              <button disabled={pending} className="rounded bg-skyblue px-2 py-1 text-white" onClick={() => onStatus("For Approval")}>
                Approve
              </button>
              <button
                disabled={pending}
                className="rounded border border-coralpink/30 px-2 py-1 text-coralpink"
                onClick={() => onStatus("Cancelled")}
              >
                Cancel
              </button>
            </>
          ) : null}
          {record.status === "For Approval" ? (
            <button disabled={pending} className="rounded bg-darknavy px-2 py-1 text-white" onClick={() => onStatus("Posted")}>
              Post
            </button>
          ) : null}
        </div>
      </td>
    </tr>
  );
}
