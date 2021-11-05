"use strict";

const $ = (ident, scope=document) => scope.querySelector(ident);
const $A = (ident, scope=document) => scope.querySelectorAll(ident);
const fetchJSON = url => fetch(url).then(res => res.json());
const delay = s => new Promise(r => setTimeout(r, s * 1000));
const body = $("body");
const alertBox = $(".input__box-alert");
const flashBox = $(".input__box-flash");
const message = $(".input__msg");


class Gassy {
  #cfg;
  flash = false;

  constructor() {
    this.init();
    $A(".input__form").forEach(f =>
      f.addEventListener("submit", this.readInputs.bind(this))
    );
  }

  async init() {
    try {
      this.#cfg = JSON.parse(localStorage.getItem("gasCfg")) ?? defaultConfig;
      this.msg(`Loaded from ${this.#cfg.source}`, 1);
      body.style.transitionDuration = `${this.#cfg.flashSpeed}s`;
      alertBox.value = this.#cfg.alertValue;
      flashBox.value = this.#cfg.flashValue;

      this.#cfg.apiKey = apiKey;

      await this.refreshValues();
      setInterval(
        this.refreshValues.bind(this),
        this.#cfg.refreshInterval * 1000
      );
      setInterval(this.flashBg.bind(this), this.#cfg.flashSpeed * 1000);
    } catch (err) {
      await this.msg(`Something went wrong: ${err}`);
    }
  }

  async refreshValues() {
    let checkAgainst;
    const data = await fetchJSON(`${this.#cfg.apiUrl}${this.#cfg.apiKey}`);
    ({
      SafeGasPrice: $(".item__value-safe").textContent,
      ProposeGasPrice: $(".item__value-propose").textContent,
      ProposeGasPrice: checkAgainst,
      FastGasPrice: $(".item__value-fast").textContent,
    } = data.result);
    this.setFlash(checkAgainst);
    if (!this.flash) this.bg = checkValue <= this.#cfg.alertValue ? this.#cfg.c2 : this.#cfg.c1;
  }

  readInputs(e) {
    e.preventDefault();
    [this.#cfg.alertValue, this.#cfg.flashValue] = [
      alertBox.value,
      flashBox.value,
    ];
    this.#cfg.source = "local storage";
    localStorage.setItem("gasCfg", JSON.stringify(this.#cfg));
    this.msg("Saved!", 1);
  }

  setFlash(checkValue) {
    this.flash = checkValue <= this.#cfg.flashValue;
  }

  get bg() {
    return body.style.backgroundColor;
  }
  set bg(color) {
    body.style.backgroundColor = color;
  }
  flashBg() {
    if (this.flash)
      this.bg = this.bg === this.#cfg.c1 ? this.#cfg.c2 : this.#cfg.c1;
  }

  async msg (text, duration = 99) {
    message.textContent = text;
    message.style.opacity = "0.5";
    await delay(duration);
    message.style.opacity = "0";
    await delay(
      Number.parseFloat(getComputedStyle(message).transitionDuration)
    );
    message.textContent = "";
  }
}

const tooGassy = new Gassy();

