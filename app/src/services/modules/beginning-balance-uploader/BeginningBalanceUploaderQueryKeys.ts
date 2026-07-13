export const BeginningBalanceUploaderQueryKeys = {
  all: ["beginning-balance-uploader"] as const,
  records: () => [...BeginningBalanceUploaderQueryKeys.all, "records"] as const,
};
