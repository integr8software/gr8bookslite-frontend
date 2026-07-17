"use client";

import { useParams, usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { GoodsIssueHref } from "@/app/src/constants/modules/inventory/goods-issue/GoodsIssueConstants";
import { useGoodsIssueActionForm } from "@/app/src/hooks/modules/inventory/goods-issue/useGoodsIssue";
import type { GoodsIssueActionMode } from "@/app/src/types/modules/inventory/goods-issue/GoodsIssueTypes";
import {
	GoodsIssueDetailsForm,
	type GoodsIssueDetailsSection,
} from "@/app/src/ui/modules/inventory/goods-issue/GoodsIssueDetailsForm";
import { GoodsIssueEntries } from "@/app/src/ui/modules/inventory/goods-issue/GoodsIssueEntries";
import { GoodsIssueFormHeader } from "@/app/src/ui/modules/inventory/goods-issue/GoodsIssueFormHeader";
import { GoodsIssueNotFound } from "@/app/src/ui/modules/inventory/goods-issue/GoodsIssueNotFound";
import {
	ModuleTabs,
	type ModuleTabItem,
} from "@/app/src/ui/shared/module/module-tabs/ModuleTabs";

export function GoodsIssueActionPage() {
	const params = useParams<{ recordId?: string }>();
	const pathname = usePathname();
	const router = useRouter();
	const mode = getModeFromPathname(pathname);
	const isReadonly = mode === "view";
	const recordId =
		typeof params.recordId === "string" ? params.recordId : undefined;
	const [activeTab, setActiveTab] =
		useState<GoodsIssueDetailsSection>("issue");
	const issueForm = useGoodsIssueActionForm(mode, recordId, () => {
		router.push(GoodsIssueHref);
	});

	if (issueForm.isRecordMissing) {
		return <GoodsIssueNotFound />;
	}

	return (
		<section className="grid gap-5">
			<GoodsIssueFormHeader
				mode={mode}
				values={issueForm.values}
				onSubmit={issueForm.submitIssue}
			/>
			<ModuleTabs
				activeTab={activeTab}
				ariaLabel="Goods issue sections"
				tabs={GoodsIssueTabs}
				onTabChange={setActiveTab}
			/>
			<GoodsIssueDetailsForm
				isReadonly={isReadonly}
				section={activeTab}
				values={issueForm.values}
				onUpdateField={issueForm.updateField}
			/>
			<GoodsIssueEntries
				isReadonly={isReadonly}
				rows={issueForm.values.lineEntries}
				onRowsChange={issueForm.updateLineEntries}
			/>
		</section>
	);
}

const GoodsIssueTabs = [
	{ id: "issue", label: "Issue / Warehouse" },
	{ id: "references", label: "References / Project" },
] satisfies ModuleTabItem<GoodsIssueDetailsSection>[];

function getModeFromPathname(pathname: string): GoodsIssueActionMode {
	if (pathname.includes("/view/")) return "view";
	if (pathname.includes("/edit/")) return "edit";

	return "add";
}
