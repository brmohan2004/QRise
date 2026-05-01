import { redirect } from "next/navigation";

export default function ApiKeysRedirect() {
  redirect("/developer?tab=api-keys");
}
