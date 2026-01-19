# Live Session Feature - Frontend Implementation

## Overview
Complete frontend implementation for UniHub's YouTube Live streaming feature, allowing tutors to schedule and manage live sessions while students can browse, enroll, and watch.

## Components Created

### Services & Types

#### 1. Type Definitions (`src/types/index.ts`)
Added comprehensive TypeScript interfaces:
- `LiveSession` - Main session data structure
- `SessionEnrollment` - Student enrollment data
- `CreateLiveSessionData` - Form data for creating sessions
- `LiveSessionFilters` - Query parameters for filtering
- `LiveSessionStatus` - Session states (scheduled, live, ended, etc.)
- `PaymentStatus` - Payment tracking states

#### 2. Live Session Service (`src/services/live-session.service.ts`)
API client for all live session operations:
- `getSessions()` - Browse sessions with filters
- `getSessionById()` - Get session details
- `createSession()` - Create new session (tutor)
- `updateSession()` - Update session details (tutor)
- `cancelSession()` - Cancel session (tutor)
- `startSession()` - Start live broadcast (tutor)
- `endSession()` - End live broadcast (tutor)
- `enrollInSession()` - Enroll in session (student)
- `getMyEnrollments()` - Get student's enrollments
- `joinSession()` - Join live session (student)
- `leaveSession()` - Leave session (student)
- `getSessionEnrollments()` - View enrollments (tutor)
- `inviteStudents()` - Invite students (tutor)

### Tutor Pages

#### 1. Live Sessions Dashboard (`/tutor/live-sessions/page.tsx`)
**Features:**
- View all tutor's live sessions
- Filter by status (all, upcoming, live, ended)
- Session cards showing:
  - Title, description, date/time
  - Price and revenue stats
  - Total attendees
  - Status badge (animated for live sessions)
- Quick actions:
  - Start Session (scheduled → live)
  - End Session (live → ended)
  - Edit Session
  - Cancel Session
  - View Enrollments
  - Watch Stream (when live)
  - View Recording (when available)

**Route:** `/tutor/live-sessions`

#### 2. Create Live Session (`/tutor/live-sessions/create/page.tsx`)
**Features:**
- Comprehensive session creation form:
  - Basic info (title, description)
  - Schedule (start/end time)
  - Pricing (free or paid with amount)
  - Settings (max attendees, privacy, recording, chat)
  - Tags for categorization
- Form validation
- Success screen showing:
  - Stream URL and Stream Key for OBS/Streamlabs
  - Watch URL
  - Next steps instructions
- Auto-redirect to dashboard after 5 seconds

**Route:** `/tutor/live-sessions/create`

#### 3. Session Enrollments (`/tutor/live-sessions/[id]/enrollments/page.tsx`)
**Features:**
- Stats overview:
  - Total enrolled
  - Attended count
  - Payment completed count
  - Total revenue
- Enrollments table with:
  - Student name and email
  - Payment amount and status
  - Join time and attendance duration
  - Current status (Active, Left, Not joined)
- Sortable and filterable data

**Route:** `/tutor/live-sessions/:id/enrollments`

### Student Pages

#### 1. Browse Live Sessions (`/student/live-sessions/page.tsx`)
**Features:**
- Grid view of available sessions
- Filter options:
  - All sessions
  - Upcoming only
  - Free sessions only
  - Paid sessions only
- Session cards showing:
  - Title, description
  - Tutor information
  - Date/time
  - Price (free or amount)
  - Current attendees
  - Status badge
  - Tags
- Action buttons based on status:
  - "Enroll" for scheduled sessions
  - "Join Live Now" for active sessions
  - "Watch Recording" for ended sessions

**Route:** `/student/live-sessions`

#### 2. My Enrolled Sessions (`/student/my-sessions/page.tsx`)
**Features:**
- List of student's enrolled sessions
- Filter: All or Upcoming
- Session cards with:
  - Full session details
  - Payment status
  - Attendance duration (if joined)
  - Tutor information
- Quick actions:
  - Join Now (for live sessions)
  - Wait notification (for scheduled)
  - Watch Recording (for ended)

**Route:** `/student/my-sessions`

#### 3. Watch Live Session (`/student/live-sessions/[id]/watch/page.tsx`)
**Features:**
- Full-screen live session viewer
- Layout:
  - Header with session title and Leave button
  - Main area with YouTube player (75% width)
  - Live chat sidebar (25% width, if enabled)
  - Footer with live indicator and attendee count
- Automatic join on mount
- Automatic leave on unmount/exit
- Privacy-enhanced YouTube embedding (youtube-nocookie.com)
- Recording indicator

**Route:** `/student/live-sessions/:id/watch`

### UI Components

#### YouTubePlayer Component (`src/components/ui/YouTubePlayer.tsx`)
**Features:**
- Reusable YouTube embed component
- Configurable options:
  - Autoplay
  - Controls visibility
  - Modest branding
  - Related videos toggle
- `LiveSessionPlayer` - Full-featured wrapper with:
  - Header/footer UI
  - Chat integration
  - Live indicators
  - Responsive layout

## User Flows

### Tutor Flow: Schedule Live Session

1. **Navigate** to `/tutor/live-sessions`
2. **Click** "Schedule New Session"
3. **Fill form** with session details
4. **Submit** → Backend creates YouTube broadcast
5. **View streaming credentials** (RTMP URL + Stream Key)
6. **Configure OBS/Streamlabs** with credentials
7. **Return to dashboard** → See session in "Scheduled" state
8. **Start streaming** in OBS
9. **Click "Start Session"** → Session goes live
10. Students can now join
11. **Click "End Session"** when finished → Recording saved

### Student Flow: Join Live Session

1. **Navigate** to `/student/live-sessions`
2. **Browse** available sessions (filter by free/paid/upcoming)
3. **Click "Enroll"** on desired session
   - If paid: Payment flow (TODO)
   - If free: Immediate enrollment
4. **Navigate** to `/student/my-sessions`
5. **Wait** for session to start (or click "Join Now" if live)
6. **Watch** full-screen video with optional live chat
7. **Leave** when finished → Attendance tracked

## API Integration

All frontend components use the `liveSessionService` which communicates with backend endpoints:

```typescript
// Base URL from environment
NEXT_PUBLIC_API_URL=http://localhost:3000/api

// Example calls
const sessions = await liveSessionService.getSessions({ upcoming: true }, token);
const response = await liveSessionService.createSession(formData, token);
const joinData = await liveSessionService.joinSession(sessionId, token);
```

## Styling & UX

**Design System:**
- Tailwind CSS for all styling
- Responsive layouts (mobile-first)
- Color scheme:
  - Blue (#2563eb) - Primary actions
  - Green (#16a34a) - Live/active states
  - Red (#dc2626) - Destructive actions
  - Purple (#9333ea) - Recordings
  - Gray - Neutral elements

**Animations:**
- Pulse effect on live indicators
- Smooth transitions on hover
- Loading spinners for async operations

**Accessibility:**
- Semantic HTML
- ARIA labels on interactive elements
- Keyboard navigation support
- High contrast ratios

## Environment Variables

Add to `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

## Next Steps

### Payment Integration
Currently, the enrollment flow for paid sessions shows a placeholder. To implement:
1. Integrate Stripe/PayPal
2. Create payment intent on enroll
3. Redirect to payment page
4. Complete enrollment on success
5. Update payment status in backend

### Features to Add
- [ ] Email notifications for session reminders
- [ ] Calendar integration (add to Google Calendar)
- [ ] Session search and advanced filters
- [ ] Tutor analytics dashboard
- [ ] Student ratings and reviews
- [ ] Session Q&A feature
- [ ] Screen sharing for tutors
- [ ] Breakout rooms for group sessions
- [ ] Automated transcription/captions
- [ ] Download recording after session

### Testing Checklist

**Tutor Tests:**
- [ ] Create free session
- [ ] Create paid session with max attendees
- [ ] Start session and verify YouTube broadcast
- [ ] End session and check recording
- [ ] Cancel scheduled session
- [ ] View enrollment list
- [ ] Filter sessions by status

**Student Tests:**
- [ ] Browse sessions with filters
- [ ] Enroll in free session
- [ ] Enroll in paid session (payment flow)
- [ ] Join live session
- [ ] Use live chat during session
- [ ] Leave session and verify duration tracked
- [ ] View past sessions
- [ ] Watch recording

## File Structure

```
Unihub-core/
├── src/
│   ├── types/
│   │   └── index.ts (+ LiveSession types)
│   ├── services/
│   │   └── live-session.service.ts
│   ├── components/
│   │   └── ui/
│   │       └── YouTubePlayer.tsx
│   └── app/
│       ├── tutor/
│       │   └── live-sessions/
│       │       ├── page.tsx (dashboard)
│       │       ├── create/
│       │       │   └── page.tsx
│       │       └── [id]/
│       │           └── enrollments/
│       │               └── page.tsx
│       └── student/
│           ├── live-sessions/
│           │   ├── page.tsx (browse)
│           │   └── [id]/
│           │       └── watch/
│           │           └── page.tsx
│           └── my-sessions/
│               └── page.tsx
```

## API Endpoints Used

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/live-sessions` | List sessions |
| GET | `/live-sessions/:id` | Get session details |
| POST | `/live-sessions` | Create session |
| PUT | `/live-sessions/:id` | Update session |
| DELETE | `/live-sessions/:id` | Cancel session |
| POST | `/live-sessions/:id/start` | Start broadcast |
| POST | `/live-sessions/:id/end` | End broadcast |
| POST | `/live-sessions/:id/enroll` | Enroll student |
| GET | `/live-sessions/my/enrollments` | My enrollments |
| POST | `/live-sessions/:id/join` | Join session |
| POST | `/live-sessions/:id/leave` | Leave session |
| GET | `/live-sessions/:id/enrollments` | View enrollments |
| POST | `/live-sessions/:id/invite` | Invite students |

## Running the Application

```bash
# Start backend (already running)
cd Unihub-backend
npm start

# Start frontend
cd Unihub-core
npm run dev

# Open browser
http://localhost:3001 (or configured port)
```

## Success Criteria

✅ **Tutors can:**
- Schedule live sessions with pricing
- View streaming credentials (RTMP URL/key)
- Start/end sessions
- View enrollments and revenue
- Track attendance

✅ **Students can:**
- Browse available sessions
- Enroll in free/paid sessions
- Join live sessions
- Watch with live chat
- Access recordings

✅ **Platform benefits:**
- Zero streaming infrastructure costs
- Automatic recording storage
- Privacy-enhanced viewing
- Revenue tracking with commission
- Scalable to unlimited viewers
