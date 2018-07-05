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

import { html, render } from "lit-html";
import { animateTo } from "../utils/animation.js";

export default class SwipeableSidenav extends HTMLElement {
  static get START_POS() {
    return "calc(-100% - 4px)";
  }
  static get SWIPE_THRESHOLD() {
    return 10;
  }

  static get ANIMATION_TIME() {
    return 0.3;
  }

  private sidenav: HTMLElement;
  private backdrop: HTMLElement;
  private sidenavSize?: ClientRect;
  private dragStartX?: number;
  private dragDelta?: number;

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    render(this.shadowDom({}), this.shadowRoot!);
    this.sidenav = this.shadowRoot!.querySelector("#sidenav")! as HTMLElement;
    this.backdrop = this.shadowRoot!.querySelector("#backdrop")! as HTMLElement;
    this.backdrop.addEventListener("click", () => this.close());
    document.addEventListener("touchstart", this.onTouchStart.bind(this));
    document.addEventListener("touchmove", this.onTouchMove.bind(this));
    document.addEventListener("touchend", this.onTouchEnd.bind(this));
  }

  connectedCallback() {
    this.sidenavSize = this.sidenav.getBoundingClientRect();
  }

  get isOpen() {
    return this.hasAttribute("open");
  }

  get isClosed() {
    return !this.isOpen;
  }

  async open() {
    await Promise.all([
      animateTo(
        this.sidenav,
        `transform ${SwipeableSidenav.ANIMATION_TIME}s ease-in-out`,
        {
          transform: "translateX(0%)"
        }
      ),
      animateTo(
        this.backdrop,
        `opacity ${SwipeableSidenav.ANIMATION_TIME}s ease-in-out`,
        {
          opacity: "1"
        }
      )
    ]);
    this.backdrop.style.pointerEvents = "initial";
    this.setAttribute("open", "");
  }

  async close() {
    await Promise.all([
      animateTo(
        this.sidenav,
        `transform ${SwipeableSidenav.ANIMATION_TIME}s ease-in-out`,
        {
          transform: `translateX(${SwipeableSidenav.START_POS})`
        }
      ),
      animateTo(
        this.backdrop,
        `opacity ${SwipeableSidenav.ANIMATION_TIME}s ease-in-out`,
        {
          opacity: "0"
        }
      )
    ]);
    this.backdrop.style.pointerEvents = "none";
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

  private shadowDom(state: {}) {
    return html`
      <style>
        :host {
          position: relative;
        }
        #sidenav {
          position: fixed;
          top: 0;
          left: 0;
          pointer-events: none;
          will-change: transform;
          overflow: hidden;
          z-index: 9;

          width: var(--sidenav-width);
          height: 100vh;
          transform: translateX(${SwipeableSidenav.START_POS});
          padding: var(--sidenav-padding);

          background-color: var(--sidenav-bg-color);
          box-shadow: -3px 0px 4px 4px var(--sidenav-shadow);
        }
        :host([open]) #sidenav {
          transform: translateX(0%);
          pointer-events: initial;
        }
        #backdrop {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.3);
          opacity: 0;
          pointer-events: none;
        }
      </style>
      <div id="sidenav">
        <slot></slot>
      </div>
      <div id="backdrop"></div>
    `;
  }

  private isSidenavElement(el: HTMLElement) {
    // If the element passed to this function is either:
    // - a child to any of the nodes that have been slotted into the <slot>
    // - or a child to the sidenav div
    // than the element is part of the sidenav.
    const assignedNodes = this.sidenav.querySelector("slot")!.assignedNodes();
    assignedNodes.push(this.sidenav);
    do {
      if (assignedNodes.includes(el as any)) {
        return true;
      }
      el = el.parentElement!;
    } while (el);
    return false;
  }

  private onTouchStart(ev: TouchEvent) {
    if (ev.touches.length > 1) {
      return;
    }
    const clientX = ev.touches[0].clientX;
    if (this.isClosed && clientX > SwipeableSidenav.SWIPE_THRESHOLD) {
      return;
    }
    if (this.isOpen && !this.isSidenavElement(ev.composedPath()[0])) {
      return;
    }
    this.dragStartX = clientX;
  }

  private onTouchMove(ev: TouchEvent) {
    if (this.dragStartX === undefined) {
      return;
    }

    const clientX = ev.touches[0].clientX;
    this.dragDelta = clientX - this.dragStartX;
    const move = this.isClosed
      ? Math.min(this.dragDelta, this.sidenavSize!.width)
      : Math.min(this.dragDelta, 0);
    const start = this.isClosed ? SwipeableSidenav.START_POS : "0%";
    Object.assign(this.sidenav.style, {
      transform: `translateX(calc(${start} + ${move}px))`,
      transition: ""
    });
  }

  private onTouchEnd(ev: TouchEvent) {
    if (this.dragStartX === undefined) {
      return;
    }

    if (Math.abs(this.dragDelta!) > 50) {
      this.toggle();
    } else {
      this.reset();
    }
    this.dragStartX = undefined;
  }
}
