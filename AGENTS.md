# AGENTS.md

## Project Scope
- This repository is a MagicMirror² module named `MMM-SchoolLunchMenu`.
- Runtime is split between:
  - browser-side module code (`MMM-SchoolLunchMenu.js`)
  - Node helper code (`node_helper.js`)
  - shared service/client/mapper classes in `src/`
- There is no standalone app entrypoint in this repository.

## Architecture You Must Preserve
- Data flow is notification-driven:
  1. `MMM-SchoolLunchMenu.js` sends `SCHOOL_LUNCH_CONFIG` in `start()`.
  2. `node_helper.js` receives config, initializes service objects once, fetches menu, and schedules recurring fetches.
  3. Helper sends `SCHOOL_LUNCH_DATA` or `SCHOOL_LUNCH_ERROR` back to the module.
- Service boundaries in `src/` are explicit and should stay separated:
  - `HealthProClient`: API URL building and fetch behavior (`src/HealthProClient.js`)
  - `HealthProMenuMapper`: transforms HealthPro payload into render-ready day/section objects (`src/HealthProMenuMapper.js`)
  - `MenuService`: orchestration + in-memory daily cache + fallback-to-cache on fetch errors (`src/MenuService.js`)

## Conventions In This Codebase
- Module style is CommonJS / MagicMirror module pattern (`module.exports`, `Module.register`, `NodeHelper.create`).
- Use existing socket notification names exactly:
  - `SCHOOL_LUNCH_CONFIG`
  - `SCHOOL_LUNCH_DATA`
  - `SCHOOL_LUNCH_ERROR`
- Keep mapper behavior aligned with current HealthPro assumptions:
  - Parse `setting.current_display`
  - Treat `type === "category"` as section headings
  - Treat `type === "recipe"` as menu items
  - Ignore unknown item types
- Preserve cache key semantics in `MenuService.getCacheKey()`:
  - `${organizationId}:${menuId}:${YYYY-MM-DD}`
  - Cache is intentionally daily and in-memory only.

## Workflow Notes
- No `package.json` is present in repo root, so there are no npm scripts to run from this repository.
- No test suite or lint configuration is present in this repository.
- Typical usage is integrating this module into a MagicMirror installation and configuring it in `config/config.js` (see `README.md`).

## Integration and External Dependencies
- External API base URL default is `https://menus.healthepro.com/api` (configurable via `apiBaseUrl`).
- `HealthProClient.fetchMenu()` fetches current month and next month; failed next-month requests are tolerated and ignored.
- The helper fetch loop is `setTimeout`-based (`node_helper.js`) and uses configured `updateInterval`.

## UI and Rendering Constraints
- DOM output is built manually in `MMM-SchoolLunchMenu.js` (`getDom`, `renderDay`, `renderSection`, `renderItem`).
- CSS classes used by JS must stay in sync with `MMM-SchoolLunchMenu.css` (e.g., `lunch-day`, `lunch-section__title`, `lunch-item--indented`).
- Existing states to preserve:
  - loading text before first data load
  - explicit error message rendering
  - empty-state message when no upcoming days exist

## Safe Change Patterns
- For API/data changes: update `src/HealthProClient.js` and/or `src/HealthProMenuMapper.js` first, then keep module rendering contract (`payload.days`, `payload.lastUpdated`) stable.
- For scheduling/cache changes: modify `node_helper.js` and `src/MenuService.js` together; preserve fallback behavior where cached data is served on fetch failure.
- For display option changes: thread config from `defaults` in `MMM-SchoolLunchMenu.js` through helper/service/mapper only where needed.

