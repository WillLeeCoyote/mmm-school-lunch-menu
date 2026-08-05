class HealthProMenuMapper {
  constructor(config) {
    this.config = config;
  }

  map(apiResponse) {
    const sourceDays = Array.isArray(apiResponse && apiResponse.data) ? apiResponse.data : [];
    const today = this.getTodayKey();

    return sourceDays
      .map((entry) => this.mapDay(entry))
      .filter(Boolean)
      .filter((day) => day.date >= today)
      .filter((day) => this.config.showDayOffs || !day.isDayOff)
      .sort((left, right) => left.date.localeCompare(right.date))
      .slice(0, this.config.daysToShow);
  }

  mapDay(entry) {
    if (!entry || !entry.day) {
      return null;
    }

    const parsedDate = new Date(`${entry.day}T00:00:00`);
    const setting = this.parseSetting(entry.setting);
    const displayItems = Array.isArray(setting.current_display) ? setting.current_display : [];
    const sortedItems = [...displayItems].sort((left, right) => (left.weight || 0) - (right.weight || 0));
    const dayOff = this.normalizeDayOff(setting.days_off);

    return {
      date: entry.day,
      weekday: parsedDate.toLocaleDateString("en-US", { weekday: "long" }),
      dateLabel: parsedDate.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric"
      }),
      isDayOff: Boolean(dayOff),
      dayOffDescription: dayOff,
      sections: dayOff ? [] : this.groupSections(sortedItems)
    };
  }

  getTodayKey(now = new Date()) {
    return now.toISOString().slice(0, 10);
  }

  parseSetting(setting) {
    if (!setting) {
      return {};
    }

    if (typeof setting === "object") {
      return setting;
    }

    try {
      return JSON.parse(setting);
    } catch (_error) {
      return {};
    }
  }

  normalizeDayOff(daysOff) {
    if (!daysOff || Array.isArray(daysOff) || Number(daysOff.status) !== 1) {
      return null;
    }

    return daysOff.description || "No school";
  }

  groupSections(items) {
    const sections = [];
    let currentSection = null;

    items.forEach((item) => {
      if (item.type === "category") {
        currentSection = {
          title: item.name,
          items: []
        };
        sections.push(currentSection);
        return;
      }

      if (item.type !== "recipe" || !item.name) {
        return;
      }

      if (!currentSection) {
        currentSection = {
          title: "",
          items: []
        };
        sections.push(currentSection);
      }

      currentSection.items.push(item.name);
    });

    return sections
      .map((section) => ({
        title: section.title,
        items: this.limitItems(section.items)
      }))
      .filter((section) => section.items.length);
  }

  limitItems(items) {
    if (!Number.isInteger(this.config.maxItemsPerCategory) || this.config.maxItemsPerCategory <= 0) {
      return items;
    }

    return items.slice(0, this.config.maxItemsPerCategory);
  }
}

module.exports = HealthProMenuMapper;
