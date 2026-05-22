import Link from "next/link";
import { ArrowLeft, Edit3, Save, Trash2, X } from "lucide-react";
import { DiscountManagementHref } from "@/app/src/constants/modules/maintenance/financial-management/discount-management/DiscountManagementConstants";
import type {
	Discount,
	DiscountManagementActionMode,
} from "@/app/src/types/modules/maintenance/financial-management/discount-management/DiscountManagementTypes";
import { moduleHeaderActionClassNames } from "@/app/src/ui/shared/module/ModuleHeader";

type DiscountManagementActionButtonsProps = {
	discount?: Discount;
	isReadonly: boolean;
	mode: DiscountManagementActionMode;
	onDeleteDiscount: () => void;
};

export function DiscountManagementActionButtons({
	discount,
	isReadonly,
	mode,
	onDeleteDiscount,
}: DiscountManagementActionButtonsProps) {
	return (
		<>
			{mode === "view" ? (
				<Link
					href={DiscountManagementHref}
					className={moduleHeaderActionClassNames.secondary}
				>
					<ArrowLeft className="h-4 w-4" aria-hidden="true" />
					Back
				</Link>
			) : null}
			{mode === "view" && discount ? (
				<Link
					href={`${DiscountManagementHref}/edit/${discount.id}`}
					className={moduleHeaderActionClassNames.secondary}
				>
					<Edit3 className="h-4 w-4" aria-hidden="true" />
					Edit
				</Link>
			) : null}
			{discount ? (
				<button
					type="button"
					onClick={onDeleteDiscount}
					className={moduleHeaderActionClassNames.danger}
				>
					<Trash2 className="h-4 w-4" aria-hidden="true" />
					Delete
				</button>
			) : null}
			{mode === "edit" && discount ? (
				<Link
					href={`${DiscountManagementHref}/view/${discount.id}`}
					className={moduleHeaderActionClassNames.secondary}
				>
					<X className="h-4 w-4" aria-hidden="true" />
					Cancel
				</Link>
			) : null}
			{!isReadonly ? (
				<button type="submit" className={moduleHeaderActionClassNames.primary}>
					<Save className="h-4 w-4" aria-hidden="true" />
					Save Discount
				</button>
			) : null}
		</>
	);
}
