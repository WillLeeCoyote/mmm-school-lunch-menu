class MenuService {
  constructor(config, client, mapper) {
    this.config = config;
    this.client = client;
    this.mapper = mapper;
    this.cachedMenu = null;
    this.cacheKey = null;
  }

  async getMenu(now = new Date()) {
    const cacheKey = this.getCacheKey(now);

    if (this.cachedMenu && this.cacheKey === cacheKey) {
      return this.cachedMenu;
    }

    try {
      const menuId = await this.client.getMenuIdForSchool();
      if (!menuId) {
        throw new Error("No menu ID configured for the selected school.");
      }

      const apiResponse = await this.client.fetchMenu(now);
      const days = this.mapper.map(apiResponse);

      this.cachedMenu = {
        days,
        lastUpdated: now.toISOString()
      };
      this.cacheKey = cacheKey;

      return this.cachedMenu;
    } catch (error) {
      if (this.cachedMenu) {
        console.warn(`MenuService: fetch failed, serving cached menu: ${error.message}`);
        return this.cachedMenu;
      }
      throw error;
    }
  }

  getCacheKey(now) {
    const year = this.config.year || now.getFullYear();
    const month = this.config.month || now.getMonth() + 1;
    return `${this.config.organizationId}:${this.config.menuId}:${year}:${month}:${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  }
}

module.exports = MenuService;
