class HealthProClient {
  constructor(config) {
    this.config = config;
  }

  getMonthsToFetch(date = new Date()) {
    const next = new Date(date.getFullYear(), date.getMonth() + 1, 1);
    return [
      { year: date.getFullYear(), month: date.getMonth() + 1 },
      { year: next.getFullYear(), month: next.getMonth() + 1 }
    ];
  }

  buildMenuUrl({ year, month }) {
    return [
      this.config.apiBaseUrl,
      "organizations",
      this.config.organizationId,
      "menus",
      this.config.menuId,
      "year",
      year,
      "month",
      month,
      "date_overwrites"
    ].join("/");
  }

  async fetchMonth(target) {
    const response = await fetch(this.buildMenuUrl(target));

    if (!response.ok) {
      throw new Error(`HealthPro request failed with status ${response.status}.`);
    }

    return response.json();
  }

  async fetchMenu(date = new Date()) {
    const [primary, ...rest] = this.getMonthsToFetch(date);
    const primaryResponse = await this.fetchMonth(primary);

    const extras = await Promise.all(rest.map((target) => this.fetchMonth(target).catch(() => null)));

    const data = [primaryResponse, ...extras].flatMap((response) =>
      Array.isArray(response && response.data) ? response.data : []
    );

    return { ...primaryResponse, data };
  }

  async getMenuIdForSchool() {
    return this.config.menuId;
  }
}

module.exports = HealthProClient;
