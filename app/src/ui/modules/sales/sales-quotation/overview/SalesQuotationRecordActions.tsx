import { FileText } from "lucide-react";
import { SalesQuotationHref } from "@/app/src/constants/modules/sales/sales-quotation/SalesQuotationConstants";
import type { SalesQuotationRecord } from "@/app/src/types/modules/sales/sales-quotation/SalesQuotationTypes";
import {
	ModuleTableActionButton,
	ModuleTableActionLink,
	ModuleTableActions,
} from "@/app/src/ui/shared/module/module-table/ModuleTableActions";

type SalesQuotationRecordActionsProps = {
	request: SalesQuotationRecord;
	onDeleteRequest: (request: SalesQuotationRecord) => void;
};

export function SalesQuotationRecordActions({
	onDeleteRequest,
	request,
}: SalesQuotationRecordActionsProps) {
	return (
		<ModuleTableActions>
			<ModuleTableActionLink
				variant="view"
				href={`${SalesQuotationHref}/view/${request.id}`}
				label={`View sales quotation ${request.transNo}`}
			/>
			<ModuleTableActionLink
				variant="edit"
				href={`${SalesQuotationHref}/edit/${request.id}`}
				label={`Edit sales quotation ${request.transNo}`}
			/>
			<ModuleTableActionLink
				icon={FileText}
				href={`${SalesQuotationHref}/view/${request.id}?preview=1`}
				label={`Preview sales quotation ${request.transNo}`}
			/>
			<ModuleTableActionButton
				variant="delete"
				onClick={() => onDeleteRequest(request)}
				label={`Delete sales quotation ${request.transNo}`}
			/>
		</ModuleTableActions>
	);
}
