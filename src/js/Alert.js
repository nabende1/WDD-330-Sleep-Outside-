// src/js/Alert.js
import { getLocalStorage, setLocalStorage } from "./utils.mjs";

export default class Alert {
  constructor(dataSource, interval = 5000) {
    this.dataSource = dataSource; // path to alerts.json
    this.dismissedKey = "dismissed-alerts";
    this.interval = interval; // time per alert (ms)
    this.currentIndex = 0;
    this.alertElements = [];
    this.timer = null;
  }

  async init() {
    try {
      const alerts = await this.fetchAlerts();
      if (!alerts || alerts.length === 0) return;

      const dismissed = getLocalStorage(this.dismissedKey) || [];
      const activeAlerts = alerts.filter(
        (alert) => !dismissed.includes(alert.message),
      );

      if (activeAlerts.length === 0) return;

      this.renderAlerts(activeAlerts);
      if (activeAlerts.length > 1) this.startLoop();
    } catch (err) {
      // eslint-disable-next-line
      console.error("Error loading alerts:", err);
    }
  }

  async fetchAlerts() {
    const response = await fetch(this.dataSource);
    if (!response.ok) throw new Error("Failed to load alerts.json");
    return await response.json();
  }

  renderAlerts(alerts) {
    const section = document.createElement("section");
    section.className = "alert-list";
    section.style.position = "relative";
    section.style.height = "auto";

    alerts.forEach((alert, index) => {
      const p = document.createElement("p");
      p.textContent = alert.message;
      p.style.backgroundColor = alert.background || "black";
      p.style.color = alert.color || "white";
      p.style.padding = "10px";
      p.style.borderRadius = "4px";
      p.style.margin = "0";
      p.style.display = index === 0 ? "block" : "none"; // show first, hide others
      p.style.position = "relative";

      // Add dismiss button
      const btn = document.createElement("button");
      btn.textContent = "×";
      btn.style.position = "absolute";
      btn.style.right = "10px";
      btn.style.top = "50%";
      btn.style.transform = "translateY(-50%)";
      btn.style.background = "transparent";
      btn.style.border = "none";
      btn.style.color = alert.color || "white";
      btn.style.fontSize = "16px";
      btn.style.cursor = "pointer";

      btn.addEventListener("click", () =>
        this.dismissAlert(alert.message, p, section),
      );

      p.appendChild(btn);
      section.appendChild(p);
      this.alertElements.push(p);
    });

    const main = document.querySelector("main");
    if (main) main.prepend(section);
  }

  startLoop() {
    this.timer = setInterval(() => {
      if (this.alertElements.length <= 1) return;

      // Hide current alert
      this.alertElements[this.currentIndex].style.display = "none";

      // Move to next
      this.currentIndex = (this.currentIndex + 1) % this.alertElements.length;

      // Show next alert
      this.alertElements[this.currentIndex].style.display = "block";
    }, this.interval);
  }

  dismissAlert(message, element, section) {
    // Remove from DOM
    element.remove();

    // Save dismissed alert in localStorage
    let dismissed = getLocalStorage(this.dismissedKey) || [];
    dismissed.push(message);
    setLocalStorage(this.dismissedKey, dismissed);

    // Remove from alertElements array
    this.alertElements = this.alertElements.filter((el) => el !== element);

    // Reset loop if necessary
    if (this.alertElements.length === 0) {
      clearInterval(this.timer);
      section.remove();
    } else if (this.currentIndex >= this.alertElements.length) {
      this.currentIndex = 0;
    }
  }
}
