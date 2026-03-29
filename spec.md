# Workplace Compass

## Current State
The app has 4 completed activities: free-text AI chat, role/experience/industry personalization, micro-actions ("Try this today"), and helpfulness feedback loop. The backend stores user scenarios (via `getRecentSubmissions`) and chat history (via `getRecentChats`). The frontend has tabs for Navigate, Ask Coach, and History. There is no growth/progress tracking tab.

## Requested Changes (Diff)

### Add
- New "Growth Path" tab in the main navigation
- Growth Path dashboard showing:
  - Summary stats: total scenarios explored, total questions asked, categories covered (WHO + WHAT combinations)
  - Milestone badges earned based on usage (e.g. "First Step", "Explorer", "Coach's Favourite", "Deep Thinker")
  - Timeline/journey view: chronological list of all interactions (scenarios + chats) showing progression over time
  - Category coverage map: visual grid showing which of the 9 matrix cells the user has explored
  - Streak / consistency indicator (days with activity)

### Modify
- Tab list to include the new "Growth Path" tab (4th tab)

### Remove
- Nothing removed

## Implementation Plan
1. Compute growth stats in the frontend from existing `getRecentSubmissions` and `getRecentChats` data (no backend changes needed)
2. Build `GrowthPathTab` component with:
   - Stats cards (scenarios explored, questions asked, matrix cells covered)
   - Badge/milestone system computed from stats
   - 3x3 matrix coverage grid (9 cells, highlighted if explored)
   - Timeline of recent activity (last 10 items, merged scenarios + chats)
3. Add "Growth Path" to the Tabs component
