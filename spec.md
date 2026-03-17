# Office Navigator

## Current State
New project, no existing code.

## Requested Changes (Diff)

### Add
- A landing/home page with a hero section explaining the tool
- A problem input form where users describe their office scenario or problem statement
- A suggestion engine (rule/pattern-based on the backend) that categorizes scenarios and returns structured navigation advice
- A results view displaying actionable suggestions, tips, and recommended next steps
- A history of recent submissions (stored in backend) so users can revisit past scenarios
- Category tagging (e.g. conflict resolution, communication, escalation, workload, feedback)

### Modify
N/A

### Remove
N/A

## Implementation Plan
1. Backend: Store submitted scenarios with category + suggestions. Implement a pattern-matching suggestion engine in Motoko that maps keywords/themes to office navigation advice.
2. Frontend: Landing page with hero, problem input textarea, category selector (optional), submit button, results panel with suggestions list, history sidebar or section.
