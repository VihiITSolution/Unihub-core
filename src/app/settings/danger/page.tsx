import { redirect } from "next/navigation";

export default function DangerSettingsRedirect() {
  redirect("/student/dashboard?section=settings&setting=danger");
}
