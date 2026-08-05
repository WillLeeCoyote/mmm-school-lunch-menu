const NodeHelper = require("node_helper");
const HealthProClient = require("./src/HealthProClient");
const HealthProMenuMapper = require("./src/HealthProMenuMapper");
const MenuService = require("./src/MenuService");

module.exports = NodeHelper.create({
  start() {
    this.menuService = null;
    this.moduleConfig = null;
  },

  socketNotificationReceived(notification, payload) {
    if (notification !== "SCHOOL_LUNCH_CONFIG") {
      return;
    }

    this.initializeService(payload);
    this.fetchMenu();
    this.scheduleNextFetch();
  },

  initializeService(config) {
    this.moduleConfig = config;

    if (this.menuService) {
      return;
    }

    const client = new HealthProClient(config);
    const mapper = new HealthProMenuMapper(config);
    this.menuService = new MenuService(config, client, mapper);
  },

  scheduleNextFetch() {
    if (this.fetchTimer) {
      clearTimeout(this.fetchTimer);
    }

    this.fetchTimer = setTimeout(() => {
      this.fetchMenu()
        .catch((error) => {
          this.sendSocketNotification("SCHOOL_LUNCH_ERROR", error.message);
        })
        .finally(() => {
          this.scheduleNextFetch();
        });
    }, this.moduleConfig.updateInterval);
  },

  async fetchMenu() {
    try {
      const menu = await this.menuService.getMenu();
      this.sendSocketNotification("SCHOOL_LUNCH_DATA", menu);
    } catch (error) {
      this.sendSocketNotification("SCHOOL_LUNCH_ERROR", error.message || "Unable to load lunch menu.");
    }
  }
});
