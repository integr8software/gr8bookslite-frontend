import {
  purchaseOrderControllerCreateV1,
  purchaseOrderControllerFindAllV1,
  purchaseOrderControllerRemoveV1,
  purchaseOrderControllerUpdateV1,
} from "@/app/src/generated/api/purchase-order/purchase-order";
import type { CreatePurchaseOrderDto, PurchaseOrderResponseDto } from "@/app/src/generated/api/gR8BooksNeoAPI.schemas";
import {
  createPurchaseOrderFormValues,
  createPurchaseOrderRecord,
} from "@/app/src/data/modules/purchasing/purchase-order/PurchaseOrderData";
import type {
  PurchaseOrderFormValues,
  PurchaseOrderRecord,
  PurchaseOrderStatus,
} from "@/app/src/types/modules/purchasing/purchase-order/PurchaseOrderTypes";

export async function fetchPurchaseOrders(): Promise<PurchaseOrderRecord[]> {
  const response = await purchaseOrderControllerFindAllV1({ page: 1, limit: 100 });
  return response.purchaseOrders.map(mapPurchaseOrderResponse);
}

export async function createPurchaseOrder(values: PurchaseOrderFormValues, branchUnitId?: number | null) {
  return purchaseOrderControllerCreateV1(toPayload(values, branchUnitId));
}

export async function updatePurchaseOrder(id: string, values: PurchaseOrderFormValues, branchUnitId?: number | null) {
  return purchaseOrderControllerUpdateV1(id, toPayload(values, branchUnitId));
}

export async function deletePurchaseOrder(id: string) {
  return purchaseOrderControllerRemoveV1(id);
}

export function mapPurchaseOrderResponse(response: PurchaseOrderResponseDto): PurchaseOrderRecord {
  const defaults = createPurchaseOrderFormValues();
  return createPurchaseOrderRecord(
    {
    ...defaults,
    purchaseRequestId: response.purchaseRequestId ?? "",
    copyFromSource: response.items.some((item) => Boolean(item.canvassNo))
      ? "Canvass"
      : response.purchaseRequestId || response.items.some((item) => Boolean(item.prNo))
        ? "Purchase Request"
        : "",
      vceCode: response.partyCode,
      vceName: response.partyName,
      purchaseType: response.purchaseType,
      transNo: response.transNo,
      documentDate: response.poDate.slice(0, 10),
      deliveryDate: response.dateNeeded?.slice(0, 10) ?? "",
      prNo: response.prNo ?? "",
      status: mapStatus(response.status),
      currency: response.currency,
      exchangeRate: response.exchangeRate,
      address: response.address ?? "",
      emailAddress: response.emailAddress ?? "",
      contactNo: response.contactNo ?? "",
      projectCode: response.projectCode ?? "",
      projectName: response.projectName ?? "",
      termsOfPayment: response.termsOfPayment ?? "",
      remarks: response.remarks ?? "",
      items: response.items.map((item) => ({
        ...defaults.items[0],
        id: item.id,
        purchaseRequestEntryId: item.purchaseRequestEntryId ?? "",
        responsibilityCenterId: item.responsibilityCenterId ?? "",
        serviceMaintenanceId: item.serviceMaintenanceId ?? "",
        itemId: item.itemId ?? "",
        itemCode: item.itemCode ?? "",
        barcode: item.barcode ?? "",
        itemName: item.description,
        color: item.color ?? "",
        brand: item.brand ?? "",
        size: item.size ?? "",
        model: item.model ?? "",
        uom: item.uom ?? "",
        lotNo: item.lotNo ?? "",
        prQuantity: item.prQty,
        quantity: item.poQty,
        cost: item.price,
        discountRate: item.discountRate,
        discountAmount: item.discountAmount,
        vatAmount: item.vatAmount,
        vatable: item.vatable ? "True" : "False",
        vatInclusive: item.vatInclusive ? "True" : "False",
        linePrNo: item.prNo ?? "",
        canvassNo: item.canvassNo ?? "",
        responsibilityCenter: item.responsibilityCenter ?? "",
      })),
    },
    response.id,
  );
}

function toPayload(values: PurchaseOrderFormValues, branchUnitId?: number | null): CreatePurchaseOrderDto {
  return {
    branchUnitId: branchUnitId ?? undefined,
    purchaseRequestId: values.purchaseRequestId || null,
    transNo: values.transNo.trim(),
    poDate: values.documentDate,
    dateNeeded: values.deliveryDate || null,
    partyCode: values.vceCode.trim(),
    purchaseType: values.purchaseType,
    address: values.address || null,
    emailAddress: values.emailAddress || null,
    contactNo: values.contactNo || null,
    projectCode: values.projectCode || null,
    projectName: values.projectName || null,
    termsOfPayment: values.termsOfPayment || null,
    prNo: values.prNo || null,
    currency: values.currency,
    exchangeRate: Number(values.exchangeRate) || 1,
    remarks: values.remarks || null,
    items: values.items.map((item) => ({
      purchaseRequestEntryId: item.purchaseRequestEntryId || null,
      responsibilityCenterId: item.responsibilityCenterId || null,
      serviceMaintenanceId: item.serviceMaintenanceId || null,
      itemId: item.itemId || null,
      itemCode: item.itemCode || null,
      barcode: item.barcode || null,
      description: item.itemName.trim(),
      color: item.color || null,
      brand: item.brand || null,
      size: item.size || null,
      model: item.model || null,
      uom: item.uom || null,
      lotNo: item.lotNo || null,
      prQty: Number(item.prQuantity) || 0,
      poQty: Number(item.quantity) || 0,
      price: Number(item.cost) || 0,
      discountRate: Number(item.discountRate) || 0,
      discountAmount: Number(item.discountAmount) || 0,
      vatAmount: Number(item.vatAmount) || 0,
      vatable: item.vatable === "True",
      vatInclusive: item.vatInclusive === "True",
      prNo: item.linePrNo || null,
      canvassNo: item.canvassNo || null,
      responsibilityCenter: item.responsibilityCenter || null,
    })),
  };
}

function mapStatus(status: PurchaseOrderResponseDto["status"]): PurchaseOrderStatus {
  return ({ DRAFT: "Draft", FOR_APPROVAL: "For Approval", POSTED: "Posted", DISAPPROVED: "Disapproved", CANCELLED: "Cancelled" } as const)[
    status
  ];
}
