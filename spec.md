# Workplace Compass

## Current State
The app has a Motoko backend with `getCallerUserProfile` and `saveCallerUserProfile` endpoints that store a `UserProfile { name: Text }` per user. The frontend header shows the truncated principal ID in the user dropdown. There is no UI to set or display a profile name.

## Requested Changes (Diff)

### Add
- A query hook `useGetCallerUserProfile` that fetches the user's saved profile name on login.
- A mutation hook `useSaveCallerUserProfile` for saving the profile name.
- A "Set your name" inline prompt or small dialog that appears when the user is authenticated but has no name set yet.
- Header greeting: show "Hi, [Name]" if name is set, otherwise show a subtle prompt to set a name.

### Modify
- Header user button: replace truncated principal ID with the user's name (or a fallback "Set name" link if no name).
- User dropdown: add a "Edit Name" option above Sign Out.

### Remove
- Nothing removed.

## Implementation Plan
1. Add `useGetCallerUserProfile` and `useSaveCallerUserProfile` hooks in `useQueries.ts`.
2. Update `MainApp` to fetch profile after login and pass name down.
3. Update header user button to show name or "Set name" prompt.
4. Add a small inline Dialog for entering/editing the display name, triggered from the header dropdown.
