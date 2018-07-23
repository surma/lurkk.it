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
  static get OBSERVED_ATTRIBUTES() {
    return ["slide-width"];
  }

  // tslint:disable-next-line:variable-name proxied variable
  _slideWidth: number = 10;
  animationTime: number = 0.3;
  animationEasing: string = "ease-in-out";
  autoAnimateThreshold: number = 50;

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
    this.addEventListener("touchmove", this.onTouchMove.bind(this));
    this.addEventListener("touchend", this.onTouchEnd.bind(this));
  }

  attributeChangedCallback(name: string, newVal: string) {
    switch (name) {
      case "slide-width":
        this.slideWidth = newVal;
        break;
    }
  }

  get slideWidth() {
    return this._slideWidth;
  }

  set slideWidth(val: string | number) {
    if (!isNaN(Number(val))) {
      this._slideWidth = Number(val);
      return;
    }
    Object.assign(this.topElementContainer.style, {
      transform: "",
      transition: ""
    });
    const startRect = this.topElementContainer.getBoundingClientRect();
    this.topElementContainer.style.transform = `translateX(${val})`;
    const endRect = this.topElementContainer.getBoundingClientRect();
    this._slideWidth = Math.abs(endRect.right - startRect.right);
    this.topElementContainer.style.transform = "";
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
    ev.preventDefault();

    const start = this.isOpen ? -this.slideWidth : 0;
    const min = this.isOpen ? 0 : -this._slideWidth;
    const max = this.isOpen ? this._slideWidth : 0;
    const actualDelta = Math.min(Math.max(this.dragDelta, min), max);
    Object.assign(this.topElementContainer.style, {
      transform: `translateX(calc(${start}px + ${actualDelta}px))`,
      transition: ""
    });
  }

  private onTouchEnd(ev: TouchEvent) {
    if (this.dragStart === undefined) {
      return;
    }

    if (Math.abs(this.dragDelta!) > this.autoAnimateThreshold) {
      this.toggle();
    } else {
      this.reset();
    }
    this.dragStart = undefined;
  }
}
