# Workplace Compass – V34 Feature Batch

## Current State
The app is a privacy-first AI workplace coaching platform (6300-line App.tsx). All data is stored in localStorage. The app has:
- AuthenticatedApp with mode switching (matrix, practice, reframe, script, coach)
- History section with tabs: scenarios, chats, saved, journal, wins, strengths, peer-stories, my-scenarios
- GrowthPathSection component for progress tracking
- Confidence Tracker, Weekly Wins Journal, 90-Day Goals, Strength Spotter, Peer Stories, Custom Scenarios
- UnauthenticatedView landing page with matrix demo, stats strip, before/after comparison
- localStorage keys: wc_90day_goal, wc_confidence_log, wc_weekly_wins, wc_peer_stories, wc_custom_scenarios, wc_voice_pref, wc_language_pref

## Requested Changes (Diff)

### Add
1. **Streak Counter** – Track consecutive days of app engagement
   - localStorage key: `wc_streak` = `{ lastVisit: ISO string, count: number }`
   - On each authenticated app load, check if lastVisit was yesterday → increment; same day → no change; older → reset to 1
   - Show streak badge in the header next to the user menu: 🔥 N days
   - Also show streak in GrowthPathSection dashboard

2. **Session Summary** – After any coaching response (matrix, ask coach, reframe, script), show a "Session Summary" panel
   - Appears at bottom of coaching response, collapsible
   - Auto-generates 3 takeaways from the response text (first sentence of key paragraphs, or a simple summarize via extracting bullet points)
   - Shows: date, coaching type, topic summary, key takeaways (3 bullets), micro-actions if present
   - "Save Summary" button stores it to localStorage: `wc_session_summaries` array
   - New tab "Summary" in the history tabs section showing saved summaries

3. **Follow-up Questions** – After a coaching session, schedule a follow-up prompt
   - When user gets coaching, store `wc_followup_pending` = `{ question: string, dueDate: ISO (24h later), sessionTopic: string }`
   - On next app visit after 24h, show a banner at top of AuthenticatedApp: "How did it go? [topic] – [Click to reflect]"
   - Clicking opens a dialog where user can write a brief reflection (textarea)
   - Reflection is stored in `wc_reflections` array in localStorage
   - Coach responds with an encouraging follow-up message based on the reflection
   - Once addressed, clear the pending follow-up

4. **Methodology Section** – Add a "How Our Coaching Works" section to the landing page (UnauthenticatedView)
   - Insert after the stats strip and before the Before/After comparison
   - 4-step process cards: (1) Share Your Challenge → (2) Get Tailored Coaching → (3) Take Micro-Actions → (4) Track Your Growth
   - Each card: icon, step number, title, 1-sentence description
   - Based on established coaching frameworks (CBT, strengths-based, solution-focused)
   - Brief note: "Our AI coach draws on Cognitive Behavioural Coaching, Appreciative Inquiry, and Solution-Focused techniques"

5. **Onboarding / First-Run Tour** – Guided walkthrough for first-time authenticated users
   - localStorage key: `wc_onboarding_done` = boolean
   - Trigger: authenticated user, profile loaded, `wc_onboarding_done` not set
   - Multi-step modal/overlay (4 steps, dismissable at any point):
     - Step 1: Welcome – "Welcome to Workplace Compass" + brief value prop, show app modes
     - Step 2: Set Your Profile – encourage setting name, role, industry for personalized coaching; "Set Up Profile" button
     - Step 3: Try the Matrix – explain the WHO × WHAT navigation; highlight the matrix mode
     - Step 4: Ask Your Coach – encourage first Ask Coach question; show sample questions
   - Progress dots at bottom, Next/Back/Skip buttons
   - On complete or skip, set `wc_onboarding_done = true`

### Modify
- `AuthenticatedApp`: Add streak tracking on mount, follow-up banner logic, onboarding tour trigger
- History tabs: Add "Summaries" tab showing saved session summaries
- Header: Show streak badge (🔥 N days) when streak ≥ 2
- After coaching responses (matrix result dialog, ask coach response, reframe result, script result): Add collapsible session summary panel
- `GrowthPathSection`: Add streak display card

### Remove
- Nothing removed

## Implementation Plan
1. Add streak tracking hook/logic at top of AuthenticatedApp, update header to show streak badge
2. Create `OnboardingTour` component – multi-step modal, stored state in localStorage
3. Create `SessionSummary` component – collapsible summary panel with save functionality
4. Add follow-up banner logic in AuthenticatedApp – check `wc_followup_pending` on mount
5. Add follow-up dialog component for reflection input + encouraging coach reply
6. Add "Summary" tab to history section, render saved summaries from `wc_session_summaries`
7. Add Methodology section in UnauthenticatedView after stats strip
8. Wire session summary panel after each coaching response type (matrix, chat, reframe, script)
9. Wire follow-up pending storage after each coaching response
10. Update GrowthPathSection to show streak
