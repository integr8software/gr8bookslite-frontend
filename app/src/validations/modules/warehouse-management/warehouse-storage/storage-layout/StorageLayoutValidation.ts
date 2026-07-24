import { z } from "zod";
import type { StorageLayoutDraft } from "@/app/src/types/modules/warehouse-management/warehouse-storage/storage-layout/StorageLayoutTypes";

const StorageLayoutDraftSchema = z.object({
  code: z.string().trim().min(1, "Level code is required."),
  name: z.string().trim().min(1, "Level name is required."),
  warehouseId: z.string().trim().min(1, "Select a warehouse."),
});

export function validateStorageLayoutDraft(draft: StorageLayoutDraft) {
  const result = StorageLayoutDraftSchema.safeParse(draft);
  return result.success ? null : result.error.issues[0]?.message ?? "Complete the required fields.";
}
