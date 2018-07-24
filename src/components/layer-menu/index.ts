/**
 * @license
 * Copyright (c) 2018 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */

import { animateTo } from "../../utils/animation.js";
import shadowDomStyles from "./shadowdom-styles.css";
import shadowDom from "./shadowdom.html";

export default class LayerMenu extends HTMLElement {
  static get observedAttributes() {
    return ["slide-width", "slide-zone"];
  }

  animationTime: number = 0.3;
  animationEasing: string = "ease-in-out";
  autoAnimateThreshold: number = 50;

  // tslint:disable-next-line:variable-name proxied variable
  private _slideWidth: number = 0;
  // tslint:disable-next-line:variable-name proxied variable
  private _slideZone: number = 0;
  private dragStart?: number;
  private dragDelta?: number;
  private topElementContainer: HTMLElement;

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot!.innerHTML = `<style>${shadowDomStyles}</style>${shadowDom}`;
    this.topElementContainer = this.shadowRoot!.querySelector(
      "#top"
    ) as HTMLElement;
    this.slideWidth = "50%";

    this.addEventListener("touchstart", this.onTouchStart.bind(this));
    this.addEventListener("touchmove", this.onTouchMove.bind(this), {
      passive: true
    });
    this.addEventListener("touchend", this.onTouchEnd.bind(this));
  }

  connectedCallback() {
    this._slideWidth = this.recalcSlideWidth(
      this.getAttribute("slide-width") || "50%"
    );
    this._slideZone = this.recalcSlideZoneStart(
      this.getAttribute("slide-zone") || "20%"
    );
  }

  attributeChangedCallback(name: string, newVal: string) {
    switch (name) {
      case "slide-width":
        this.slideWidth = newVal;
        break;
      case "slide-zone":
        this.slideZone = newVal;
        break;
    }
  }

  get slideWidth() {
    return this._slideWidth;
  }

  set slideWidth(val: string | number) {
    if (isNumber(val)) {
      this._slideWidth = Number(val);
      return;
    }
    this._slideWidth = this.recalcSlideWidth(val);
  }

  get slideZone() {
    return this._slideZone;
  }

  set slideZone(val: string | number) {
    if (isNumber(val)) {
      this._slideZone = Number(val);
      return;
    }
    this._slideZone = this.recalcSlideZoneStart(val);
  }

  get isOpen() {
    return this.hasAttribute("open");
  }

  get isClosed() {
    return !this.isOpen;
  }

  async open() {
    await animateTo(
      this.topElementContainer,
      `transform ${this.animationTime}s ${this.animationEasing}`,
      {
        transform: `translateX(${-this._slideWidth}px)`
      }
    );
    this.setAttribute("open", "");
  }

  async close() {
    await animateTo(
      this.topElementContainer,
      `transform ${this.animationTime}s ${this.animationEasing}`,
      {
        transform: `translateX(0px)`
      }
    );
    this.removeAttribute("open");
  }

  async toggle() {
    if (this.isOpen) {
      await this.close();
    } else {
      await this.open();
    }
  }

  async reset() {
    if (this.isOpen) {
      await this.open();
    } else {
      await this.close();
    }
  }

  private onTouchStart(ev: TouchEvent) {
    if (ev.touches.length > 1) {
      return;
    }
    const client = ev.touches[0].clientX;
    if (client < this._slideZone) {
      return;
    }
    ev.preventDefault();
    this.dragStart = client;
    this.dragDelta = 0;
  }

  private onTouchMove(ev: TouchEvent) {
    if (this.dragStart === undefined) {
      return;
    }
    const client = ev.touches[0].clientX;
    this.dragDelta = client - this.dragStart;
    if (this.isClosed && this.dragDelta > 0) {
      return;
    }
    if (this.isOpen && this.dragDelta < 0) {
      return;
    }
    ev.stopPropagation();

    const start = this.isOpen ? -this.slideWidth : 0;
    const min = this.isOpen ? 0 : -this._slideWidth;
    const max = this.isOpen ? this._slideWidth : 0;
    const actualDelta = Math.min(Math.max(this.dragDelta, min), max);
    Object.assign(this.topElementContainer.style, {
      transform: `translateX(calc(${start}px + ${actualDelta}px))`,
      transition: ""
    });
  }

  private async onTouchEnd(ev: TouchEvent) {
    if (this.dragStart === undefined) {
      return;
    }

    if (Math.abs(this.dragDelta!) > this.autoAnimateThreshold) {
      if (this.isOpen) {
        await this.close();
        this.dispatchEvent(new CustomEvent("closegesture"));
      } else {
        await this.open();
        this.dispatchEvent(new CustomEvent("opengesture"));
      }
    } else {
      this.reset();
    }
    this.dragStart = undefined;
  }

  private recalcSlideWidth(val: string) {
    Object.assign(this.topElementContainer.style, {
      transform: "",
      transition: ""
    });
    const startRect = this.topElementContainer.getBoundingClientRect();
    this.topElementContainer.style.transform = `translateX(${val})`;
    const endRect = this.topElementContainer.getBoundingClientRect();
    const result = Math.abs(endRect.right - startRect.right);
    this.topElementContainer.style.transform = "";
    return result;
  }

  private recalcSlideZoneStart(val: string) {
    Object.assign(this.topElementContainer.style, {
      transform: "",
      transition: ""
    });
    this.topElementContainer.style.transform = `translateX(-${val})`;
    const endRect = this.topElementContainer.getBoundingClientRect();
    this.topElementContainer.style.transform = "";
    return endRect.right;
  }
}
function isNumber(n: number | string): n is number {
  return !isNaN(Number(n));
}
