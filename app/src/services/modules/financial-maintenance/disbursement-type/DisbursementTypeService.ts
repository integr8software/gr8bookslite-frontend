import type {
  DisbursementTypeListParams,
  DisbursementTypeRecord,
} from "@/app/src/types/modules/financial-maintenance/disbursement-type/DisbursementTypes";

const disbursementTypeCollator = new Intl.Collator(undefined, {
  numeric: true,
  sensitivity: "base",
});

export function applyDisbursementTypeListParams(disbursementTypes: DisbursementTypeRecord[], params: DisbursementTypeListParams = {}) {
  const normalizedSearch = params.search?.trim().toLowerCase() ?? "";
  const sortBy = params.sortBy ?? "name";
  const sortDirection = params.sortDirection ?? "asc";

  return disbursementTypes
    .filter((disbursementType) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        disbursementType.name.toLowerCase().includes(normalizedSearch) ||
        disbursementType.description.toLowerCase().includes(normalizedSearch) ||
        disbursementType.type.toLowerCase().includes(normalizedSearch) ||
        disbursementType.status.toLowerCase().includes(normalizedSearch);
      const matchesType = !params.type || disbursementType.type === params.type;
      const matchesStatus = !params.status || disbursementType.status === params.status;

      return matchesSearch && matchesType && matchesStatus;
    })
    .sort((left, right) => {
      const result = disbursementTypeCollator.compare(left[sortBy], right[sortBy]);

      return sortDirection === "asc" ? result : -result;
    });
}
