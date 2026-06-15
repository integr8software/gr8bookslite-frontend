import { Edit3, Eye, Plus, Trash2 } from "lucide-react";
import { DisbursementVoucherHref } from "@/app/src/constants/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherConstants";
import type { DisbursementVoucherPreviewRow } from "@/app/src/types/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherTypes";
import {
	ModuleTableActions,
} from "@/app/src/ui/shared/module/module-table/ModuleTableActions";
import {
	ModuleActionMenu,
	type ModuleActionMenuItem,
} from "@/app/src/ui/shared/module/ModuleActionMenu";

export function DisbursementVoucherRecordActions({
	onCreateVoucher,
	row,
	onDeleteVoucher,
}: {
	onCreateVoucher: (row: DisbursementVoucherPreviewRow) => void;
	row: DisbursementVoucherPreviewRow;
	onDeleteVoucher: (row: DisbursementVoucherPreviewRow) => void;
}) {
	const transactionId = row.transaction.id;
	const items: ModuleActionMenuItem[] = [
		{
			href: `${DisbursementVoucherHref}/view/${transactionId}`,
			icon: Eye,
			label: "View",
			type: "link",
		},
	];

	if (row.voucher) {
		items.push(
			{
				href: `${DisbursementVoucherHref}/edit/${transactionId}`,
				icon: Edit3,
				label: "Edit",
				type: "link",
			},
			{
				icon: Trash2,
				label: "Delete",
				onSelect: () => onDeleteVoucher(row),
				tone: "danger",
				type: "button",
			},
		);
	} else {
		items.push({
			icon: Plus,
			label: "Start New Disbursement Voucher",
			onSelect: () => onCreateVoucher(row),
			type: "button",
		});
	}

	return (
		<ModuleTableActions>
			<ModuleActionMenu
				items={items}
				label={`Actions for disbursement voucher ${row.voucher?.voucherNo ?? row.transaction.transactionNo}`}
			/>
		</ModuleTableActions>
	);
}
