import type {
	ColumnOrderState,
	OnChangeFn,
	SortingState,
	VisibilityState,
} from "@tanstack/react-table";

export type TablePreferences = {
	columnOrder: ColumnOrderState;
	columnVisibility: VisibilityState;
	sorting: SortingState;
};

export type TablePreferencesState = TablePreferences & {
	setColumnOrder: OnChangeFn<ColumnOrderState>;
	setColumnVisibility: OnChangeFn<VisibilityState>;
	setSorting: OnChangeFn<SortingState>;
};

export type UseTablePreferencesOptions = {
	defaultColumnOrder: ColumnOrderState;
	defaultColumnVisibility: VisibilityState;
	defaultSorting: SortingState;
	moduleKey: string;
	storageKey: string;
};
