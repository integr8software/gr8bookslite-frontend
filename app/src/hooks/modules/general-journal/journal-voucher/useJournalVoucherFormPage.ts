"use client";

import { useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  JournalVoucherHref,
  JournalVoucherBaseCurrencyCode,
  JournalVoucherInputVatTaxType,
  JournalVoucherOutputVatTaxType,
  JournalVoucherEwtTaxType,
  JournalVoucherCwtTaxType,
} from "@/app/src/constants/modules/general-journal/journal-voucher/JournalVoucherConstants";
import {
  createJournalVoucherFormValues,
  createJournalVoucherFromForm,
  createJournalVoucherLine,
  getJournalVoucherTotals,
  isJournalVoucherGeneratedTaxLine,
  JournalVoucherGeneratedCwtLineIdPrefix,
  JournalVoucherGeneratedEwtLineIdPrefix,
  JournalVoucherGeneratedInputVatLineIdPrefix,
  JournalVoucherGeneratedOutputVatLineIdPrefix,
  renumberJournalVoucherLines,
  updateJournalVoucherFromForm,
} from "@/app/src/data/modules/general-journal/journal-voucher/JournalVoucherData";
import {
  useJournalVoucherDetail,
  useJournalVoucherLookups,
  useJournalVoucherNumberSuggestion,
  useJournalVoucherStore,
} from "@/app/src/hooks/modules/general-journal/journal-voucher/useJournalVoucher";
import { FetchMultiCurrencyRates } from "@/app/src/services/modules/system-administration/multi-currency-setup/MultiCurrencySetupService";
import type {
  JournalVoucherActionMode,
  JournalVoucherFormErrors,
  JournalVoucherFormValues,
  JournalVoucherLine,
  JournalVoucherLineField,
  JournalVoucherLookupAccount,
  JournalVoucherLookupTax,
} from "@/app/src/types/modules/general-journal/journal-voucher/JournalVoucherTypes";
import type { ModuleDataEntryClearAction } from "@/app/src/types/shared/module/module-data-entry/DataEntryTypes";
import { validateJournalVoucherForm } from "@/app/src/validations/modules/general-journal/journal-voucher/JournalVoucherValidation";

export function useJournalVoucherFormPage() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams<{ recordId?: string }>();
  const records = useJournalVoucherStore((state) => state.records);
  const addRecord = useJournalVoucherStore((state) => state.addRecord);
  const updateRecord = useJournalVoucherStore((state) => state.updateRecord);
  const updateStatus = useJournalVoucherStore((state) => state.updateStatus);
  const isMutating = useJournalVoucherStore((state) => state.isMutating);
  const mode = getActionMode(pathname);
  const detailQuery = useJournalVoucherDetail(params.recordId);
  const lookupsQuery = useJournalVoucherLookups();
  const numberSuggestionQuery = useJournalVoucherNumberSuggestion(mode === "add");
  const existingRecord = detailQuery.data ?? records.find((record) => record.id === params.recordId);
  const isReadonly = mode === "view" || existingRecord?.status === "Posted";
  const taxAccountingContext = useMemo(
    () => ({
      accounts: lookupsQuery.data?.accounts ?? [],
      taxCodes: lookupsQuery.data?.taxCodes ?? [],
    }),
    [lookupsQuery.data?.accounts, lookupsQuery.data?.taxCodes],
  );
  const [values, setValues] = useState<JournalVoucherFormValues>(() => createJournalVoucherFormValues(existingRecord));
  const [errors, setErrors] = useState<JournalVoucherFormErrors>({});
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [isExchangeRateLoading, setIsExchangeRateLoading] = useState(false);
  const exchangeRateRequestIdRef = useRef(0);
  const hasAppliedNumberSuggestionRef = useRef(false);
  const hydratedRecordIdRef = useRef<string | null>(null);
  const displayValues = useMemo(
    () => syncJournalVoucherWithGeneratedTaxLines(values, taxAccountingContext),
    [taxAccountingContext, values],
  );
  const totals = useMemo(() => getJournalVoucherTotals(displayValues.lines), [displayValues.lines]);

  useEffect(() => {
    if (!detailQuery.data || hydratedRecordIdRef.current === detailQuery.data.id) {
      return;
    }

    hydratedRecordIdRef.current = detailQuery.data.id;
    setValues(createJournalVoucherFormValues(detailQuery.data));
    setErrors({});
  }, [detailQuery.data]);

  useEffect(() => {
    const suggestedTransactionNo = numberSuggestionQuery.data?.transactionNo;

    if (mode !== "add" || !suggestedTransactionNo || hasAppliedNumberSuggestionRef.current || values.transactionNo.trim() !== "") {
      return;
    }

    setValues((current) => (current.transactionNo.trim() === "" ? { ...current, transactionNo: suggestedTransactionNo } : current));
    hasAppliedNumberSuggestionRef.current = true;
  }, [mode, numberSuggestionQuery.data?.transactionNo, values.transactionNo]);

  useEffect(() => {
    hasAppliedNumberSuggestionRef.current = false;
  }, [mode]);

  function handleInputChange(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    if (isReadonly) {
      return;
    }

    const field = event.target.name as keyof JournalVoucherFormValues;
    const fieldValue = event.target.value;

    if (field === "currencyType") {
      void updateCurrencyFromExchangeRates(fieldValue);
      return;
    }

    const value = field === "currencyRate" ? Number(fieldValue || 0) : fieldValue;

    setValues((current) => createHeaderUpdatedJournalVoucherValues(current, field, value as JournalVoucherFormValues[typeof field]));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  async function updateCurrencyFromExchangeRates(currencyCode: string) {
    const requestId = exchangeRateRequestIdRef.current + 1;

    exchangeRateRequestIdRef.current = requestId;
    setValues((current) => ({
      ...current,
      currencyType: currencyCode,
      currencyRate: currencyCode === JournalVoucherBaseCurrencyCode ? 1 : current.currencyRate,
    }));
    setErrors((current) => ({
      ...current,
      currencyType: undefined,
      currencyRate: undefined,
    }));

    if (currencyCode === JournalVoucherBaseCurrencyCode) {
      setIsExchangeRateLoading(false);
      return;
    }

    setIsExchangeRateLoading(true);

    try {
      const rates = await FetchMultiCurrencyRates(currencyCode);
      const phpRate = rates.find((rate) => rate.targetCurrencyCode === JournalVoucherBaseCurrencyCode);

      if (exchangeRateRequestIdRef.current !== requestId) {
        return;
      }

      if (!phpRate) {
        throw new Error("No PHP exchange rate returned.");
      }

      setValues((current) => ({
        ...current,
        currencyRate: normalizeExchangeRate(phpRate.exchangeRate),
      }));
    } catch {
      if (exchangeRateRequestIdRef.current === requestId) {
        setErrors((current) => ({
          ...current,
          currencyRate: "Could not load the exchange rate.",
        }));
        toast.error("Could not load the exchange rate for the selected currency.");
      }
    } finally {
      if (exchangeRateRequestIdRef.current === requestId) {
        setIsExchangeRateLoading(false);
      }
    }
  }

  function updateCurrencyType(currencyCode: string) {
    if (isReadonly) {
      return;
    }

    void updateCurrencyFromExchangeRates(currencyCode);
  }

  function updateLine(lineId: string, field: JournalVoucherLineField, value: string | number) {
    if (isReadonly) {
      return;
    }

    setValues((current) => {
      const nextValues = {
        ...current,
        lines: current.lines.map((line) => (line.id === lineId ? normalizeJournalVoucherLineUpdate(line, field, value) : line)),
      };

      return shouldEnsureTrailingBlankSourceLineForJournalVoucherField(field)
        ? ensureJournalVoucherTrailingBlankSourceLineForGeneratedTaxes(nextValues, taxAccountingContext)
        : nextValues;
    });
    clearLineError(lineId, field);
  }

  function addLines(count = 1) {
    if (isReadonly) {
      return;
    }

    setValues((current) => ({
      ...current,
      lines: [
        ...current.lines,
        ...Array.from({ length: count }, (_, index) =>
          createJournalVoucherLine(current.lines.length + index + 1, { particulars: current.remarks }),
        ),
      ],
    }));
    setErrors((current) => ({ ...current, lines: undefined }));
  }

  function removeLine(lineId: string) {
    if (isReadonly) {
      return;
    }

    setValues((current) => {
      const nextLines = current.lines.filter((line) => line.id !== lineId);

      return {
        ...current,
        lines: renumberJournalVoucherLines(
          nextLines.length > 0 ? nextLines : [createJournalVoucherLine(1, { particulars: current.remarks })],
        ),
      };
    });
    setErrors((current) => ({ ...current, balance: undefined, lines: undefined }));
  }

  function insertLine(lineId: string, position: "above" | "below") {
    if (isReadonly) {
      return;
    }

    setValues((current) => {
      const rowIndex = current.lines.findIndex((line) => line.id === lineId);
      const insertIndex = rowIndex === -1 ? current.lines.length : rowIndex + (position === "below" ? 1 : 0);
      const nextLines = [...current.lines];

      nextLines.splice(insertIndex, 0, createJournalVoucherLine(insertIndex + 1, { particulars: current.remarks }));

      return {
        ...current,
        lines: renumberJournalVoucherLines(nextLines),
      };
    });
    setErrors((current) => ({ ...current, lines: undefined }));
  }

  function duplicateLine(lineId: string) {
    if (isReadonly) {
      return;
    }

    setValues((current) => {
      const rowIndex = current.lines.findIndex((line) => line.id === lineId);
      const sourceLine = current.lines[rowIndex];

      if (!sourceLine) {
        return current;
      }

      const nextLines = [...current.lines];

      nextLines.splice(rowIndex + 1, 0, {
        ...sourceLine,
        id: `jv-line-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      });

      return {
        ...current,
        lines: renumberJournalVoucherLines(nextLines),
      };
    });
    setErrors((current) => ({ ...current, lines: undefined }));
  }

  function moveLine(fromLineId: string, toLineId: string) {
    if (isReadonly || fromLineId === toLineId) {
      return;
    }

    setValues((current) => {
      const fromIndex = current.lines.findIndex((line) => line.id === fromLineId);
      const toIndex = current.lines.findIndex((line) => line.id === toLineId);

      if (fromIndex === -1 || toIndex === -1) {
        return current;
      }

      const nextLines = [...current.lines];
      const [movedLine] = nextLines.splice(fromIndex, 1);

      nextLines.splice(toIndex, 0, movedLine);

      return {
        ...current,
        lines: renumberJournalVoucherLines(nextLines),
      };
    });
  }

  function clearLines(action: ModuleDataEntryClearAction) {
    if (isReadonly) {
      return;
    }

    setValues((current) => {
      const nextLines = action === "all" ? [] : current.lines.filter((line) => !shouldClearLine(line, action));

      return {
        ...current,
        lines: renumberJournalVoucherLines(
          nextLines.length > 0 ? nextLines : [createJournalVoucherLine(1, { particulars: current.remarks })],
        ),
      };
    });
    setErrors((current) => ({ ...current, balance: undefined, lines: undefined }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isReadonly) {
      return;
    }

    const submitValues = syncJournalVoucherWithGeneratedTaxLines(values, taxAccountingContext);
    const nextErrors = validateJournalVoucherForm(submitValues);

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      toast.error("Please fix the highlighted journal voucher fields before saving.");
      return;
    }

    if (mode === "edit" && existingRecord) {
      updateRecord(updateJournalVoucherFromForm(existingRecord, submitValues));
    } else if (mode === "edit") {
      toast.error("Could not find the journal voucher to update.");
      return;
    } else {
      addRecord(createJournalVoucherFromForm(submitValues));
    }

    router.push(JournalVoucherHref);
  }

  function handleConfirmCancelVoucher() {
    if (!existingRecord) {
      toast.error("Could not find the journal voucher to cancel.");
      return;
    }

    updateStatus(existingRecord.id, "Cancelled");
    setIsCancelDialogOpen(false);
    router.push(JournalVoucherHref);
  }

  function clearLineError(lineId: string, field: JournalVoucherLineField) {
    const fieldsToClear: JournalVoucherLineField[] = field === "debit" || field === "credit" ? ["debit", "credit"] : [field];

    setErrors((current) => ({
      ...current,
      balance: undefined,
      lineErrors: {
        ...current.lineErrors,
        [lineId]: fieldsToClear.reduce(
          (lineErrors, currentField) => ({
            ...lineErrors,
            [currentField]: undefined,
          }),
          { ...current.lineErrors?.[lineId] },
        ),
      },
    }));
  }

  return {
    addLines,
    clearLines,
    duplicateLine,
    errors,
    existingRecord,
    handleConfirmCancelVoucher,
    handleInputChange,
    handleSubmit,
    insertLine,
    isCancelDialogOpen,
    isExchangeRateLoading,
    isMutating,
    isReadonly,
    isRecordLoading: (mode === "edit" || mode === "view") && !existingRecord && detailQuery.isLoading,
    mode,
    moveLine,
    needsRecord: mode === "edit" || mode === "view",
    removeLine,
    setIsCancelDialogOpen,
    totals,
    updateLine,
    updateCurrencyType,
    values: displayValues,
  };
}

type JournalVoucherTaxAccountingContext = {
  accounts: JournalVoucherLookupAccount[];
  taxCodes: JournalVoucherLookupTax[];
};

type JournalVoucherTaxAccountFallback = {
  accountCode: string;
  accountTitle: string;
};

type JournalVoucherGeneratedTaxLineConfig = {
  accountCandidates: JournalVoucherTaxAccountFallback[];
  idPrefix: string;
  side: "credit" | "debit";
  type: "vat" | "withholding";
};

function syncJournalVoucherWithGeneratedTaxLines(
  values: JournalVoucherFormValues,
  taxAccountingContext: JournalVoucherTaxAccountingContext,
): JournalVoucherFormValues {
  if (taxAccountingContext.taxCodes.length === 0) {
    return {
      ...values,
      lines: renumberJournalVoucherLines(values.lines),
    };
  }

  const nextLines: JournalVoucherLine[] = [];
  const sourceLines = getJournalVoucherTaxSourceLines(values.lines);

  for (const sourceLine of sourceLines) {
    const normalizedSourceLine = normalizeJournalVoucherSourceLineTaxValues(sourceLine, taxAccountingContext.taxCodes);
    const generatedLines = createJournalVoucherGeneratedTaxLines(values, normalizedSourceLine, taxAccountingContext);
    const vatLine = generatedLines.find(
      (line) => line.id.startsWith(JournalVoucherGeneratedInputVatLineIdPrefix) || line.id.startsWith(JournalVoucherGeneratedOutputVatLineIdPrefix),
    );

    nextLines.push(deductJournalVoucherVatAmountFromSourceLine(normalizedSourceLine, vatLine), ...generatedLines);
  }

  return {
    ...values,
    lines: renumberJournalVoucherLines(nextLines.length > 0 ? nextLines : [createJournalVoucherLine(1, { particulars: values.remarks })]),
  };
}

function ensureJournalVoucherTrailingBlankSourceLineForGeneratedTaxes(
  values: JournalVoucherFormValues,
  taxAccountingContext: JournalVoucherTaxAccountingContext,
): JournalVoucherFormValues {
  if (!journalVoucherHasGeneratedTaxLines(values, taxAccountingContext)) {
    return values;
  }

  const sourceLines = getJournalVoucherTaxSourceLines(values.lines);
  const lastSourceLine = sourceLines[sourceLines.length - 1];

  if (lastSourceLine && journalVoucherSourceLineIsBlank(lastSourceLine, values.remarks)) {
    return values;
  }

  return {
    ...values,
    lines: renumberJournalVoucherLines([...values.lines, createJournalVoucherLine(values.lines.length + 1)]),
  };
}

function journalVoucherHasGeneratedTaxLines(
  values: JournalVoucherFormValues,
  taxAccountingContext: JournalVoucherTaxAccountingContext,
) {
  if (taxAccountingContext.taxCodes.length === 0) {
    return false;
  }

  return getJournalVoucherTaxSourceLines(values.lines)
    .some((line) => {
      const normalizedLine = normalizeJournalVoucherSourceLineTaxValues(line, taxAccountingContext.taxCodes);

      return createJournalVoucherGeneratedTaxLines(values, normalizedLine, taxAccountingContext).length > 0;
    });
}

function createJournalVoucherGeneratedTaxLines(
  values: JournalVoucherFormValues,
  sourceLine: JournalVoucherLine,
  taxAccountingContext: JournalVoucherTaxAccountingContext,
) {
  if (shouldSkipJournalVoucherGeneratedTaxSourceLine(sourceLine)) {
    return [];
  }

  return [
    createJournalVoucherGeneratedTaxLine(
      values,
      sourceLine,
      sourceLine.vatType,
      [JournalVoucherInputVatTaxType, JournalVoucherOutputVatTaxType],
      taxAccountingContext,
    ),
    createJournalVoucherGeneratedTaxLine(
      values,
      sourceLine,
      sourceLine.atcCode,
      [JournalVoucherEwtTaxType, JournalVoucherCwtTaxType],
      taxAccountingContext,
    ),
  ].filter((line): line is JournalVoucherLine => Boolean(line));
}

function getJournalVoucherTaxSourceLines(lines: JournalVoucherLine[]) {
  return lines.filter((line) => !isJournalVoucherGeneratedOrPersistedTaxLine(line));
}

function isJournalVoucherGeneratedOrPersistedTaxLine(line: JournalVoucherLine) {
  return isJournalVoucherGeneratedTaxLine(line) || isJournalVoucherPersistedGeneratedTaxLine(line);
}

function isJournalVoucherPersistedGeneratedTaxLine(line: JournalVoucherLine) {
  if (!isJournalVoucherTaxAccountLine(line)) {
    return false;
  }

  const vatType = normalizeJournalVoucherAccountText(line.vatType);
  const atcCode = line.atcCode.trim();

  return (
    vatType === "input vat" ||
    vatType === "output vat" ||
    vatType === "ewt" ||
    vatType === "cwt" ||
    atcCode !== "" ||
    line.vatType.trim() !== ""
  );
}

function createJournalVoucherGeneratedTaxLine(
  values: JournalVoucherFormValues,
  sourceLine: JournalVoucherLine,
  taxValue: string,
  taxTypes: string[],
  taxAccountingContext: JournalVoucherTaxAccountingContext,
) {
  const taxCode = findJournalVoucherTaxCode(taxAccountingContext.taxCodes, taxValue, taxTypes);

  if (!taxCode) {
    return null;
  }

  const taxRate = normalizeJournalVoucherTaxRate(taxCode.taxRate);
  const sourceAmount = getJournalVoucherLineAmount(sourceLine);
  const taxAmount = roundJournalVoucherAccountingAmount((sourceAmount * taxRate) / 100);

  if (taxAmount <= 0) {
    return null;
  }

  const config = getJournalVoucherGeneratedTaxLineConfig(taxCode);
  const account = getJournalVoucherTaxAccount(taxAccountingContext.accounts, config);
  const amounts = getSignedJournalVoucherAccountingAmounts(taxAmount, config.side);

  return createJournalVoucherLine(sourceLine.lineNumber + 1, {
    id: `${config.idPrefix}${sourceLine.id}`,
    accountCode: account.accountCode,
    accountTitle: account.accountTitle,
    atcCode: config.type === "withholding" ? getJournalVoucherTaxOptionValue(taxCode) : "",
    credit: amounts.credit,
    debit: amounts.debit,
    particulars: getJournalVoucherGeneratedTaxParticulars(values, sourceLine),
    partyCode: sourceLine.partyCode,
    partyName: sourceLine.partyName,
    refNo: sourceLine.refNo,
    responsibilityCenter: sourceLine.responsibilityCenter,
    vatType: getJournalVoucherGeneratedTaxVatTypeLabel(taxCode),
  });
}

function getJournalVoucherGeneratedTaxVatTypeLabel(taxCode: JournalVoucherLookupTax) {
  switch (taxCode.taxType) {
    case JournalVoucherInputVatTaxType:
      return "Input VAT";
    case JournalVoucherOutputVatTaxType:
      return "Output VAT";
    case JournalVoucherEwtTaxType:
      return JournalVoucherEwtTaxType;
    case JournalVoucherCwtTaxType:
      return JournalVoucherCwtTaxType;
    default:
      return taxCode.taxType;
  }
}

function getJournalVoucherGeneratedTaxLineConfig(taxCode: JournalVoucherLookupTax): JournalVoucherGeneratedTaxLineConfig {
  switch (taxCode.taxType) {
    case JournalVoucherInputVatTaxType:
      return {
        accountCandidates: [
          { accountCode: "1010104003", accountTitle: "Input VAT" },
          { accountCode: "2010002011", accountTitle: "Input VAT" },
          { accountCode: "1010104007", accountTitle: "Input Tax" },
        ],
        idPrefix: JournalVoucherGeneratedInputVatLineIdPrefix,
        side: "debit",
        type: "vat",
      };
    case JournalVoucherOutputVatTaxType:
      return {
        accountCandidates: [
          { accountCode: "2010002005", accountTitle: "Output VAT" },
          { accountCode: "2010002006", accountTitle: "VAT Payable" },
          { accountCode: "2010002004", accountTitle: "Deferred Output VAT" },
        ],
        idPrefix: JournalVoucherGeneratedOutputVatLineIdPrefix,
        side: "credit",
        type: "vat",
      };
    case JournalVoucherCwtTaxType:
      return {
        accountCandidates: [
          { accountCode: "1010104008", accountTitle: "Creditable Withholding Tax" },
          { accountCode: "1010104009", accountTitle: "Withholding Tax Receivable" },
          { accountCode: "1010104002", accountTitle: "Bir 2307 - Creditable Withheld Taxes" },
        ],
        idPrefix: JournalVoucherGeneratedCwtLineIdPrefix,
        side: "debit",
        type: "withholding",
      };
    default:
      return {
        accountCandidates: [
          { accountCode: "2010002002", accountTitle: "Expanded Withholding Tax" },
          { accountCode: "2010002001", accountTitle: "Creditable Withholding Tax" },
        ],
        idPrefix: JournalVoucherGeneratedEwtLineIdPrefix,
        side: "credit",
        type: "withholding",
      };
  }
}

function getJournalVoucherTaxAccount(
  accounts: JournalVoucherLookupAccount[],
  config: JournalVoucherGeneratedTaxLineConfig,
): JournalVoucherTaxAccountFallback {
  const account = findJournalVoucherTaxAccount(accounts, config.accountCandidates, config.side);
  const fallback = config.accountCandidates[0];

  return {
    accountCode: account?.accountCode ?? fallback.accountCode,
    accountTitle: account?.accountTitle ?? fallback.accountTitle,
  };
}

function findJournalVoucherTaxAccount(
  accounts: JournalVoucherLookupAccount[],
  candidates: JournalVoucherTaxAccountFallback[],
  side: "credit" | "debit",
) {
  const activeAccounts = accounts.filter((account) => account.status.trim().toUpperCase() !== "INACTIVE");

  return (
    findJournalVoucherTaxAccountByPriority(activeAccounts, candidates, side, "code-and-side") ??
    findJournalVoucherTaxAccountByPriority(activeAccounts, candidates, side, "title-and-side") ??
    findJournalVoucherTaxAccountByPriority(activeAccounts, candidates, side, "code") ??
    findJournalVoucherTaxAccountByPriority(activeAccounts, candidates, side, "title") ??
    findJournalVoucherTaxAccountByPriority(activeAccounts, candidates, side, "contains-title-and-side") ??
    findJournalVoucherTaxAccountByPriority(activeAccounts, candidates, side, "contains-title")
  );
}

function findJournalVoucherTaxAccountByPriority(
  accounts: JournalVoucherLookupAccount[],
  candidates: JournalVoucherTaxAccountFallback[],
  side: "credit" | "debit",
  priority: "code" | "code-and-side" | "contains-title" | "contains-title-and-side" | "title" | "title-and-side",
) {
  for (const candidate of candidates) {
    const account = accounts.find((row) => isJournalVoucherTaxAccountMatch(row, candidate, side, priority));

    if (account) {
      return account;
    }
  }

  return undefined;
}

function isJournalVoucherTaxAccountMatch(
  account: JournalVoucherLookupAccount,
  candidate: JournalVoucherTaxAccountFallback,
  side: "credit" | "debit",
  priority: "code" | "code-and-side" | "contains-title" | "contains-title-and-side" | "title" | "title-and-side",
) {
  const candidateCode = candidate.accountCode.trim();
  const candidateTitle = normalizeJournalVoucherAccountText(candidate.accountTitle);
  const accountCode = account.accountCode.trim();
  const accountTitle = normalizeJournalVoucherAccountText(account.accountTitle);
  const sideMatches = account.accountNature.trim().toLowerCase() === side;

  switch (priority) {
    case "code-and-side":
      return candidateCode !== "" && accountCode === candidateCode && sideMatches;
    case "title-and-side":
      return candidateTitle !== "" && accountTitle === candidateTitle && sideMatches;
    case "code":
      return candidateCode !== "" && accountCode === candidateCode;
    case "title":
      return candidateTitle !== "" && accountTitle === candidateTitle;
    case "contains-title-and-side":
      return candidateTitle !== "" && accountTitle.includes(candidateTitle) && sideMatches;
    case "contains-title":
      return candidateTitle !== "" && accountTitle.includes(candidateTitle);
  }
}

function deductJournalVoucherVatAmountFromSourceLine(sourceLine: JournalVoucherLine, vatLine: JournalVoucherLine | undefined) {
  if (!vatLine) {
    return sourceLine;
  }

  const sourceSide = getJournalVoucherLineSide(sourceLine);
  const vatSide = getJournalVoucherLineSide(vatLine);

  if (!sourceSide || sourceSide !== vatSide) {
    return sourceLine;
  }

  return {
    ...sourceLine,
    [sourceSide]: roundJournalVoucherAccountingAmount(Math.max(Number(sourceLine[sourceSide] || 0) - getJournalVoucherLineAmount(vatLine), 0)),
  };
}

function getJournalVoucherGeneratedTaxParticulars(values: JournalVoucherFormValues, sourceLine: JournalVoucherLine) {
  return sourceLine.particulars.trim() || values.remarks.trim() || sourceLine.accountTitle.trim();
}

function findJournalVoucherTaxCode(taxCodes: JournalVoucherLookupTax[], taxValue: string, taxTypes: string[]) {
  const normalizedTaxValue = taxValue.trim();

  if (!normalizedTaxValue) {
    return undefined;
  }

  return taxCodes.find(
    (taxCode) =>
      taxTypes.includes(taxCode.taxType) &&
      [taxCode.sourceKey, taxCode.id, taxCode.taxCode].some((value) => value.trim() === normalizedTaxValue),
  );
}

function normalizeJournalVoucherSourceLineTaxValues(line: JournalVoucherLine, taxCodes: JournalVoucherLookupTax[]) {
  const vatTaxCode = findJournalVoucherTaxCode(taxCodes, line.vatType, [JournalVoucherInputVatTaxType, JournalVoucherOutputVatTaxType]);
  const withholdingTaxCode = findJournalVoucherTaxCode(taxCodes, line.atcCode, [JournalVoucherEwtTaxType, JournalVoucherCwtTaxType]);

  return {
    ...line,
    atcCode: withholdingTaxCode ? getJournalVoucherTaxOptionValue(withholdingTaxCode) : line.atcCode,
    vatType: vatTaxCode ? getJournalVoucherTaxOptionValue(vatTaxCode) : line.vatType,
  };
}

function getJournalVoucherTaxOptionValue(taxCode: JournalVoucherLookupTax) {
  return taxCode.sourceKey.trim() || taxCode.id.trim() || taxCode.taxCode.trim();
}

function shouldSkipJournalVoucherGeneratedTaxSourceLine(line: JournalVoucherLine) {
  return isJournalVoucherGeneratedTaxLine(line) || getJournalVoucherLineAmount(line) <= 0 || isJournalVoucherTaxAccountLine(line);
}

function isJournalVoucherTaxAccountLine(line: JournalVoucherLine) {
  const accountTitle = normalizeJournalVoucherAccountText(line.accountTitle);

  return (
    accountTitle === "input vat" ||
    accountTitle === "input tax" ||
    accountTitle === "output vat" ||
    accountTitle === "vat payable" ||
    accountTitle === "expanded withholding tax" ||
    accountTitle === "creditable withholding tax" ||
    accountTitle === "withholding tax receivable" ||
    accountTitle === "bir 2307 creditable withheld taxes"
  );
}

function getJournalVoucherLineAmount(line: JournalVoucherLine | null | undefined) {
  if (!line) {
    return 0;
  }

  return Math.abs(Number(line.debit || 0) || Number(line.credit || 0));
}

function getJournalVoucherLineSide(line: JournalVoucherLine) {
  if (Number(line.debit || 0) > 0) {
    return "debit" as const;
  }

  if (Number(line.credit || 0) > 0) {
    return "credit" as const;
  }

  return null;
}

function getSignedJournalVoucherAccountingAmounts(value: number, positiveSide: "credit" | "debit") {
  const roundedValue = roundJournalVoucherAccountingAmount(value);
  const amount = Math.abs(roundedValue);

  return {
    credit: positiveSide === "credit" ? amount : 0,
    debit: positiveSide === "debit" ? amount : 0,
  };
}

function normalizeJournalVoucherTaxRate(value: string) {
  const taxRate = Number(value || 0);

  return Number.isFinite(taxRate) && taxRate > 0 ? taxRate : 0;
}

function roundJournalVoucherAccountingAmount(value: number) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.round(value * 100) / 100;
}

function normalizeJournalVoucherAccountText(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/gu, " ").trim();
}

function getActionMode(pathname: string): JournalVoucherActionMode {
  if (pathname.includes("/view/")) {
    return "view";
  }

  if (pathname.includes("/edit/")) {
    return "edit";
  }

  return "add";
}

function normalizeJournalVoucherLineUpdate(line: JournalVoucherLine, field: JournalVoucherLineField, value: string | number) {
  const nextLine = {
    ...line,
    [field]: field === "debit" || field === "credit" ? Number(value || 0) : value,
  };

  if (field === "debit" && Number(nextLine.debit || 0) > 0) {
    nextLine.credit = 0;
  }

  if (field === "credit" && Number(nextLine.credit || 0) > 0) {
    nextLine.debit = 0;
  }

  return nextLine;
}

function shouldEnsureTrailingBlankSourceLineForJournalVoucherField(field: JournalVoucherLineField) {
  return field === "debit" || field === "credit" || field === "vatType" || field === "atcCode";
}

function normalizeExchangeRate(value: number) {
  if (!Number.isFinite(value) || value <= 0) {
    return 0;
  }

  return Number(value.toFixed(6));
}

function createHeaderUpdatedJournalVoucherValues<TKey extends keyof JournalVoucherFormValues>(
  current: JournalVoucherFormValues,
  field: TKey,
  value: JournalVoucherFormValues[TKey],
) {
  const nextValues = {
    ...current,
    [field]: value,
  } as JournalVoucherFormValues;

  if (field !== "remarks") {
    return nextValues;
  }

  return syncInheritedLineParticulars(nextValues, current.remarks, String(value ?? ""));
}

function syncInheritedLineParticulars(values: JournalVoucherFormValues, previousRemarks: string, nextRemarks: string) {
  return {
    ...values,
    lines: values.lines.map((line) =>
      shouldLineParticularsFollowRemarks(line, previousRemarks) ? { ...line, particulars: nextRemarks } : line,
    ),
  };
}

function shouldLineParticularsFollowRemarks(line: JournalVoucherLine, previousRemarks: string) {
  const particulars = line.particulars.trim();
  const inheritedParticulars = previousRemarks.trim();

  return particulars === "" || (inheritedParticulars !== "" && particulars === inheritedParticulars);
}

function shouldClearLine(line: JournalVoucherLine, action: Exclude<ModuleDataEntryClearAction, "all">) {
  if (action === "with-data") {
    return journalVoucherLineHasData(line);
  }

  if (action === "incomplete") {
    return journalVoucherLineHasData(line) && !journalVoucherLineIsComplete(line);
  }

  return !journalVoucherLineHasData(line);
}

function journalVoucherLineHasData(line: JournalVoucherLine) {
  return (
    line.accountCode.trim() !== "" ||
    line.accountTitle.trim() !== "" ||
    line.particulars.trim() !== "" ||
    line.partyCode.trim() !== "" ||
    line.partyName.trim() !== "" ||
    line.responsibilityCenter.trim() !== "" ||
    line.refNo.trim() !== "" ||
    line.vatType.trim() !== "" ||
    line.atcCode.trim() !== "" ||
    Number(line.debit || 0) > 0 ||
    Number(line.credit || 0) > 0
  );
}

function journalVoucherSourceLineIsBlank(line: JournalVoucherLine, remarks: string) {
  const particulars = line.particulars.trim();
  const inheritedParticulars = remarks.trim();

  return (
    line.accountCode.trim() === "" &&
    line.accountTitle.trim() === "" &&
    (particulars === "" || (inheritedParticulars !== "" && particulars === inheritedParticulars)) &&
    line.partyCode.trim() === "" &&
    line.partyName.trim() === "" &&
    line.responsibilityCenter.trim() === "" &&
    line.refNo.trim() === "" &&
    line.vatType.trim() === "" &&
    line.atcCode.trim() === "" &&
    Number(line.debit || 0) <= 0 &&
    Number(line.credit || 0) <= 0
  );
}

function journalVoucherLineIsComplete(line: JournalVoucherLine) {
  const hasDebit = Number(line.debit || 0) > 0;
  const hasCredit = Number(line.credit || 0) > 0;

  return line.accountCode.trim() !== "" && line.accountTitle.trim() !== "" && (hasDebit || hasCredit) && !(hasDebit && hasCredit);
}
