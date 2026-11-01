import { LiveSessionGuide } from "@/components/help/LiveSessionGuide";

export default function TutorLiveSessionsGuide() {
  return <LiveSessionGuide audience="tutor" intro="Request a Teams session, invite students, and manage the session from your tutor dashboard." steps={[
    { title: "Request a session", text: "Open Live Sessions in your tutor navigation and choose Request session. Enter the title, description, your Microsoft Teams email, and start and end times in Sri Lanka time. Set attendee and recording options, then submit for approval. Allow the displayed buffer between sessions." },
    { title: "Accept your Teams invitation and wait for approval", text: "Open the Microsoft invitation sent to your Teams email and accept it using that account. Check My live sessions for your Microsoft identity and approval status. An administrator must approve the request and Teams must be ready before you can start." },
    { title: "Invite students", text: "On a scheduled session, select Copy referral invite. Share the message containing the session details and registration link. If your browser blocks copying, use the share options or select the displayed text to copy it manually." },
    { title: "Start and rejoin", text: "When the session is approved and the provider is ready, select Start in Teams. If you accidentally leave Teams, return to My live sessions and choose Rejoin Teams while the session is live. Leaving Teams does not itself end the UniHub session." },
    { title: "Manage the session and enrolments", text: "Use Enrollments to review students and attendance. Before starting a scheduled session, use Reschedule to change its time or Cancel to cancel it. Students will no longer be able to join a cancelled session." },
    { title: "End and manage the recording", text: "When you finish, select End and confirm End session. Keep session closes the confirmation and leaves the session running. UniHub then imports available attendance and recordings. When a recording is ready, use Manage recording to edit its details or add it to one of your courses." },
  ]} questions={[
    { question: "Why is my request still pending?", answer: "Accept the Microsoft invitation at your Teams email first, then wait for administrator approval. If approval remains pending, contact support with the session title." },
    { question: "Why can't I start or rejoin?", answer: "Start in Teams appears when the session is approved and Teams is ready. Rejoin Teams appears while the session is live. Refresh My live sessions to check its latest status and contact support if the link is unavailable." },
    { question: "Where is the recording?", answer: "Recording must have been enabled and successfully imported after the session ends. Processing can take time. If it is still unavailable, contact support with the session details." },
  ]} />;
}
