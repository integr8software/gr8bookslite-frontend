import Link from "next/link";
import { ArrowLeft, Printer, Save } from "lucide-react";
import { SalesQuotationHref } from "@/app/src/constants/modules/sales/sales-quotation/SalesQuotationConstants";
import type { useSalesQuotationFormPage } from "@/app/src/hooks/modules/sales/sales-quotation/useSalesQuotationFormPage";
import { moduleHeaderActionClassNames } from "@/app/src/ui/shared/module/ModuleHeader";

type SalesQuotationFormHeaderActionsProps = {
	page: ReturnType<typeof useSalesQuotationFormPage>;
};

export function SalesQuotationFormHeaderActions({
	page,
}: SalesQuotationFormHeaderActionsProps) {
	return (
		<>
			<Link
				href={SalesQuotationHref}
				className={moduleHeaderActionClassNames.secondary}
			>
				<ArrowLeft className="h-4 w-4" aria-hidden="true" />
				List
			</Link>
			<button
				type="button"
				onClick={() => page.setShowPreview((current) => !current)}
				className={moduleHeaderActionClassNames.secondary}
			>
				<Printer className="h-4 w-4" aria-hidden="true" />
				{page.showPreview ? "Hide Preview" : "Preview"}
			</button>
			{page.mode === "view" ? (
				<Link
					href={`${SalesQuotationHref}/edit/${page.existingRequest?.id ?? ""}`}
					className={moduleHeaderActionClassNames.primary}
				>
					<Save className="h-4 w-4" aria-hidden="true" />
					Edit
				</Link>
			) : (
				<button
					type="button"
					disabled={page.isSubmitting}
					onClick={page.handleSubmit}
					className={`${moduleHeaderActionClassNames.primary} disabled:cursor-not-allowed disabled:opacity-60`}
				>
					<Save className="h-4 w-4" aria-hidden="true" />
					{page.isSubmitting ? "Saving..." : "Save"}
				</button>
			)}
		</>
	);
}
