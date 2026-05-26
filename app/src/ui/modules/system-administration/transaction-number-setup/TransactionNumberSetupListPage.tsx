"use client";

import Link from "next/link";
import { Hash, Plus, ReceiptText, Share2 } from "lucide-react";
import { TransactionNumberSetupHref } from "@/app/src/constants/modules/system-administration/transaction-number-setup/TransactionNumberSetupConstants";
import { useTransactionNumberSetupListPage } from "@/app/src/hooks/modules/system-administration/transaction-number-setup/useTransactionNumberSetupListPage";
import { AppDialog } from "@/app/src/ui/shared/app/AppDialog";
import {
	ModuleHeader,
	moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";
import { TransactionNumberSetupBlueprintPanel } from "@/app/src/ui/modules/system-administration/transaction-number-setup/TransactionNumberSetupBlueprintPanel";
import { TransactionNumberSetupTable } from "@/app/src/ui/modules/system-administration/transaction-number-setup/TransactionNumberSetupTable";

export function TransactionNumberSetupListPage() {
	const page = useTransactionNumberSetupListPage();

	return (
		<section className="grid gap-5">
			<ModuleHeader
				variant="panel"
				titleAs="h1"
				title="Transaction Number Setup"
				description="Maintain document number sequences by module and branch coverage."
				eyebrow={
					<>
						<ReceiptText className="h-3.5 w-3.5" aria-hidden="true" />
						System administration
					</>
				}
				actions={
					<Link
						href={`${TransactionNumberSetupHref}/add`}
						className={moduleHeaderActionClassNames.primary}
					>
						<Plus className="h-4 w-4" aria-hidden="true" />
						Add Setup
					</Link>
				}
			/>
			<div className="grid gap-3 lg:grid-cols-3">
				<SummaryTile
					icon={Hash}
					label="Active Sequences"
					value={String(page.activeSetupCount)}
				/>
				<SummaryTile
					icon={Share2}
					label="All/Shared Sequences"
					value={String(page.sharedSetupCount)}
				/>
				<RecentGeneratedTile
					recentUsageLogs={page.recentUsageLogs}
				/>
			</div>
			<TransactionNumberSetupTable
				branchNameById={page.branchNameById}
				generateNextNumber={page.generateNextNumber}
				handleQueryChange={page.handleQueryChange}
				handleScopeFilterChange={page.handleScopeFilterChange}
				isLoading={page.isLoading}
				query={page.query}
				scopeFilter={page.scopeFilter}
				setPendingInactiveSetup={page.setPendingInactiveSetup}
				table={page.table}
			/>
			<TransactionNumberSetupBlueprintPanel />
			<AppDialog
				isOpen={Boolean(page.pendingInactiveSetup)}
				isPending={page.isMutating}
				title="Set setup as inactive?"
				description={`This will stop ${page.pendingInactiveSetup?.moduleName ?? "the selected setup"} from generating new numbers.`}
				confirmLabel="Set Inactive"
				tone="danger"
				onCancel={() => page.setPendingInactiveSetup(null)}
				onConfirm={page.handleConfirmInactive}
			/>
		</section>
	);
}

function SummaryTile({
	icon: Icon,
	label,
	value,
}: {
	icon: typeof Hash;
	label: string;
	value: string;
}) {
	return (
		<div className="rounded-lg border border-darknavy/10 bg-white p-4 shadow-sm">
			<div className="flex items-center gap-3">
				<span className="flex h-10 w-10 items-center justify-center rounded-md bg-skyblue/15 text-darknavy">
					<Icon className="h-5 w-5" aria-hidden="true" />
				</span>
				<div>
					<div className="text-xl font-semibold text-darknavy">{value}</div>
					<div className="text-xs font-semibold uppercase tracking-wide text-darknavy/45">
						{label}
					</div>
				</div>
			</div>
		</div>
	);
}

function RecentGeneratedTile({
	recentUsageLogs,
}: {
	recentUsageLogs: Array<{
		id: string;
		transactionNumber: string;
	}>;
}) {
	const latest = recentUsageLogs[0]?.transactionNumber ?? "No generated numbers";

	return (
		<div className="rounded-lg border border-darknavy/10 bg-white p-4 shadow-sm">
			<div className="flex items-center gap-3">
				<span className="flex h-10 w-10 items-center justify-center rounded-md bg-citron/35 text-darknavy">
					<ReceiptText className="h-5 w-5" aria-hidden="true" />
				</span>
				<div className="min-w-0">
					<div className="truncate font-mono text-sm font-semibold text-darknavy">
						{latest}
					</div>
					<div className="text-xs font-semibold uppercase tracking-wide text-darknavy/45">
						Latest Generated
					</div>
				</div>
			</div>
		</div>
	);
}
