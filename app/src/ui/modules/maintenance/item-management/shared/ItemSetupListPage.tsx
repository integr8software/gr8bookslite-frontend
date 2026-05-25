"use client";

import Link from "next/link";
import { Plus, Tags } from "lucide-react";
import { ItemSetupConfigByKind } from "@/app/src/constants/modules/maintenance/item-management/ItemManagementConstants";
import { useItemSetupListPage } from "@/app/src/hooks/modules/maintenance/item-management/useItemSetupListPage";
import type { ItemSetupKind } from "@/app/src/types/modules/maintenance/item-management/ItemManagementTypes";
import { AppDialog } from "@/app/src/ui/shared/app/AppDialog";
import {
	ModuleHeader,
	moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";
import { ItemSetupTable } from "@/app/src/ui/modules/maintenance/item-management/shared/ItemSetupTable";

export function ItemSetupListPage({ kind }: { kind: ItemSetupKind }) {
	const config = ItemSetupConfigByKind[kind];
	const page = useItemSetupListPage(kind);
	const childConfig = page.childKind
		? ItemSetupConfigByKind[page.childKind]
		: null;

	return (
		<section className="grid gap-5">
			<ModuleHeader
				variant="panel"
				titleAs="h1"
				title={config.title}
				description={config.description}
				eyebrow={
					<>
						<Tags className="h-3.5 w-3.5" aria-hidden="true" />
						{config.eyebrow}
					</>
				}
				actions={
					<>
						{childConfig ? (
							<Link
								href={`${childConfig.href}/add`}
								className={moduleHeaderActionClassNames.secondary}
							>
								<Plus className="h-4 w-4" aria-hidden="true" />
								Add {childConfig.singularTitle}
							</Link>
						) : null}
						<Link
							href={`${config.href}/add`}
							className={moduleHeaderActionClassNames.primary}
						>
							<Plus className="h-4 w-4" aria-hidden="true" />
							Add {config.singularTitle}
						</Link>
					</>
				}
			/>
			<ItemSetupTable
				expandedIds={page.expandedIds}
				isLoading={page.isLoading}
				kind={kind}
				setPendingDeleteRecord={page.setPendingDeleteRecord}
				table={page.table}
				onToggleExpanded={page.toggleExpanded}
			/>
			<AppDialog
				isOpen={Boolean(page.pendingDeleteRecord)}
				isPending={page.isMutating}
				title={`Delete ${
					page.pendingDeleteRecord
						? ItemSetupConfigByKind[
								page.pendingDeleteRecord.kind
							].singularTitle.toLowerCase()
						: "setup record"
				}?`}
				description={`This will remove ${page.pendingDeleteRecord?.record.name ?? "the selected record"}.`}
				confirmLabel="Delete Record"
				tone="danger"
				onCancel={() => page.setPendingDeleteRecord(null)}
				onConfirm={page.handleConfirmDelete}
			/>
		</section>
	);
}
