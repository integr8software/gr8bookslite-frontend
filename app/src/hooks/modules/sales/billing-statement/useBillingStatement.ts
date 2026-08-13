"use client";

import { useMemo, useState } from "react";
import {
  loadBillingStatements,
  saveBillingStatements,
} from "@/app/src/data/modules/sales/billing-statement/BillingStatementData";
import type {
  BillingStatementRecord,
  BillingStatementStatus,
} from "@/app/src/types/modules/sales/billing-statement/BillingStatementTypes";

type BillingStatementStoreState = {
  statements: BillingStatementRecord[];
  addStatement: (statement: BillingStatementRecord) => void;
  updateStatement: (statement: BillingStatementRecord) => void;
  updateStatementStatus: (
    statement: BillingStatementRecord,
    status: BillingStatementStatus,
  ) => void;
  deleteStatement: (statementId: string) => void;
  lastSyncedAt: number;
  isMutating: boolean;
};

export function useBillingStatementStore<TSelected = BillingStatementStoreState>(
  selector?: (state: BillingStatementStoreState) => TSelected,
) {
  const [statements, setStatements] = useState(loadBillingStatements);
  const [lastSyncedAt, setLastSyncedAt] = useState(() => Date.now());
  const [isMutating, setIsMutating] = useState(false);

  function commit(nextStatements: BillingStatementRecord[]) {
    setIsMutating(true);
    saveBillingStatements(nextStatements);
    setStatements(nextStatements);
    setLastSyncedAt(Date.now());
    setIsMutating(false);
  }

  const state = useMemo<BillingStatementStoreState>(
    () => ({
      statements,
      addStatement: (statement) => commit([statement, ...statements]),
      updateStatement: (statement) =>
        commit(
          statements.map((currentStatement) =>
            currentStatement.id === statement.id ? statement : currentStatement,
          ),
        ),
      updateStatementStatus: (statement, status) =>
        commit(
          statements.map((currentStatement) =>
            currentStatement.id === statement.id
              ? { ...currentStatement, status }
              : currentStatement,
          ),
        ),
      deleteStatement: (statementId) =>
        commit(statements.filter((statement) => statement.id !== statementId)),
      lastSyncedAt,
      isMutating,
    }),
    [isMutating, lastSyncedAt, statements],
  );

  return selector ? selector(state) : (state as TSelected);
}
