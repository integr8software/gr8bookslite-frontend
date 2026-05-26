import type {
	GeneratedTransactionNumber,
	TransactionNumberSetupRecord,
	TransactionNumberUsageLog,
} from "@/app/src/types/modules/system-administration/transaction-number-setup/TransactionNumberSetupTypes";

type GenerateNextTransactionNumberInput = {
	branchId?: string;
	issuedNumbers: TransactionNumberUsageLog[];
	setup: TransactionNumberSetupRecord;
};

export function formatTransactionNumber(
	setup: Pick<TransactionNumberSetupRecord, "currentNumber" | "padding" | "prefix">,
	runningNumber = setup.currentNumber,
) {
	return `${setup.prefix}${String(runningNumber).padStart(setup.padding, "0")}`;
}

export function generateNextTransactionNumber({
	branchId,
	issuedNumbers,
	setup,
}: GenerateNextTransactionNumberInput): GeneratedTransactionNumber {
	const issuedNumberSet = new Set(
		issuedNumbers.map((entry) => entry.transactionNumber),
	);
	let runningNumber = setup.currentNumber;
	let transactionNumber = formatTransactionNumber(setup, runningNumber);

	while (issuedNumberSet.has(transactionNumber)) {
		runningNumber += 1;
		transactionNumber = formatTransactionNumber(setup, runningNumber);
	}

	const createdAt = new Date().toISOString();
	const usageLog: TransactionNumberUsageLog = {
		id: `txn-log-${Date.now()}`,
		setupId: setup.id,
		moduleCode: setup.moduleCode,
		transactionNumber,
		runningNumber,
		branchId: branchId ?? setup.branchIds[0] ?? "global",
		status: "Reserved",
		createdAt,
	};

	return {
		record: {
			...setup,
			currentNumber: runningNumber + 1,
			lastGeneratedAt: createdAt,
			lastGeneratedNumber: transactionNumber,
		},
		runningNumber,
		transactionNumber,
		usageLog,
	};
}

export const TransactionNumberGenerationPseudoCode = `BEGIN;
SELECT *
FROM transaction_number_setups
WHERE id = :setupId
FOR UPDATE;

next_number := current_number;
candidate := prefix || LPAD(next_number, padding, '0');

WHILE EXISTS (
  SELECT 1
  FROM transaction_number_ledger
  WHERE transaction_number = candidate
) LOOP
  next_number := next_number + 1;
  candidate := prefix || LPAD(next_number, padding, '0');
END LOOP;

INSERT INTO transaction_number_ledger (
  setup_id,
  transaction_number,
  running_number,
  branch_id,
  status,
  created_at
) VALUES (
  :setupId,
  candidate,
  next_number,
  :branchId,
  'Reserved',
  NOW()
);

UPDATE transaction_number_setups
SET current_number = next_number + 1
WHERE id = :setupId;
COMMIT;`;
