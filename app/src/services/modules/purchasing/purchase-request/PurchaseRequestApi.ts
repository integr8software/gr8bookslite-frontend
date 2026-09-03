import {
  purchaseRequestControllerCreateV1,
  purchaseRequestControllerUpdateV1,
} from "@/app/src/generated/api/purchase-request/purchase-request";
import type {
  CreatePurchaseRequestDto,
  PurchaseRequestContainerResponseDto,
} from "@/app/src/generated/api/gR8BooksNeoAPI.schemas";
import type { PurchaseRequestFormValues } from "@/app/src/types/modules/purchasing/purchase-request/PurchaseRequestTypes";

export async function createPurchaseRequest(
  values: PurchaseRequestFormValues,
  branchUnitId?: number | null,
): Promise<PurchaseRequestContainerResponseDto> {
  return purchaseRequestControllerCreateV1(toPurchaseRequestPayload(values, branchUnitId));
}

export async function updatePurchaseRequest(
  id: string,
  values: PurchaseRequestFormValues,
  branchUnitId?: number | null,
): Promise<PurchaseRequestContainerResponseDto> {
  return purchaseRequestControllerUpdateV1(id, toPurchaseRequestPayload(values, branchUnitId));
}

function toPurchaseRequestPayload(
  values: PurchaseRequestFormValues,
  branchUnitId?: number | null,
): CreatePurchaseRequestDto {
  return {
    branchUnitId: branchUnitId ?? undefined,
    transNo: values.transNo.trim(),
    prDate: values.prDate,
    partyCode: values.vceCode.trim(),
    partyName: values.vceName.trim(),
    purchaseType: values.purchaseType,
    vendorAddress: values.vendorAddress.trim() || null,
    projectCode: values.projectCode.trim() || null,
    projectName: values.projectName.trim() || null,
    currency: values.currency,
    exchangeRate: Number(values.exchangeRate) || 1,
    forDepartment: values.forDepartment.trim() || null,
    bomNo: values.bomNo.trim() || null,
    remarks: values.remarks.trim() || null,
    items: values.items.map((item) => ({
      itemId: item.itemId || null,
      serviceMaintenanceId: item.serviceMaintenanceId || null,
      itemCode: item.itemCode.trim() || null,
      barcode: item.barcode.trim() || null,
      description: item.description.trim(),
      uom: item.uom.trim() || null,
      qty: Number(item.quantity) || 0,
      lotNo: item.lotNo.trim() || null,
      cost: Number(item.cost) || 0,
      responsibilityCenter: item.responsibilityCenter.trim() || null,
    })),
  };
}
