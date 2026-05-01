import { redirect } from "next/navigation";

export default function UsageRedirect() {
  redirect("/developer?tab=usage");
}
