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

import { Component, RenderableProps, VNode } from "preact";

export interface Props {
  idFunc: (el: HTMLElement) => string;
}
export interface State {}

const scrollPositions = new Map<string, number>();
const elemsWithListeners = new Set<HTMLElement>();
export default class ScrollRestoreComponent extends Component<Props, State> {
  constructor() {
    super();
    this.onScroll = this.onScroll.bind(this);
  }

  render(props: RenderableProps<Props>, state: State) {
    return (this.props.children! as preact.ComponentChild[])[0];
  }

  componentDidMount() {
    this.processElement();
  }

  componentDidUpdate() {
    this.processElement();
  }

  private onScroll(evt: Event) {
    if (!evt.target) {
      return;
    }
    const scroller = evt.target as HTMLElement;
    const id = this.props.idFunc(scroller);
    if (!id) {
      return;
    }
    scrollPositions.set(id, scroller.scrollTop);
  }

  private processElement() {
    if (!this.base) {
      return;
    }
    const id = this.props.idFunc(this.base);
    if (!id) {
      return;
    }
    if (!elemsWithListeners.has(this.base)) {
      this.base.addEventListener("scroll", this.onScroll, { passive: true });
      elemsWithListeners.add(this.base);
    }
    const oldScroll = scrollPositions.get(id);
    if (oldScroll) {
      this.base.scrollTop = oldScroll;
    }
  }
}
