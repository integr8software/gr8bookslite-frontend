import type { BillingStatementAttachment } from "@/app/src/types/modules/sales/billing-statement/BillingStatementTypes";
import { ModuleFileAttachmentFields } from "@/app/src/ui/shared/module/ModuleFileAttachmentFields";

type BillingStatementFileAttachmentFieldsProps = {
	attachments: BillingStatementAttachment[];
	isReadonly: boolean;
	onAttachmentsChange: (attachments: BillingStatementAttachment[]) => void;
};

export function BillingStatementFileAttachmentFields({
	attachments,
	isReadonly,
	onAttachmentsChange,
}: BillingStatementFileAttachmentFieldsProps) {
	return (
		<ModuleFileAttachmentFields
			attachments={attachments}
			inputId="billing-statement-file-attachments"
			inputName="billingStatementAttachments"
			isReadonly={isReadonly}
			title="Attach billing statement files"
			onAttachmentsChange={onAttachmentsChange}
		/>
	);
}
