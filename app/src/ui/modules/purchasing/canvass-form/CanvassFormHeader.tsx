import Link from "next/link";
import { ArrowLeft, FileText, Save } from "lucide-react";
import {
	CanvassFormHref,
	CanvassFormPageCopy,
} from "@/app/src/constants/modules/purchasing/canvass-form/CanvassFormConstants";
import type {
	CanvassFormMode,
	CanvassFormValues,
} from "@/app/src/types/modules/purchasing/canvass-form/CanvassFormTypes";
import {
	ModuleHeader,
	moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";
import { ReportPreviewAction } from "@/app/src/ui/shared/reports/Reports";

type CanvassFormHeaderProps = {
	isSubmitting?: boolean;
	mode: CanvassFormMode;
	recordId?: string;
	values: CanvassFormValues;
	onPreview: () => void;
	onSubmit: () => void;
};

export function CanvassFormHeader({
	isSubmitting = false,
	mode,
	onPreview,
	onSubmit,
	recordId,
	values,
}: CanvassFormHeaderProps) {
	return (
		<ModuleHeader
			variant="panel"
			titleAs="h1"
			title={getTitle(mode, values.transNo)}
			description={CanvassFormPageCopy[mode].description}
			eyebrow={
				<>
					<FileText className="h-3.5 w-3.5" aria-hidden="true" />
					Purchasing document
				</>
			}
			actions={
				<>
					<Link href={CanvassFormHref} className={moduleHeaderActionClassNames.secondary}>
						<ArrowLeft className="h-4 w-4" aria-hidden="true" />
						Back
					</Link>
					<ReportPreviewAction onPreview={onPreview} />
					{mode === "view" ? (
						<Link
							href={`${CanvassFormHref}/edit/${recordId ?? ""}`}
							className={moduleHeaderActionClassNames.primary}
						>
							<Save className="h-4 w-4" aria-hidden="true" />
							Edit
						</Link>
					) : (
						<button
							type="button"
							disabled={isSubmitting}
							onClick={onSubmit}
							className={`${moduleHeaderActionClassNames.primary} disabled:cursor-not-allowed disabled:opacity-60`}
						>
							<Save className="h-4 w-4" aria-hidden="true" />
							{isSubmitting ? "Saving..." : "Save"}
						</button>
					)}
				</>
			}
		/>
	);
}

function getTitle(mode: CanvassFormMode, transNo: string) {
	if (mode === "add") return CanvassFormPageCopy.add.title;
	if (mode === "edit") return `${CanvassFormPageCopy.edit.title} ${transNo}`;
	return `${CanvassFormPageCopy.view.title} ${transNo}`;
}
