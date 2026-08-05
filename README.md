# MMM-SchoolLunchMenu

A concise MagicMirror module that fetches and displays upcoming school lunches from HealthPro.

## Highlights
- HealthPro `date_overwrites` support
- Configurable organization and menu ids
- Daily in-memory cache to avoid repeated API hits
- Dynamic category and recipe mapping from HealthPro JSON
- Minimal black/white MagicMirror styling

## Requirements
- MagicMirror²
- Network access to `https://menus.healthepro.com`
- A valid `organizationId` and `menuId`

## Installation
Clone this repo into MagicMirror's `modules` directory as `MMM-SchoolLunchMenu`:

```bash
cd ~/MagicMirror/modules
git clone https://github.com/WillLeeCoyote/mmm-school-lunch-menu MMM-SchoolLunchMenu
```

## Config
Add the module to `config/config.js`:

```js
{
  module: "MMM-SchoolLunchMenu",
  position: "top_left",
  header: "School Lunch",
  config: {
    organizationId: 1993,
    menuId: 131180,
    daysToShow: 5,
    updateInterval: 60 * 60 * 1000,
    showCategories: true,
    showDayOffs: true,
    maxItemsPerCategory: null
  }
}
```

## Options
| Option | Default | Description |
| --- | --- | --- |
| `apiBaseUrl` | `https://menus.healthepro.com/api` | HealthPro API base URL |
| `organizationId` | `1993` | District / organization id |
| `menuId` | `131180` | Menu id |
| `year` | current year | Override request year |
| `month` | current month | Override request month |
| `daysToShow` | `5` | Number of days to render |
| `updateInterval` | `3600000` | How often the helper checks for fresh data |
| `animationSpeed` | `1000` | MagicMirror redraw animation speed |
| `showCategories` | `true` | Show category headings |
| `showDayOffs` | `true` | Show day-off entries |
| `maxItemsPerCategory` | `null` | Optional per-category item cap |

## How it works
- The node helper requests HealthPro data for the configured org/menu/month.
- The mapper parses the `setting.current_display` payload.
- `category` items become section headings.
- `recipe` items become displayed menu entries.
- Unknown item types are ignored.
- Past dates are filtered out, so the first displayed day is always today or later.

Yes — category ingest is dynamic. If HealthPro changes category names or recipe items next month, the module will render the new category titles and item lists from the JSON it receives, as long as they continue to arrive as `category` and `recipe` entries in `current_display`.

## Cache and redraw behavior
### When does the cache update?
The helper runs on `updateInterval`, but the API is only called again when the cache key changes.

The cache key includes:
- organization id
- menu id
- year
- month
- current date

That means:
- repeated checks on the same day reuse cached data
- a new day triggers a fresh fetch
- changing the request scope also triggers a fresh fetch

### When does the module redraw?
The module redraws when the node helper sends fresh module data back to the browser side with `SCHOOL_LUNCH_DATA`.

In the current implementation:
- the helper checks on `updateInterval`
- it sends the current mapped menu payload after each successful check
- `MMM-SchoolLunchMenu.js` calls `updateDom(animationSpeed)` when it receives that payload

So the module can redraw on each interval check, even if the underlying menu data came from cache rather than a new API request. MagicMirror is not independently forcing the refresh for this module; the redraw is driven by the module's own helper notification flow.

## Architecture
- `MMM-SchoolLunchMenu.js` — front-end rendering
- `node_helper.js` — fetch scheduling and MagicMirror integration
- `src/HealthProClient.js` — API URL building and fetch logic
- `src/HealthProMenuMapper.js` — JSON parsing and DTO mapping
- `src/MenuService.js` — cache policy and orchestration

## Styling behavior
- Days render left to right with dividers
- Weekday stays visually prominent
- Date is smaller subtext
- Items stay on one line and ellipsize when long
- Category headings use a divider before items

## Troubleshooting
- Confirm the folder is named `MMM-SchoolLunchMenu`
- Confirm the module is added to `config/config.js`
- Confirm `organizationId` and `menuId` are valid
- Confirm the MagicMirror host can reach HealthPro
- Remove `year` and `month` overrides if you want the current month automatically

## Low-hanging next extensions
- Resolve `menuId` automatically from a school selector
- Persist cache to disk across MagicMirror restarts
- Add a config option to redraw only when payload content changes
- Support more HealthPro item types beyond `recipe` and `category`
- Add optional weekday-only filtering
- Add locale-aware date formatting
- Add alternate compact and wide display modes
- Expose per-category include/exclude settings
