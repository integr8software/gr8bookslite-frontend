import { redirect } from "next/navigation";
import { MODULE_ROUTE_MAP } from "@/app/src/data/shared/modules/ModuleCatalogData";

export default function WarehouseStockInquiryPage() {
	redirect(MODULE_ROUTE_MAP.WIA);
}
