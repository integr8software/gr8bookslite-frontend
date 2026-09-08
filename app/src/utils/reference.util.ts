export function formatCopyReference(prefix: string, transactionNo: string) {
  return `${prefix}:${transactionNo.trim()}`;
}

export function normalizeReference(reference?: string | null) {
  const value = reference?.trim() ?? "";
  if (!value) {
    return "";
  }
  const separatorIndex = value.indexOf(":");
  const transactionNo = separatorIndex >= 0 ? value.slice(separatorIndex + 1).trim() : value;
  return transactionNo.toLowerCase();
}
