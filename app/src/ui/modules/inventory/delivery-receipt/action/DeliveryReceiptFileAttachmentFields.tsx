import type { DeliveryReceiptAttachment } from "@/app/src/types/modules/inventory/delivery-receipt/DeliveryReceiptTypes";
import { ModuleFileAttachmentFields } from "@/app/src/ui/shared/module/ModuleFileAttachmentFields";

type DeliveryReceiptFileAttachmentFieldsProps = {
	attachments: DeliveryReceiptAttachment[];
	isReadonly: boolean;
	onAttachmentsChange: (attachments: DeliveryReceiptAttachment[]) => void;
};

export function DeliveryReceiptFileAttachmentFields({
	attachments,
	isReadonly,
	onAttachmentsChange,
}: DeliveryReceiptFileAttachmentFieldsProps) {
	return (
		<ModuleFileAttachmentFields
			attachments={attachments}
			inputId="delivery-receipt-file-attachments"
			inputName="deliveryReceiptAttachments"
			isReadonly={isReadonly}
			title="Attach delivery receipt files"
			onAttachmentsChange={onAttachmentsChange}
		/>
	);
}
