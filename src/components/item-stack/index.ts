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

import { render } from "lit-html";

import * as AnimationTools from "../../utils/animation.js";
import shadowDomTemplate from "./shadowdom-template.html";
import shadowDomStyles from "./shadowdom-styles.css";

export interface IsNewFunc {
  (el: HTMLElement): boolean;
}

export function newWeakSetNewFunc(): IsNewFunc {
  const seenItems = new WeakSet<HTMLElement>();
  return (el: HTMLElement) => {
    const isNew = !seenItems.has(el);
    seenItems.add(el);
    return isNew;
  };
}

export default class ItemStack extends HTMLElement {
  margin: number = 20;
  autoAnimateThreshold: number = 50;
  animationTime: number = 0.3;
  animationEasing: string = "ease-in-out";
  isNewFunc: IsNewFunc = newWeakSetNewFunc();

  private dragStart?: number;
  private dragDelta?: number;
  private dismissedItems = new WeakSet<HTMLElement>();

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    render(shadowDomTemplate({ styles: shadowDomStyles }), this.shadowRoot!);
    this.shadowRoot!.querySelector("slot")!.addEventListener(
      "slotchange",
      this.onSlotChange.bind(this)
    );
    this.addEventListener("touchstart", this.onTouchStart.bind(this));
    this.addEventListener("touchmove", this.onTouchMove.bind(this));
    this.addEventListener("touchend", this.onTouchEnd.bind(this));
  }

  get topItem(): HTMLElement | null {
    let last = this.lastElementChild as HTMLElement;
    while (last && this.dismissedItems.has(last)) {
      last = last.previousElementSibling as HTMLElement;
    }
    if (!last) {
      return null;
    }
    return last as HTMLElement;
  }

  async dismiss() {
    const item = this.topItem;
    if (!item) {
      return;
    }
    this.dismissedItems.add(item);
    await AnimationTools.animateTo(
      item,
      `transform ${this.animationTime}s ${this.animationEasing}`,
      { transform: "translateX(100%)" }
    );
    item.style.display = "none";
    this.dispatchEvent(new CustomEvent("dismiss", { bubbles: true }));
  }

  private onTouchStart(ev: TouchEvent) {
    if (ev.touches.length > 1) {
      return;
    }
    const client = ev.touches[0].clientX;
    if (client > this.margin) {
      return;
    }
    this.dragStart = client;
    ev.preventDefault();
    ev.stopPropagation();
  }

  private onTouchMove(ev: TouchEvent) {
    if (!this.topItem) {
      return;
    }
    if (this.dragStart === undefined) {
      return;
    }
    ev.preventDefault();
    ev.stopPropagation();

    const client = ev.touches[0].clientX;
    this.dragDelta = client - this.dragStart;
    const move = Math.max(this.dragDelta, 0);
    Object.assign(this.topItem.style, {
      transform: `translateX(${move}px)`,
      transition: ""
    });
  }

  private async onTouchEnd(ev: TouchEvent) {
    if (!this.topItem) {
      return;
    }
    if (this.dragStart === undefined) {
      return;
    }
    ev.preventDefault();
    ev.stopPropagation();

    if (this.dragDelta! > this.autoAnimateThreshold) {
      this.dismiss();
    } else {
      const el = this.topItem;
      await AnimationTools.animateTo(
        el,
        `transform ${this.animationTime}s ${this.animationEasing}`,
        { transform: "" }
      );
    }
    this.dragStart = undefined;
  }

  private onSlotChange(ev: Event) {
    const items = (ev.target! as HTMLSlotElement)
      .assignedNodes()
      .filter(n => n.nodeType === Node.ELEMENT_NODE) as HTMLElement[];
    const newItems = items.filter(item => this.isNewFunc(item));

    newItems.forEach(async item => {
      item.style.transform = "translateX(100%)";
      await AnimationTools.requestAnimationFramePromise();
      await AnimationTools.animateTo(
        item,
        `transform ${this.animationTime}s ${this.animationEasing}`,
        { transform: "" }
      );
      Object.assign(item.style, {
        transform: "",
        transition: ""
      });
    });
  }
}
