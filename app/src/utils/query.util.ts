export function cleanQueryParams(params: Record<string, number | string | null | undefined | boolean>) {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => {
      if (value === undefined || value === null) return false;
      if (typeof value === "string" && value.trim() === "") return false;
      return true;
    }),
  );
}

export const cleanCopyFromQueryParams = cleanQueryParams;
