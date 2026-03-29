# Workplace Compass

## Current State
App.tsx (4161 lines) contains all UI text hardcoded in English. The app has a header, navigation tabs (Get Guidance, Ask Coach, Practice Scenarios, Reframe It, Generate Script, Saved, Journal, Growth Path), and various forms and coaching dialogs. There is no language switching mechanism.

## Requested Changes (Diff)

### Add
- `src/frontend/src/i18n/translations.ts` — Translation strings for all 15 languages covering all major UI labels, button text, placeholders, tab names, disclaimers, error messages, and section headings
- `src/frontend/src/contexts/LanguageContext.tsx` — React context with `language`, `setLanguage`, and `t()` translation function. Persists chosen language to localStorage under `wc_language`.
- Language selector dropdown in the app header (globe icon + language name) visible on both authenticated and unauthenticated views

### Modify
- `App.tsx` — Replace all hardcoded English UI strings with `t('key')` calls from the language context. Wrap the app in `<LanguageProvider>`.

### Remove
- Nothing removed

## Implementation Plan

### Languages to support (15+)
1. English (en) — default
2. Hindi (hi)
3. Telugu (te)
4. Tamil (ta)
5. Kannada (kn)
6. Marathi (mr)
7. Bengali (bn)
8. Odia (or)
9. Spanish (es)
10. French (fr)
11. Arabic (ar) — RTL
12. Mandarin Chinese (zh)
13. Portuguese (pt)
14. Russian (ru)
15. Japanese (ja)
16. German (de)
17. Indonesian (id)

### Translation keys to cover
- All tab names and navigation labels
- All button text (Get Guidance, Ask Coach, Save Profile, Export, etc.)
- All section headings and subheadings
- All placeholder text in inputs/textareas
- Common status messages (Loading..., Something went wrong, etc.)
- Legal disclaimer text
- Landing page headline, subline, feature cards
- Profile form labels (Name, Role, Experience, Industry)
- Growth Path section labels
- Coaching response labels (Try This Today, Micro-actions, etc.)

### Technical approach
- Keep translations.ts as a plain object map: `{ [langCode]: { [key]: string } }`
- `t(key)` falls back to English if key missing in selected language
- Language selector: a `<Select>` dropdown in the header showing flag emoji + language name
- For Arabic (RTL), add `dir="rtl"` to the html element when Arabic is selected
- All existing functionality remains unchanged; this is a UI text layer only