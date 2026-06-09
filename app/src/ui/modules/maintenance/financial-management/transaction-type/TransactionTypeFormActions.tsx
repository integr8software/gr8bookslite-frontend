import Link from "next/link";
import { ArrowLeft, Edit3, Save, X } from "lucide-react";
import { TransactionTypeHref } from "@/app/src/constants/modules/maintenance/financial-management/transaction-type/TransactionTypeConstants";
import {
	moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";
import type {
	TransactionType,
	TransactionTypeActionMode,
} from "@/app/src/types/modules/maintenance/financial-management/transaction-type/TransactionTypeTypes";

type TransactionTypeFormActionsProps = {
	isReadonly: boolean;
	mode: TransactionTypeActionMode;
	transactionType?: TransactionType;
};

export function TransactionTypeFormActions({
	isReadonly,
	mode,
	transactionType,
}: TransactionTypeFormActionsProps) {
	return (
		<>
			{mode === "view" ? (
				<Link
					href={TransactionTypeHref}
					className={moduleHeaderActionClassNames.secondary}
				>
					<ArrowLeft className="h-4 w-4" aria-hidden="true" />
					Back
				</Link>
			) : null}
			{mode === "view" && transactionType ? (
				<Link
					href={`${TransactionTypeHref}/edit/${transactionType.id}`}
					className={moduleHeaderActionClassNames.secondary}
				>
					<Edit3 className="h-4 w-4" aria-hidden="true" />
					Edit
				</Link>
			) : null}
			{mode === "edit" && transactionType ? (
				<Link
					href={`${TransactionTypeHref}/view/${transactionType.id}`}
					className={moduleHeaderActionClassNames.secondary}
				>
					<X className="h-4 w-4" aria-hidden="true" />
					Cancel
				</Link>
			) : null}
			{!isReadonly ? (
				<button
					type="submit"
					className={moduleHeaderActionClassNames.primary}
				>
					<Save className="h-4 w-4" aria-hidden="true" />
					Save Transaction Type
				</button>
			) : null}
		</>
	);
}
