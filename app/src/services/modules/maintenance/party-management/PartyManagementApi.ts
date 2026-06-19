import {
	getPartyDisplayName,
} from "@/app/src/data/modules/maintenance/party-management/PartyManagementData";
import type {
	PartyInformationRecord,
	PartyManagementListQuery,
	PartyManagementListResponse,
} from "@/app/src/types/modules/maintenance/party-management/PartyManagementTypes";

export async function GetPartyManagementRecordsPage({
	query,
	records,
}: {
	query: PartyManagementListQuery;
	records: PartyInformationRecord[];
}): Promise<PartyManagementListResponse> {
	const normalizedQuery = query.query.trim().toLowerCase();
	const filteredRecords = records.filter((record) => {
		const name = getPartyDisplayName(record).toLowerCase();
		const address = formatPartyAddress(record.address).toLowerCase();

		return (
			(query.classification === "All" ||
				record.classification === query.classification) &&
			(query.partyType === "All" || record.partyTypes.includes(query.partyType)) &&
			(query.status === "All" || record.status === query.status) &&
			(!normalizedQuery ||
				name.includes(normalizedQuery) ||
				address.includes(normalizedQuery))
		);
	});
	const sortedRecords = sortPartyManagementRecords(filteredRecords, query);
	const startIndex = query.pageIndex * query.pageSize;

	return {
		records: sortedRecords.slice(startIndex, startIndex + query.pageSize),
		totalRows: sortedRecords.length,
	};
}

function sortPartyManagementRecords(
	records: PartyInformationRecord[],
	query: PartyManagementListQuery,
) {
	const sort = query.sort;

	if (!sort || sort.id === "actions") {
		return records;
	}

	return [...records].sort((leftRecord, rightRecord) => {
		const leftValue = getSortablePartyManagementValue(leftRecord, sort.id);
		const rightValue = getSortablePartyManagementValue(rightRecord, sort.id);
		const comparison = leftValue.localeCompare(rightValue, undefined, {
			numeric: true,
			sensitivity: "base",
		});

		return sort.desc ? -comparison : comparison;
	});
}

function getSortablePartyManagementValue(
	record: PartyInformationRecord,
	sortId: NonNullable<PartyManagementListQuery["sort"]>["id"],
) {
	switch (sortId) {
		case "addressLabel":
			return formatPartyAddress(record.address);
		case "classification":
			return record.classification;
		case "name":
			return getPartyDisplayName(record);
		case "partyTypesLabel":
			return record.partyTypes.join(", ");
		case "status":
			return record.status;
		default:
			return "";
	}
}

function formatPartyAddress(address: PartyInformationRecord["address"]) {
	return [
		address.addressLine1,
		address.addressLine2,
		address.barangay,
		address.cityMunicipality,
		address.province,
		address.region,
	]
		.map((part) => part.trim())
		.filter(Boolean)
		.join(", ") || "-";
}
