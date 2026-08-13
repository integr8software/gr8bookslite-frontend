/**
 * Generated-style API client for Item Categories.
 * Mirrors the Orval client shape used by generated module clients.
 */
import type {
  CreateItemCategoryDto,
  ItemCategoryListResponseDto,
  ItemCategoryOptionsResponseDto,
  SaveItemCategoryResponseDto,
  UpdateItemCategoryDto,
} from "../gR8BooksNeoAPI.schemas";

import { OrvalApiClient } from "../../../services/shared/api/OrvalApiClient";

type SecondParameter<T extends (...args: never) => unknown> = Parameters<T>[1];

export const itemCategoryControllerFindAllV1 = (
  options?: SecondParameter<typeof OrvalApiClient>,
  signal?: AbortSignal,
) =>
  OrvalApiClient<ItemCategoryListResponseDto>(
    {
      url: `/api/v1/maintenance/item-categories`,
      method: "GET",
      signal,
    },
    options,
  );

export const itemCategoryControllerFindOptionsV1 = (
  options?: SecondParameter<typeof OrvalApiClient>,
  signal?: AbortSignal,
) =>
  OrvalApiClient<ItemCategoryOptionsResponseDto>(
    {
      url: `/api/v1/maintenance/item-categories/options`,
      method: "GET",
      signal,
    },
    options,
  );

export const itemCategoryControllerCreateV1 = (
  createItemCategoryDto: CreateItemCategoryDto,
  options?: SecondParameter<typeof OrvalApiClient>,
  signal?: AbortSignal,
) =>
  OrvalApiClient<SaveItemCategoryResponseDto>(
    {
      url: `/api/v1/maintenance/item-categories`,
      method: "POST",
      headers: { "Content-Type": "application/json" },
      data: createItemCategoryDto,
      signal,
    },
    options,
  );

export const itemCategoryControllerUpdateV1 = (
  id: string,
  updateItemCategoryDto: UpdateItemCategoryDto,
  options?: SecondParameter<typeof OrvalApiClient>,
  signal?: AbortSignal,
) =>
  OrvalApiClient<SaveItemCategoryResponseDto>(
    {
      url: `/api/v1/maintenance/item-categories/${id}`,
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      data: updateItemCategoryDto,
      signal,
    },
    options,
  );
