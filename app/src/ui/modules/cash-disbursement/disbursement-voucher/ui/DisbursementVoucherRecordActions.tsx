import { Plus } from "lucide-react";
import { DisbursementVoucherHref } from "@/app/src/constants/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherConstants";
import type { DisbursementVoucherPreviewRow } from "@/app/src/types/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherTypes";
import {
	ModuleTableActionButton,
	ModuleTableActionLink,
	ModuleTableActions,
} from "@/app/src/ui/shared/module/module-table/ModuleTableActions";

export function DisbursementVoucherRecordActions({
	onCreateVoucher,
	onEditVoucher,
	row,
	onDeleteVoucher,
}: {
	onCreateVoucher: (row: DisbursementVoucherPreviewRow) => void;
	onEditVoucher: (row: DisbursementVoucherPreviewRow) => void;
	row: DisbursementVoucherPreviewRow;
	onDeleteVoucher: (row: DisbursementVoucherPreviewRow) => void;
}) {
	const transactionId = row.transaction.id;

	return (
		<ModuleTableActions>
			<ModuleTableActionLink
				variant="view"
				href={`${DisbursementVoucherHref}/view/${transactionId}`}
				label={`Preview ${row.transaction.payee}`}
			/>
			{row.voucher ? (
				<>
					<ModuleTableActionButton
						variant="edit"
						label={`Edit voucher for ${row.transaction.payee}`}
						onClick={() => onEditVoucher(row)}
					/>
					<ModuleTableActionButton
						variant="delete"
						onClick={() => onDeleteVoucher(row)}
						label={`Delete voucher for ${row.transaction.payee}`}
					/>
				</>
			) : (
				<ModuleTableActionButton
					icon={Plus}
					label={`Create voucher for ${row.transaction.payee}`}
					onClick={() => onCreateVoucher(row)}
				/>
			)}
		</ModuleTableActions>
	);
}
