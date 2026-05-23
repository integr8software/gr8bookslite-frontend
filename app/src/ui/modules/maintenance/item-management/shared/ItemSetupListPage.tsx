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
import { ItemSetupTable } from "./ItemSetupTable";

export function ItemSetupListPage({ kind }: { kind: ItemSetupKind }) {
	const config = ItemSetupConfigByKind[kind];
	const page = useItemSetupListPage(kind);

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
					<Link
						href={`${config.href}/add`}
						className={moduleHeaderActionClassNames.primary}
					>
						<Plus className="h-4 w-4" aria-hidden="true" />
						Add {config.singularTitle}
					</Link>
				}
			/>
			<ItemSetupTable
				isLoading={page.isLoading}
				kind={kind}
				setPendingDeleteRecord={page.setPendingDeleteRecord}
				table={page.table}
			/>
			<AppDialog
				isOpen={Boolean(page.pendingDeleteRecord)}
				isPending={page.isMutating}
				title={`Delete ${config.singularTitle.toLowerCase()}?`}
				description={`This will remove ${page.pendingDeleteRecord?.name ?? "the selected record"}.`}
				confirmLabel="Delete Record"
				tone="danger"
				onCancel={() => page.setPendingDeleteRecord(null)}
				onConfirm={page.handleConfirmDelete}
			/>
		</section>
	);
}

