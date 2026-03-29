# Workplace Compass — Strength Spotter

## Current State
The app stores chat history (`wc_chat_history`) and scenario history (`wc_scenario_history`) in localStorage. Each ChatEntry has `question` and `answer[]`. Each Scenario has `text` and `suggestions[]`. The Growth Path section already reads these for stats/badges. There is no feature that surfaces recurring strengths from session content.

## Requested Changes (Diff)

### Add
- `StrengthSpotter` component: analyzes all stored chat + scenario text locally (no backend call) to detect recurring strength themes across sessions
- Strength detection logic: keyword/theme matching across 10+ strength categories (Communication, Resilience, Leadership, Empathy, Problem-Solving, Adaptability, Collaboration, Initiative, Emotional Intelligence, Strategic Thinking)
- Each detected strength shows: strength name, frequency/evidence count, a short motivational description, and 1-2 example snippets from actual user sessions
- Minimum threshold: show Strength Spotter results only after 3+ sessions (chat + scenario combined); below threshold show a friendly "keep going" message
- "Your Top Strengths" card in the Growth Path section (after existing stats)
- Standalone "Strengths" tab in main navigation for full detail view
- Strengths persist as a computed view (re-derived from localStorage on each open, no extra storage)

### Modify
- Growth Path section: add a "Your Emerging Strengths" preview card (top 3 strengths) linking to the full Strengths tab
- Main tab navigation: add "Strengths" tab with a Sparkles icon

### Remove
- Nothing removed

## Implementation Plan
1. Create strength categories with keyword sets for matching against user-written questions + scenario text
2. Build `detectStrengths(sessions)` pure function: scores each category by keyword hits across all user input text, returns ranked list with evidence snippets
3. Build `StrengthSpotterTab` component: full view with strength cards (name, icon, score bar, description, evidence snippets)
4. Add "Emerging Strengths" preview in GrowthPathSection (top 3, compact)
5. Wire Strengths tab into main navigation alongside existing tabs
6. Show "keep coaching — results appear after 3+ sessions" placeholder when below threshold
