import type { Metadata } from "next";
import { StorageLocationFormPage } from "@/app/src/ui/modules/maintenance/storage-locations/StorageLocationFormPage";

const PageTitle = "Edit Storage Location";

export const metadata: Metadata = {
	title: PageTitle,
};

export default function EditStorageLocationPage() {
	return <StorageLocationFormPage />;
}
