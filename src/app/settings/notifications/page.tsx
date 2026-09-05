import { redirect } from "next/navigation";

export default function NotificationSettingsRedirect() {
  redirect("/student/dashboard?section=settings&setting=notifications");
}
