# Workplace Compass

## Current State

Full-featured AI Workplace Coach with:
- AppMode: `matrix | chat | practice | reframe | scripts`
- SetProfileDialog: name, role, experienceLevel, industry
- Voice preference (male/female) stored in `wc_voice_pref` localStorage key in AudioPlaybackBar component (local to each response, not in profile dialog)
- Language selector (LanguageSelector component, separate from profile)
- GrowthPathSection: stats, badges, timeline
- All data in localStorage

## Requested Changes (Diff)

### Add
1. **AI Coach Voice & Language in User Profile** -- Add voice preference (male/female) and preferred language selectors to the SetProfileDialog. On save, sync them to localStorage (`wc_voice_pref`, `wc_language_pref`). This centralises management so users don't need to change voice per response.
2. **90-Day Goal Tracker** -- New mode `goals` added to AppMode. User sets a 90-day career goal (text) with target date. Stored in localStorage (`wc_90day_goal`). Current goal displayed as a banner on matrix/chat screens. Sessions optionally tagged to the goal. Simple progress notes (user can add text milestones).
3. **Confidence Tracker** -- Before showing coaching results (in matrix mode), show a quick 1-10 confidence slider ("Rate your confidence before coaching"). After reading the response, prompt rating again. Store pairs with date in localStorage (`wc_confidence_log`). A chart in GrowthPath section shows confidence trend over time.
4. **Weekly Wins Journal** -- New tab in the history/saved area ("Wins" tab). User logs weekly wins with a title and optional note. A banner shows every Friday nudging the user to log. Stored in `wc_weekly_wins`. The coach will reference past wins when they exist.

### Modify
- `SetProfileDialog`: add voice preference radio (male/female) and preferred language select
- `AppMode` type: add `goals`
- `GrowthPathSection`: add confidence chart (using recharts/chart.tsx)
- History tabs: add "Wins" tab
- `AudioPlaybackBar`: read voice pref from localStorage on mount so it syncs with profile setting

### Remove
- Nothing removed

## Implementation Plan

1. Add voice + language fields to SetProfileDialog; on save write to localStorage
2. Create `GoalTrackerMode` component: set/edit 90-day goal, milestone notes, goal banner
3. Create `ConfidenceTracker` -- pre/post slider modal, store log, add confidence chart to GrowthPath
4. Add `WeeklyWinsTab` inside the history tabs, Friday nudge banner
5. Wire new mode button "Goals" into navigation bar
6. Validate and build
