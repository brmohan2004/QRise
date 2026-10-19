import { redirect } from "next/navigation";

export default function SettingsPage() {
  // Redirect root /settings directly to /settings/billing or modal
  redirect("/settings/billing");
}
