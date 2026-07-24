"use client";

import { useParams, usePathname, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { GoodsIssueHref } from "@/app/src/constants/modules/inventory/goods-issue/GoodsIssueConstants";
import { GoodsIssueMaterialRequestCopyRecords } from "@/app/src/data/modules/inventory/goods-issue/GoodsIssueData";
import { useGoodsIssueActionForm } from "@/app/src/hooks/modules/inventory/goods-issue/useGoodsIssue";
import type { GoodsIssueActionMode } from "@/app/src/types/modules/inventory/goods-issue/GoodsIssueTypes";
import { GoodsIssueDetailsForm } from "@/app/src/ui/modules/inventory/goods-issue/action/GoodsIssueDetailsForm";
import { GoodsIssueFormHeader } from "@/app/src/ui/modules/inventory/goods-issue/action/GoodsIssueFormHeader";
import { GoodsIssueEntrySection } from "@/app/src/ui/modules/inventory/goods-issue/entries/GoodsIssueEntrySection";
import { GoodsIssueNotFound } from "@/app/src/ui/modules/inventory/goods-issue/overview/GoodsIssueNotFound";
import { openGoodsIssuePdf } from "@/app/src/ui/modules/inventory/goods-issue/reports/GoodsIssuePdf";
import { GoodsIssueReportPreview } from "@/app/src/ui/modules/inventory/goods-issue/reports/GoodsIssueReportPreview";
import type { AppCopyFromRecord } from "@/app/src/ui/shared/transaction-setup/AppCopyFromDropdown";

export function GoodsIssueActionPage() {
	const params = useParams<{ recordId?: string }>();
	const pathname = usePathname();
	const router = useRouter();
	const mode = getModeFromPathname(pathname);
	const isReadonly = mode === "view";
	const recordId =
		typeof params.recordId === "string" ? params.recordId : undefined;
	const [isReportPreviewOpen, setIsReportPreviewOpen] = useState(false);
	const issueForm = useGoodsIssueActionForm(mode, recordId, () => {
		router.push(GoodsIssueHref);
	});
	const materialRequestCopyRecords = useMemo<AppCopyFromRecord[]>(
		() =>
			GoodsIssueMaterialRequestCopyRecords.map((record) => ({
				documentDate: record.documentDate,
				id: record.id,
				partyName: record.partyName,
				remarks: record.remarks,
				source: "Material Request",
				sourceNo: record.sourceNo,
			})),
		[],
	);

	if (issueForm.isRecordMissing) {
		return <GoodsIssueNotFound />;
	}

	return (
		<>
		<section className="grid gap-5">
			<GoodsIssueFormHeader
				copyFromRecords={materialRequestCopyRecords}
				mode={mode}
				onCopyFromMaterialRequest={issueForm.copyFromMaterialRequests}
				onPreview={() => setIsReportPreviewOpen(true)}
				values={issueForm.values}
				onSubmit={issueForm.submitIssue}
			/>
			<GoodsIssueDetailsForm
				isReadonly={isReadonly}
				values={issueForm.values}
				onUpdateField={issueForm.updateField}
			/>
			<GoodsIssueEntrySection
				isReadonly={isReadonly}
				rows={issueForm.values.lineEntries}
				onRowsChange={issueForm.updateLineEntries}
			/>
		</section>
		<GoodsIssueReportPreview
			isOpen={isReportPreviewOpen}
			values={issueForm.values}
			onClose={() => setIsReportPreviewOpen(false)}
			onGeneratePdf={() => openGoodsIssuePdf(issueForm.values)}
		/>
		</>
	);
}

function getModeFromPathname(pathname: string): GoodsIssueActionMode {
	if (pathname.includes("/view/")) return "view";
	if (pathname.includes("/edit/")) return "edit";

	return "add";
}
