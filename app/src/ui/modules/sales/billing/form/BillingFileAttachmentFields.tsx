import type { BillingAttachment } from "@/app/src/types/modules/sales/billing/BillingTypes";
import { ModuleFileAttachmentFields } from "@/app/src/ui/shared/module/ModuleFileAttachmentFields";

type BillingFileAttachmentFieldsProps = {
	attachments: BillingAttachment[];
	isReadonly: boolean;
	onAttachmentsChange: (attachments: BillingAttachment[]) => void;
};

export function BillingFileAttachmentFields({
	attachments,
	isReadonly,
	onAttachmentsChange,
}: BillingFileAttachmentFieldsProps) {
	return (
		<ModuleFileAttachmentFields
			attachments={attachments}
			inputId="billing-file-attachments"
			inputName="billingAttachments"
			isReadonly={isReadonly}
			title="Attach billing files"
			onAttachmentsChange={onAttachmentsChange}
		/>
	);
}
