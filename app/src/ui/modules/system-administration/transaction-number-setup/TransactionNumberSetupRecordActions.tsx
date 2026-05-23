import Link from "next/link";
import { CircleOff, Edit3, Eye, Play } from "lucide-react";
import { TransactionNumberSetupHref } from "@/app/src/constants/modules/system-administration/transaction-number-setup/TransactionNumberSetupConstants";
import type { TransactionNumberSetupRecord } from "@/app/src/types/modules/system-administration/transaction-number-setup/TransactionNumberSetupTypes";

type TransactionNumberSetupRecordActionsProps = {
	setup: TransactionNumberSetupRecord;
	onGenerateNumber: (setupId: string) => void;
	onSetInactive: (setup: TransactionNumberSetupRecord) => void;
};

export function TransactionNumberSetupRecordActions({
	onGenerateNumber,
	onSetInactive,
	setup,
}: TransactionNumberSetupRecordActionsProps) {
	const isInactive = setup.status === "Inactive";

	return (
		<div className="flex items-center gap-1">
			<Link
				href={`${TransactionNumberSetupHref}/view/${setup.id}`}
				aria-label={`View ${setup.moduleName}`}
				className={tableActionClassName}
			>
				<Eye className="h-4 w-4" aria-hidden="true" />
			</Link>
			<Link
				href={`${TransactionNumberSetupHref}/edit/${setup.id}`}
				aria-label={`Edit ${setup.moduleName}`}
				className={tableActionClassName}
			>
				<Edit3 className="h-4 w-4" aria-hidden="true" />
			</Link>
			<button
				type="button"
				disabled={isInactive}
				onClick={() => onGenerateNumber(setup.id)}
				aria-label={`Generate next ${setup.moduleName} number`}
				className={tableActionClassName}
			>
				<Play className="h-4 w-4" aria-hidden="true" />
			</button>
			<button
				type="button"
				disabled={isInactive}
				onClick={() => onSetInactive(setup)}
				aria-label={`Set ${setup.moduleName} setup as inactive`}
				className="inline-flex h-9 w-9 items-center justify-center rounded-md text-coralpink transition hover:bg-coralpink/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coralpink/30 disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-transparent"
			>
				<CircleOff className="h-4 w-4" aria-hidden="true" />
			</button>
		</div>
	);
}

const tableActionClassName =
	"inline-flex h-9 w-9 items-center justify-center rounded-md text-darknavy transition hover:bg-skyblue/10 hover:text-skyblue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/35 disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-transparent";
