export type ModuleHistoryEntry<TStatus extends string = string> = {
  id: string;
  action: string;
  actor: string;
  createdAt: string;
  description: string;
  status: TStatus;
};
