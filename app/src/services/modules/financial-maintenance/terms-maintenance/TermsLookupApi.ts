import { ApiClient } from "@/app/src/services/shared/api/ApiClient";
import type {
  TermLookupOption,
  TermLookupQuery,
} from "@/app/src/types/modules/financial-maintenance/terms-maintenance/TermsLookupTypes";

type TermBackendResponse = {
  id: string;
  name: string;
  dateMode?: string;
  period?: number;
  status?: string;
  [key: string]: unknown;
};

export async function fetchTermLookupOptions(query: TermLookupQuery = {}): Promise<TermLookupOption[]> {
  const response = await ApiClient.get<{ terms: TermBackendResponse[] }>("/maintenance/terms-maintenance/options", {
    params: query,
  });

  return (response.data.terms ?? []).map(mapTermToLookupOption);
}

function mapTermToLookupOption(term: TermBackendResponse): TermLookupOption {
  return {
    ...term,
    name: term.name,
    label: term.name,
    value: term.id,
    description: term.period !== undefined ? `${term.period} ${term.dateMode ?? ""}`.trim() : term.name,
    termId: term.id,
  };
}
