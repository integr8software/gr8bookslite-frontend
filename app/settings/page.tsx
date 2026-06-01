import { redirect } from "next/navigation";
import { SettingsHref } from "@/app/src/constants/shared/account/AccountConstants";

export default function Page() {
  redirect(SettingsHref);
}
