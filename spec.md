# Workplace Compass

## Current State
The app has matrix navigation, deep coaching guidance, personalized responses (role/experience/industry), and free-text AI chat. Every coaching response returns an array of text insights displayed in a scrollable dialog.

## Requested Changes (Diff)

### Add
- Micro-actions section at the end of every coaching response (both matrix guidance and free chat)
- Each response ends with 2-3 short, concrete "Try this today" actions
- Micro-actions are visually distinct from insights (checklist/action card style with highlighted background)
- Backend: getMicroActions helper returning 2-3 micro-actions tailored to the scenario
- Return type extended to include microActions field

### Modify
- submitScenario return type: change from [Text] to record { insights: [Text]; microActions: [Text] }
- submitFreeChat return type: same change
- Frontend: CoachPerspective dialog and chat response area updated to render micro-actions as a separate 'Try This Today' block below insights
- History/saved scenarios store both insights and microActions

### Remove
- Nothing removed

## Implementation Plan
1. Backend: Define GuidanceResult record type
2. Backend: Add getMicroActions helper with category/keyword-aware micro-actions
3. Backend: Update submitScenario and submitFreeChat to return GuidanceResult
4. Backend: Update Scenario type to store microActions
5. Frontend: Update all backend call sites to handle new return type
6. Frontend: Add MicroActions UI component with green accent
7. Frontend: Render micro-actions in coach dialog and chat response
