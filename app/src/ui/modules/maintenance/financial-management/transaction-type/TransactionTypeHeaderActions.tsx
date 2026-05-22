import Link from "next/link";
import { Download, Plus, Upload } from "lucide-react";
import { TransactionTypeHref } from "@/app/src/constants/modules/maintenance/financial-management/transaction-type/TransactionTypeConstants";
import { moduleHeaderActionClassNames } from "@/app/src/ui/shared/module/ModuleHeader";

export function TransactionTypeHeaderActions() {
	return (
		<>
			<button
				type="button"
				className={moduleHeaderActionClassNames.secondary}
			>
				<Upload className="h-4 w-4" aria-hidden="true" />
				Import
			</button>
			<button
				type="button"
				className={moduleHeaderActionClassNames.secondary}
			>
				<Download className="h-4 w-4" aria-hidden="true" />
				Export
			</button>
			<Link
				href={`${TransactionTypeHref}/add`}
				className={moduleHeaderActionClassNames.primary}
			>
				<Plus className="h-4 w-4" aria-hidden="true" />
				Add Transaction Type
			</Link>
		</>
	);
}
