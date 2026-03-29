# Workplace Compass — Version 18

## Current State
- Full AI coaching app with matrix navigation, free-text chat, practice scenarios
- Personalization (role/experience/industry), micro-actions, feedback loop, progress tracking
- Bookmarks, reflection journal, export as coaching card
- Emotional tone detection (auto, not user-chosen)
- No user-facing tone/coaching style selector
- No audio/text-to-speech feature
- No Reframe Engine, Communication Script Generator
- Safety guardrails not explicitly enforced in prompts

## Requested Changes (Diff)

### Add
1. **Audio Readout** — A speaker icon button on every coaching response dialog. Clicking plays the response using the Web Speech API (speechSynthesis). A small voice selector (Male / Female) appears inline. Stop button while playing. Preference saved to localStorage.
2. **Tone Selector** — Before submitting any coaching request (matrix, chat, practice), user can choose coaching style: Mentor / Strategist / Motivator / Straight-Talker. Selected tone is prepended to the prompt and also affects the framing prefix in responses.
3. **Reframe Engine** — A new tab or panel "Reframe It" where the user pastes a negative workplace situation and gets a positively-reframed version as a growth opportunity. Uses submitFreeChat with a reframing prompt prefix.
4. **Communication Script Generator** — A new tab "Script Builder" where user selects a scenario type (difficult feedback, conflict resolution, salary negotiation, asking for promotion, declining extra work) and provides context, then gets a word-for-word script/email template.
5. **Safety Guardrails** — All prompts going to the backend must include a safety prefix ensuring responses are forward-looking, positive, strengths-based, and never suggest harmful actions. This is enforced on the frontend prompt construction.

### Modify
- Mode selector: add Reframe and Script tabs to the navigation (or integrate as sub-tabs under Ask Coach)
- All coaching response dialogs: add audio playback controls
- submitFreeChat calls: prepend tone selector context

### Remove
- Nothing removed

## Implementation Plan
1. Add `voicePreference` state (male/female) to localStorage
2. Create `useAudioPlayback` hook wrapping Web Speech API — loads voices, filters by gender keyword in voice name, exposes play/stop/isPlaying
3. Add `AudioPlaybackBar` component: speaker icon, male/female toggle, play/stop button — reusable across all 3 response dialogs
4. Add `ToneSelectorBar` component: 4-button toggle (Mentor/Strategist/Motivator/Straight-Talker) shown above the submit button in matrix, chat, and practice modes
5. Modify all `submitFreeChat` prompt construction to prepend the chosen tone instruction
6. Add `ReframeTab` component: textarea + submit + response display using submitFreeChat with reframe prefix; add to mode tabs
7. Add `ScriptBuilderTab` component: scenario type dropdown + context textarea + submit + response display; add to mode tabs
8. Add safety prefix to ALL coaching prompt construction functions
9. Validate and deploy
