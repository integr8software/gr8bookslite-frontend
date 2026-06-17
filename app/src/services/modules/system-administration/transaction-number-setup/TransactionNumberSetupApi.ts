import { ApiClient } from "@/app/src/services/shared/api/ApiClient";
import type {
	TransactionNumberInputMode,
	TransactionNumberScope,
	TransactionNumberSetupRecord,
	TransactionNumberStatus,
} from "@/app/src/types/modules/system-administration/transaction-number-setup/TransactionNumberSetupTypes";

type TransactionNumberBranchResponse = {
	code: string | null;
	id: number;
	name: string;
};

type TransactionNumberSequenceResponse = {
	branchUnitId: number | null;
	branchUnitIds: number[];
	currentNumber: number;
	id: number;
	inputMode: TransactionNumberInputMode;
	moduleCode: string;
	moduleName: string;
	padding: number;
	permissionId: number;
	prefix: string;
	suffix: string;
	scope: Extract<TransactionNumberScope, "all" | "branch">;
	startingNumber: number;
	status: TransactionNumberStatus;
};

type UpdateTransactionNumberSequencePayload = {
	branchUnitId?: number;
	branchUnitIds: number[];
	currentNumber: number;
	inputMode: TransactionNumberInputMode;
	moduleCode: string;
	moduleName: string;
	padding: number;
	prefix: string;
	suffix: string;
	scope: Extract<TransactionNumberScope, "all" | "branch">;
	startingNumber: number;
	status: TransactionNumberStatus;
};

type TransactionNumberBootstrapResponse = {
	branches: TransactionNumberBranchResponse[];
	sequences: TransactionNumberSequenceResponse[];
};

type SaveTransactionNumberSequenceResponse = {
	message: string;
	sequence: TransactionNumberSequenceResponse;
};

const TransactionNumberSequencesUrl =
	"/system-administration/transaction-number-sequences";

export async function GetTransactionNumberSetupBootstrap() {
	const response = await ApiClient.get<TransactionNumberBootstrapResponse>(
		`${TransactionNumberSequencesUrl}/bootstrap`,
	);

	return {
		branches: response.data.branches.map((branch) => ({
			code: branch.code ?? "",
			id: String(branch.id),
			name: branch.name,
		})),
		setups: response.data.sequences.map(MapTransactionNumberSequence),
	};
}

export async function UpdateTransactionNumberSetup(
	setup: TransactionNumberSetupRecord,
) {
	const values = CreateTransactionNumberSetupPayload(setup);
	const response = await ApiClient.patch<SaveTransactionNumberSequenceResponse>(
		`${TransactionNumberSequencesUrl}/${setup.permissionId}`,
		values,
	);

	return MapTransactionNumberSequence(response.data.sequence);
}

function CreateTransactionNumberSetupPayload(
	setup: TransactionNumberSetupRecord,
): UpdateTransactionNumberSequencePayload {
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
	sequence: TransactionNumberSequenceResponse,
): TransactionNumberSetupRecord {
	return {
		branchIds:
			sequence.scope === "all"
				? []
				: sequence.branchUnitIds.map((branchUnitId) =>
						String(branchUnitId),
					),
		currentNumber: sequence.currentNumber,
		id: String(sequence.permissionId),
		inputMode: sequence.inputMode,
		moduleCode: sequence.moduleCode,
		moduleName: sequence.moduleName,
		padding: sequence.padding,
		permissionId: sequence.permissionId,
		prefix: sequence.prefix,
		suffix: sequence.suffix ?? "",
		scope: sequence.scope,
		startingNumber: sequence.startingNumber,
		status: sequence.status,
	};
}
