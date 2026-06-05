import type { MetadataRoute } from "next";
import { AppManifest } from "@/app/src/constants/shared/app/AppManifest";

export default function manifest(): MetadataRoute.Manifest {
	return AppManifest;
}
