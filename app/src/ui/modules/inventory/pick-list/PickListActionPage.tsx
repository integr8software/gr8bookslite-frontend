"use client";

import { useParams, usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { PickListHref } from "@/app/src/constants/modules/inventory/pick-list/PickListConstants";
import { usePickListActionForm } from "@/app/src/hooks/modules/inventory/pick-list/usePickList";
import type { PickListActionMode } from "@/app/src/types/modules/inventory/pick-list/PickListTypes";
import {
	PickListDetailsForm,
	type PickListDetailsSection,
} from "@/app/src/ui/modules/inventory/pick-list/PickListDetailsForm";
import { PickListEntries } from "@/app/src/ui/modules/inventory/pick-list/PickListEntries";
import { PickListFormHeader } from "@/app/src/ui/modules/inventory/pick-list/PickListFormHeader";
import { PickListNotFound } from "@/app/src/ui/modules/inventory/pick-list/PickListNotFound";
import {
	ModuleTabs,
	type ModuleTabItem,
} from "@/app/src/ui/shared/module/module-tabs/ModuleTabs";

export function PickListActionPage() {
	const params = useParams<{ recordId?: string }>();
	const pathname = usePathname();
	const router = useRouter();
	const mode = getModeFromPathname(pathname);
	const isReadonly = mode === "view";
	const recordId =
		typeof params.recordId === "string" ? params.recordId : undefined;
	const [activeTab, setActiveTab] =
		useState<PickListDetailsSection>("delivery");
	const pickListForm = usePickListActionForm(mode, recordId, () => {
		router.push(PickListHref);
	});

	if (pickListForm.isRecordMissing) {
		return <PickListNotFound />;
	}

	return (
		<section className="grid gap-5">
			<PickListFormHeader
				mode={mode}
				values={pickListForm.values}
				onSubmit={pickListForm.submitPickList}
			/>
			<ModuleTabs
				activeTab={activeTab}
				ariaLabel="Pick list sections"
				tabs={PickListTabs}
				onTabChange={setActiveTab}
			/>
			<PickListDetailsForm
				isReadonly={isReadonly}
				section={activeTab}
				values={pickListForm.values}
				onUpdateField={pickListForm.updateField}
			/>
			<PickListEntries
				isReadonly={isReadonly}
				rows={pickListForm.values.lineEntries}
				onRowsChange={pickListForm.updateLineEntries}
			/>
		</section>
	);
}

const PickListTabs = [
	{ id: "delivery", label: "Delivery / Driver" },
	{ id: "references", label: "References / Status" },
] satisfies ModuleTabItem<PickListDetailsSection>[];

function getModeFromPathname(pathname: string): PickListActionMode {
	if (pathname.includes("/view/")) {
		return "view";
	}

	if (pathname.includes("/edit/")) {
		return "edit";
	}

	return "add";
}
