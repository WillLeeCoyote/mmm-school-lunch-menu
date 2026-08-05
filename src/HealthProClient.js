class HealthProClient {
  constructor(config) {
    this.config = config;
  }

  buildMenuUrl(date = new Date()) {
    const year = this.config.year || date.getFullYear();
    const month = this.config.month || date.getMonth() + 1;

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

  async fetchMenu(date = new Date()) {
    const response = await fetch(this.buildMenuUrl(date));

    if (!response.ok) {
      throw new Error(`HealthPro request failed with status ${response.status}.`);
    }

    return response.json();
  }

  async getMenuIdForSchool() {
    return this.config.menuId;
  }
}

module.exports = HealthProClient;
