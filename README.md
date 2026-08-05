# MMM-SchoolLunchMenu

`MMM-SchoolLunchMenu` is a minimalist MagicMirror module that fetches, caches, formats, and displays upcoming school lunches from the HealthPro menu API.

It is designed to be drop-in ready, easy to maintain, and straightforward to extend. The module separates API access, data transformation, caching, and front-end rendering so future enhancements can be made without turning the module into a monolith.

## What this module does
- Pulls lunch menu data from HealthPro using configurable organization and menu identifiers
- Converts the HealthPro payload into a small internal DTO focused on display needs
- Groups recipes under category headers like `Lunch Entree`, `Vegetables`, `Fruit`, and `Milk`
- Displays day-off entries cleanly when the feed indicates school is closed
- Caches results in memory and limits API fetches to once per day for the same configured request scope
- Uses simple black/white MagicMirror-friendly styling with minimal visual noise

## Current HealthPro support
This module currently supports the HealthPro `date_overwrites` endpoint and expects data shaped like the provided `current_display` payload.

The current implementation parameterizes the main pieces of the API URL:
- `organizationId`
- `menuId`
- `year`
- `month`

The school-to-menu lookup is intentionally left as a future extension point. A stub exists in the API client for that enhancement.

## Requirements
- A working [MagicMirror²](https://magicmirror.builders/) installation
- Network access from the MagicMirror server to `https://menus.healthepro.com`
- A valid HealthPro organization id and menu id

## Installation

### Option 1: Manual installation
Clone or copy this repository into your MagicMirror `modules` directory and name the folder `MMM-SchoolLunchMenu`.

Example:

```bash
cd ~/MagicMirror/modules
git clone https://github.com/WillLeeCoyote/mmm-school-lunch-menu MMM-SchoolLunchMenu
```

If you already have the repository locally and want to copy it into a MagicMirror installation manually, place the entire module directory under:

```bash
~/MagicMirror/modules/MMM-SchoolLunchMenu
```

### Option 2: Helper install script
This repository includes an optional helper script:

```bash
./install.sh
```

By default it installs the module into:

```bash
$HOME/MagicMirror/modules/MMM-SchoolLunchMenu
```

If your MagicMirror installation lives elsewhere, pass the MagicMirror root directory as the first argument:

```bash
./install.sh /path/to/MagicMirror
```

What the script does:
- Verifies the target MagicMirror directory exists
- Creates the `modules` directory if needed
- Copies this module into `modules/MMM-SchoolLunchMenu`
- Excludes Git metadata and common local-only files

## MagicMirror configuration
Add the module to your `config/config.js` file.

### Minimal example
```js
{
  module: "MMM-SchoolLunchMenu",
  position: "top_left",
  header: "School Lunch",
  config: {
    organizationId: 1993,
    menuId: 131180
  }
}
```

### Recommended example
```js
{
  module: "MMM-SchoolLunchMenu",
  position: "top_left",
  header: "School Lunch",
  config: {
    apiBaseUrl: "https://menus.healthepro.com/api",
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

## Configuration options
| Option | Default | Description |
| --- | --- | --- |
| `apiBaseUrl` | `https://menus.healthepro.com/api` | Base URL for the HealthPro API |
| `organizationId` | `1993` | HealthPro organization or district id |
| `menuId` | `131180` | HealthPro menu id used to retrieve lunch data |
| `year` | current year | Overrides the request year if you want to target a specific month/year |
| `month` | current month | Overrides the request month if you want to target a specific month/year |
| `daysToShow` | `5` | Maximum number of menu days rendered after mapping and filtering |
| `updateInterval` | `3600000` | Frequency for checking whether a fresh daily fetch is needed |
| `animationSpeed` | `1000` | MagicMirror DOM update animation speed |
| `retryDelay` | `300000` | Reserved for future retry and backoff behavior |
| `showCategories` | `true` | When `true`, renders category headers such as `Lunch Entree` or `Fruit` |
| `showDayOffs` | `true` | When `true`, keeps school-closed / day-off entries in the displayed results |
| `maxItemsPerCategory` | `null` | Optional maximum number of recipe items rendered under each category |

## How the display is built
The module reads HealthPro `current_display` items in weight order and maps them into sections.

Current mapping behavior:
- `type: "category"` starts a new display section
- `type: "recipe"` becomes a visible lunch item
- other item types are ignored for now
- unused HealthPro fields are intentionally discarded for simplicity

A day-off payload such as a teacher workday is rendered as a clean message for that date instead of a recipe list.

## Caching behavior
The module avoids unnecessary calls to the API.

Current cache strategy:
- menu data is cached in memory inside the server-side service
- the cache key includes organization, menu, year, month, and current date
- a matching request on the same day reuses cached data
- the module checks on the configured `updateInterval`, but will only refetch once the day changes or the request scope changes

This keeps the module responsive while honoring the requirement to avoid repeatedly hitting the API.

## Architecture and separation of concerns
The module is intentionally split into focused parts.

### `MMM-SchoolLunchMenu.js`
Front-end MagicMirror module entrypoint.
- receives mapped DTO data from the node helper
- renders day sections, category headers, and lunch items
- handles empty, loading, and error states

### `node_helper.js`
Server-side MagicMirror integration layer.
- receives module config from the browser side
- wires together the service, client, and mapper
- schedules refresh checks
- returns either mapped menu data or a user-facing error message

### `src/HealthProClient.js`
HealthPro transport and endpoint builder.
- builds the API URL from parameterized config
- fetches JSON from HealthPro
- contains the stub for future school-to-menu lookup support

### `src/HealthProMenuMapper.js`
JSON parsing and DTO transformation.
- parses the `setting` JSON blob
- detects day-off entries
- groups recipes under categories
- trims unused payload noise and returns display-ready data

### `src/MenuService.js`
Caching and orchestration.
- coordinates fetch + map flow
- stores the daily in-memory cache
- returns the DTO consumed by the MagicMirror front end

## Example output shape
The UI is designed around a simple structure like:
- weekday
- formatted date
- category
- items under that category

Example visual result:
- Wednesday
- August 5, 2026
- Lunch Entree
- Cheeseburger
- Grilled Cheese Sandwich
- Yogurt and Goldfish Meal
- Vegetables
- Tossed Side Salad
- Baked Beans
- Fruit
- Chilled Fruit Variety
- Fresh Fruit Variety
- Milk
- 1% Milk
- Milk Variety

## Styling
The included stylesheet follows MagicMirror’s usual minimalist approach:
- monochrome-friendly presentation
- simple spacing
- subtle hierarchy between weekday, date, category, and item lines
- no extra decorative UI or nonessential chrome

If you want to customize the visual style, update:

```text
MMM-SchoolLunchMenu.css
```

## Future enhancement points
The code intentionally leaves room for low-friction upgrades.

Good next improvements include:
- resolving `menuId` dynamically from a selected school
- supporting additional HealthPro endpoints
- persisting cache to disk so data survives MagicMirror restarts
- filtering to only upcoming weekdays
- adding display options for hidden items or alternate text types
- adding localization for date formatting
- adding school selection abstractions if multiple menus are needed

## Troubleshooting

### Nothing is displayed
Check:
- the module folder is named `MMM-SchoolLunchMenu`
- the module is added to `config/config.js`
- your `organizationId` and `menuId` are valid
- the MagicMirror server can reach the HealthPro API

### I only see a loading or error message
Check the MagicMirror logs for server-side output and verify the HealthPro endpoint is reachable from the host running MagicMirror.

### The wrong month is shown
If `year` or `month` are set in config, they override the current date. Remove those values to follow the current calendar month automatically.

### Day-off entries should not appear
Set:

```js
showDayOffs: false
```

## Development notes
- No test suite was added because the repository did not contain existing test infrastructure and the requested scope was a production-ready module implementation rather than test scaffolding.
- The implementation favors simple module code over extra dependencies.
- The module currently uses the runtime `fetch` available in the server environment used by MagicMirror.

## Repository contents
- `MMM-SchoolLunchMenu.js`
- `MMM-SchoolLunchMenu.css`
- `node_helper.js`
- `src/HealthProClient.js`
- `src/HealthProMenuMapper.js`
- `src/MenuService.js`
- `install.sh`

## License
If you intend to publish or distribute this module broadly, add the repository license that matches your intended usage.
