import {
  purchaseRequestControllerCreateV1,
  purchaseRequestControllerFindAllV1,
  purchaseRequestControllerUpdateV1,
} from "@/app/src/generated/api/purchase-request/purchase-request";
import type {
  CreatePurchaseRequestDto,
  PurchaseRequestContainerResponseDto,
  PurchaseRequestResponseDto,
} from "@/app/src/generated/api/gR8BooksNeoAPI.schemas";
import {
  createPurchaseRequestFormValues,
  createPurchaseRequestRecord,
} from "@/app/src/data/modules/purchasing/purchase-request/PurchaseRequestData";
import type {
  PurchaseRequestFormValues,
  PurchaseRequestRecord,
  PurchaseRequestStatus,
} from "@/app/src/types/modules/purchasing/purchase-request/PurchaseRequestTypes";

export async function fetchPurchaseRequests(): Promise<PurchaseRequestRecord[]> {
  const response = await purchaseRequestControllerFindAllV1({ page: 1, limit: 100 });

  return response.purchaseRequests.map(mapPurchaseRequestResponse);
}

export function mapPurchaseRequestResponse(response: PurchaseRequestResponseDto): PurchaseRequestRecord {
  const defaults = createPurchaseRequestFormValues();

  return createPurchaseRequestRecord(
    {
      ...defaults,
      vceCode: response.partyCode,
      vceName: response.partyName,
      purchaseType: response.purchaseType,
      transNo: response.transNo,
      prDate: response.prDate.slice(0, 10),
      status: mapPurchaseRequestStatus(response.status),
      currency: response.currency,
      exchangeRate: response.exchangeRate,
      bomNo: response.bomNo ?? "",
      projectCode: response.projectCode ?? "",
      projectName: response.projectName ?? "",
      vendorAddress: response.vendorAddress ?? "",
      remarks: response.remarks ?? "",
      forDepartment: response.forDepartment ?? "",
      items: response.items.map((item) => ({
        id: item.id,
        itemId: item.itemId ?? "",
        serviceMaintenanceId: item.serviceMaintenanceId ?? "",
        itemCode: item.itemCode ?? "",
        barcode: item.barcode ?? "",
        description: item.description,
        uom: item.uom ?? "",
        quantity: item.qty,
        lotNo: item.lotNo ?? "",
        expiryDate: "",
        cost: item.cost,
        responsibilityCenter: item.responsibilityCenter ?? "",
      })),
    },
    response.id,
  );
}

export async function createPurchaseRequest(
  values: PurchaseRequestFormValues,
  branchUnitId?: number | null,
): Promise<PurchaseRequestContainerResponseDto> {
  return purchaseRequestControllerCreateV1(toPurchaseRequestPayload(values, branchUnitId));
}

function mapPurchaseRequestStatus(status: PurchaseRequestResponseDto["status"]): PurchaseRequestStatus {
  const statuses: Record<PurchaseRequestResponseDto["status"], PurchaseRequestStatus> = {
    DRAFT: "Draft",
    FOR_APPROVAL: "For Approval",
    POSTED: "Posted",
    DISAPPROVED: "Disapproved",
    CANCELLED: "Cancelled",
  };

  return statuses[status];
}

export async function updatePurchaseRequest(
  id: string,
  values: PurchaseRequestFormValues,
  branchUnitId?: number | null,
): Promise<PurchaseRequestContainerResponseDto> {
  return purchaseRequestControllerUpdateV1(id, toPurchaseRequestPayload(values, branchUnitId));
}

function toPurchaseRequestPayload(values: PurchaseRequestFormValues, branchUnitId?: number | null): CreatePurchaseRequestDto {
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
