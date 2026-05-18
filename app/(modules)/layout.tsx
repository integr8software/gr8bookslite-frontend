import type { ReactNode } from "react";
import { MainLayout } from "@/app/src/ui/shared/MainLayout/MainLayout";

export default function ModulesLayout({ children }: { children: ReactNode }) {
	return <MainLayout>{children}</MainLayout>;
}
