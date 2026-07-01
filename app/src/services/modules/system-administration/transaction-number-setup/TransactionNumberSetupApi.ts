import {
	transactionNumberSequencesControllerFindBootstrapV1,
	transactionNumberSequencesControllerUpdateV1,
} from "@/app/src/generated/api/transaction-number-sequences/transaction-number-sequences";
import type {
	TransactionNumberSequenceResponseDto,
	UpdateTransactionNumberSequenceDto,
} from "@/app/src/generated/api/gR8BooksNeoAPI.schemas";
import type { TransactionNumberSetupRecord } from "@/app/src/types/modules/system-administration/transaction-number-setup/TransactionNumberSetupTypes";

export async function GetTransactionNumberSetupBootstrap() {
	const response =
		await transactionNumberSequencesControllerFindBootstrapV1();

	return {
		branches: response.branches.map((branch) => ({
			code: branch.code ?? "",
			id: String(branch.id),
			name: branch.name,
		})),
		setups: response.sequences.map(MapTransactionNumberSequence),
	};
}

export async function UpdateTransactionNumberSetup(
	setup: TransactionNumberSetupRecord,
) {
	const values = CreateTransactionNumberSetupPayload(setup);
	const response = await transactionNumberSequencesControllerUpdateV1(
		setup.moduleId,
		values,
	);

	return MapTransactionNumberSequence(response.sequence);
}

function CreateTransactionNumberSetupPayload(
	setup: TransactionNumberSetupRecord,
): UpdateTransactionNumberSequenceDto {
	const branchUnitIds = setup.branchIds
		.map((branchId) => Number(branchId))
		.filter(Number.isFinite);
	const branchUnitId = branchUnitIds[0];

	return {
		branchUnitId: Number.isFinite(branchUnitId) ? branchUnitId : undefined,
		branchUnitIds,
		currentNumber: setup.currentNumber,
		inputMode: setup.inputMode,
		moduleCode: setup.moduleCode,
		moduleName: setup.moduleName,
		padding: setup.padding,
		prefix: setup.prefix,
		suffix: setup.suffix,
		scope: setup.scope === "branch" ? "branch" : "all",
		startingNumber: setup.startingNumber,
		status: setup.status,
	};
}

function MapTransactionNumberSequence(
	sequence: TransactionNumberSequenceResponseDto,
): TransactionNumberSetupRecord {
	return {
		branchIds:
			sequence.scope === "all"
				? []
				: sequence.branchUnitIds.map((branchUnitId) =>
						String(branchUnitId),
					),
		currentNumber: sequence.currentNumber,
		id: String(sequence.moduleId),
		inputMode: sequence.inputMode,
		moduleCode: sequence.moduleCode,
		moduleName: sequence.moduleName,
		padding: sequence.padding,
		moduleId: sequence.moduleId,
		prefix: sequence.prefix,
		suffix: sequence.suffix ?? "",
		scope: sequence.scope,
		startingNumber: sequence.startingNumber,
		status: sequence.status,
	};
}
