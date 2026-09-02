import type { TransactionNumberSuggestionResponseDto } from "@/app/src/generated/api/gR8BooksNeoAPI.schemas";

type TransactionNumberFetcher<TParams> = (params?: TParams) => Promise<TransactionNumberSuggestionResponseDto>;

export async function fetchTransactionNumber<TParams>(fetcher: TransactionNumberFetcher<TParams>, params?: TParams): Promise<string> {
  const response = await fetcher(params);
  return response.transactionNo;
}
