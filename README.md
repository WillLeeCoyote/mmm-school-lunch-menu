# MMM-SchoolLunchMenu

A minimalist MagicMirror module for displaying upcoming school lunches from HealthPro.

## Features
- Fetches HealthPro menu data for a configurable organization and menu
- Caches menu data in memory and only refreshes from the API once per day per configured month
- Maps the HealthPro payload into a small, display-focused DTO
- Renders day-off messaging and grouped menu categories using simple MagicMirror-friendly styling
- Keeps API access, mapping, caching, and display concerns separated for future extension

## Installation
Clone this repository into your MagicMirror `modules` directory:

```bash
git clone https://github.com/WillLeeCoyote/mmm-school-lunch-menu MMM-SchoolLunchMenu
```

## Example configuration
```js
{
  module: "MMM-SchoolLunchMenu",
  position: "top_left",
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

## Configuration options
| Option | Default | Description |
| --- | --- | --- |
| `apiBaseUrl` | `https://menus.healthepro.com/api` | Base URL for the HealthPro API |
| `organizationId` | `1993` | HealthPro organization / district id |
| `menuId` | `131180` | HealthPro menu id |
| `year` | current year | Year to request from HealthPro |
| `month` | current month | Month to request from HealthPro |
| `daysToShow` | `5` | Number of upcoming days to render |
| `updateInterval` | `3600000` | How often the module checks whether it should refresh |
| `retryDelay` | `300000` | Reserved stub for future retry/backoff support |
| `showCategories` | `true` | Show category headers such as Lunch Entree |
| `showDayOffs` | `true` | Reserved for future filtering of day-off entries |
| `maxItemsPerCategory` | `null` | Optional maximum recipe items to render per category |

## Architecture
- `MMM-SchoolLunchMenu.js`: MagicMirror UI entrypoint and DOM rendering
- `node_helper.js`: MagicMirror server-side integration and refresh orchestration
- `src/HealthProClient.js`: API URL construction and HealthPro transport
- `src/HealthProMenuMapper.js`: JSON parsing and DTO mapping
- `src/MenuService.js`: Daily cache policy and menu retrieval coordination

## Notes
- The menu lookup by school is stubbed in `HealthProClient#getMenuIdForSchool()` for future API expansion.
- The module currently focuses on the HealthPro `current_display` structure and intentionally ignores unused payload fields.
