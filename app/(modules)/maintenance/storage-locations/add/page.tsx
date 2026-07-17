import type { Metadata } from "next";
import { StorageLocationFormPage } from "@/app/src/ui/modules/maintenance/storage-locations/StorageLocationFormPage";

const PageTitle = "Add Storage Location";

export const metadata: Metadata = {
	title: PageTitle,
};

export default function AddStorageLocationPage() {
	return <StorageLocationFormPage />;
}
