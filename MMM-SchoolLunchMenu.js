/* global Module */

Module.register("MMM-SchoolLunchMenu", {
  defaults: {
    apiBaseUrl: "https://menus.healthepro.com/api",
    organizationId: 1993,
    menuId: 131180,
    year: null,
    month: null,
    daysToShow: 5,
    updateInterval: 60 * 60 * 1000,
    animationSpeed: 1000,
    retryDelay: 5 * 60 * 1000,
    showCategories: true,
    showDayOffs: true,
    maxItemsPerCategory: null
  },

  start() {
    this.state = {
      days: [],
      lastUpdated: null,
      error: null,
      loaded: false
    };

    this.sendSocketNotification("SCHOOL_LUNCH_CONFIG", this.config);
  },

  getStyles() {
    return ["MMM-SchoolLunchMenu.css"];
  },

  getHeader() {
    return this.data.header || "School Lunch";
  },

  getDom() {
    const wrapper = document.createElement("div");
    wrapper.className = "mmm-school-lunch-menu";

    if (this.state.error) {
      wrapper.classList.add("dimmed", "light", "small");
      wrapper.textContent = this.state.error;
      return wrapper;
    }

    if (!this.state.loaded) {
      wrapper.classList.add("dimmed", "light", "small");
      wrapper.textContent = "Loading lunch menu...";
      return wrapper;
    }

    if (!this.state.days.length) {
      wrapper.classList.add("dimmed", "light", "small");
      wrapper.textContent = "No upcoming lunches available.";
      return wrapper;
    }

    this.state.days.forEach((day) => {
      wrapper.appendChild(this.renderDay(day));
    });

    return wrapper;
  },

  renderDay(day) {
    const dayWrapper = document.createElement("section");
    dayWrapper.className = "lunch-day";

    const heading = document.createElement("div");
    heading.className = "lunch-day__heading";

    const weekday = document.createElement("div");
    weekday.className = "lunch-day__weekday bright medium";
    weekday.textContent = day.weekday;
    heading.appendChild(weekday);

    const date = document.createElement("div");
    date.className = "lunch-day__date light xsmall";
    date.textContent = day.dateLabel;
    heading.appendChild(date);

    dayWrapper.appendChild(heading);

    if (day.isDayOff) {
      const dayOff = document.createElement("div");
      dayOff.className = "lunch-day__dayoff dimmed xsmall";
      dayOff.textContent = day.dayOffDescription || "No school";
      dayWrapper.appendChild(dayOff);
      return dayWrapper;
    }

    day.sections.forEach((section) => {
      if (!this.config.showCategories && section.title) {
        section.items.forEach((item) => {
          dayWrapper.appendChild(this.renderItem(item, false));
        });
        return;
      }

      dayWrapper.appendChild(this.renderSection(section));
    });

    return dayWrapper;
  },

  renderSection(section) {
    const sectionWrapper = document.createElement("div");
    sectionWrapper.className = "lunch-section";

    if (section.title) {
      const title = document.createElement("div");
      title.className = "lunch-section__title bright xsmall";
      title.textContent = section.title;
      sectionWrapper.appendChild(title);

      const divider = document.createElement("div");
      divider.className = "lunch-section__divider";
      sectionWrapper.appendChild(divider);
    }

    const itemsWrapper = document.createElement("div");
    itemsWrapper.className = "lunch-section__items";

    section.items.forEach((item) => {
      itemsWrapper.appendChild(this.renderItem(item, true));
    });

    sectionWrapper.appendChild(itemsWrapper);

    return sectionWrapper;
  },

  renderItem(item, indented) {
    const itemElement = document.createElement("div");
    itemElement.className = `lunch-item normal xsmall${indented ? " lunch-item--indented" : ""}`;
    itemElement.textContent = item;
    return itemElement;
  },

  socketNotificationReceived(notification, payload) {
    if (notification === "SCHOOL_LUNCH_DATA") {
      this.state = {
        days: payload.days,
        lastUpdated: payload.lastUpdated,
        error: null,
        loaded: true
      };
      this.updateDom(this.config.animationSpeed);
    }

    if (notification === "SCHOOL_LUNCH_ERROR") {
      this.state.error = payload;
      this.state.loaded = true;
      this.updateDom(this.config.animationSpeed);
    }
  }
});
