import { LiveSessionGuide } from "@/components/help/LiveSessionGuide";

export default function StudentLiveSessionsGuide() {
  return <LiveSessionGuide audience="student" intro="Find a free live session, reserve your place, and join your tutor in Microsoft Teams." steps={[
    { title: "Find a session", text: "Sign in to UniHub and select Live Sessions from your student navigation. Browse all sessions or use the Upcoming, Free, and Recordings filters. Check the title, tutor, date, and time before choosing a session." },
    { title: "Enrol and find your place", text: "Select Enrol on a scheduled session. Wait for the Enrolled confirmation, then select My sessions to see the sessions you have reserved. If you opened a tutor's referral invitation, sign in or create an account and follow the enrolment prompt." },
    { title: "Join the live session", text: "When the tutor starts the session, select Join session from Live Sessions or My sessions. UniHub opens Microsoft Teams. Follow the Teams prompts to enter the meeting; if you leave accidentally, return to UniHub and join again while the session is live." },
    { title: "Optionally link your Microsoft account", text: "UniHub may offer a Teams invitation to the email in your profile, or let you choose a different Teams email. Accept the invitation using that Microsoft account to help the tutor identify your attendance. You can enrol and join without linking it." },
    { title: "Watch an available recording", text: "After the session ends, look for Watch recording on the session card or use the Recordings filter. Recordings are available only when enabled and successfully imported, which can take time." },
  ]} questions={[
    { question: "Why can't I see Join session?", answer: "Make sure you are signed in and enrolled. The Join session button appears when the tutor has started the approved session and Teams is ready. Refresh the page and check My sessions." },
    { question: "Do I need to accept a Teams invitation?", answer: "You can enrol and join without accepting it. Linking the Microsoft account you use in Teams helps your attendance appear against your name. Check your email and spam folder, or use a different Teams email if offered." },
    { question: "Why isn't a recording available?", answer: "The tutor must allow recording and the recording must be successfully imported after the session ends. It can take time, and some sessions may not have a recording." },
  ]} />;
}
