"use client";

import { useMemo, useState } from "react";
import type { ClipboardEvent } from "react";
import {
  BeginningBalanceUploaderColumns,
  getBeginningBalanceUploaderColumnIndex,
} from "@/app/src/constants/modules/beginning-balance-uploader/BeginningBalanceUploaderConstants";
import {
  BeginningBalanceUploaderInitialRows,
  createBeginningBalanceUploaderRow,
  getBeginningBalanceUploaderTotals,
  getNextBeginningBalanceUploaderRowId,
  isBeginningBalanceHeaderRow,
  normalizeBeginningBalancePastedCell,
  parseBeginningBalanceSpreadsheetText,
} from "@/app/src/data/modules/beginning-balance-uploader/BeginningBalanceUploaderData";
import type {
  BeginningBalanceUploaderField,
  BeginningBalanceUploaderRow,
} from "@/app/src/types/modules/beginning-balance-uploader/BeginningBalanceUploaderTypes";

export function useBeginningBalanceUploaderFormPage() {
  const [rows, setRows] = useState(BeginningBalanceUploaderInitialRows);
  const [rowBatchSize, setRowBatchSize] = useState(1);
  const [remarks, setRemarks] = useState("");
  const [documentDate, setDocumentDate] = useState(() =>
    new Date().toISOString().slice(0, 10),
  );
  const totals = useMemo(() => getBeginningBalanceUploaderTotals(rows), [rows]);

  function addRows() {
    setRows((currentRows) => {
      let nextId = getNextBeginningBalanceUploaderRowId(currentRows);
      const rowsToAdd = Array.from({ length: rowBatchSize }, () =>
        createBeginningBalanceUploaderRow(nextId++),
      );

      return [...currentRows, ...rowsToAdd];
    });
  }

  function deleteRow(rowId: number) {
    setRows((currentRows) => {
      const nextRows = currentRows.filter((row) => row.id !== rowId);

      if (nextRows.length > 0) {
        return nextRows;
      }

      return [
        createBeginningBalanceUploaderRow(
          getNextBeginningBalanceUploaderRowId(currentRows),
        ),
      ];
    });
  }

  function updateRow(
    rowId: number,
    field: BeginningBalanceUploaderField,
    value: string,
  ) {
    setRows((currentRows) =>
      currentRows.map((row) =>
        row.id === rowId ? { ...row, [field]: value } : row,
      ),
    );
  }

  function pasteRows(
    event: ClipboardEvent<HTMLInputElement>,
    startRowIndex: number,
    startField: BeginningBalanceUploaderField,
  ) {
    const pastedText = event.clipboardData.getData("text");

    if (!pastedText) {
      return;
    }

    event.preventDefault();

    const startColumnIndex = getBeginningBalanceUploaderColumnIndex(startField);
    const pastedRows = parseBeginningBalanceSpreadsheetText(pastedText);
    const rowsToPaste = isBeginningBalanceHeaderRow(
      pastedRows[0],
      startColumnIndex,
    )
      ? pastedRows.slice(1)
      : pastedRows;

    if (!rowsToPaste.length) {
      return;
    }

    setRows((currentRows) =>
      applyPastedRows(currentRows, rowsToPaste, startRowIndex, startColumnIndex),
    );
  }

  return {
    addRows,
    deleteRow,
    documentDate,
    pasteRows,
    remarks,
    rowBatchSize,
    rows,
    setDocumentDate,
    setRemarks,
    setRowBatchSize,
    totals,
    updateRow,
  };
}

function applyPastedRows(
  currentRows: BeginningBalanceUploaderRow[],
  pastedRows: string[][],
  startRowIndex: number,
  startColumnIndex: number,
) {
  const nextRows = [...currentRows];
  let nextId = getNextBeginningBalanceUploaderRowId(nextRows);
  const requiredRowCount = startRowIndex + pastedRows.length;

  while (nextRows.length < requiredRowCount) {
    nextRows.push(createBeginningBalanceUploaderRow(nextId));
    nextId += 1;
  }

  pastedRows.forEach((pastedRow, pastedRowIndex) => {
    const targetRowIndex = startRowIndex + pastedRowIndex;
    const targetRow = { ...nextRows[targetRowIndex] };

    pastedRow.forEach((cellValue, pastedColumnIndex) => {
      const targetColumn =
        BeginningBalanceUploaderColumns[startColumnIndex + pastedColumnIndex];

      if (!targetColumn) {
        return;
      }

      targetRow[targetColumn.field] = normalizeBeginningBalancePastedCell(
        targetColumn.field,
        cellValue,
      );
    });

    nextRows[targetRowIndex] = targetRow;
  });

  return nextRows;
}
