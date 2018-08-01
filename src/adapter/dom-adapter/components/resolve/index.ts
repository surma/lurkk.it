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

export default class ResolveComponent<Props> extends Component<Props, Props> {
  private numPending = 0;

  constructor(props: Props) {
    super();
    this.waitOn({}, props);
  }

  componentWillReceiveProps(props: Props) {
    this.waitOn(this.props, props);
  }

  waitOn(oldProps: Partial<Props>, newProps: Partial<Props>) {
    for (const prop of Object.keys(newProps) as Array<keyof Props>) {
      const promise = newProps[prop];
      if (oldProps[prop] === promise) {
        continue;
      }
      // Only handle then-ables
      if (!isPromise(promise)) {
        continue;
      }
      promise.then(value => {
        // Promises are passed in via `props`,
        // `state` holds the resolved values
        this.setState({ [prop]: value } as any);
        this.numPending--;
      });
      this.numPending++;
    }
  }

  render({ children }: RenderableProps<Props>, state: Props) {
    if (this.numPending > 0) {
      return null;
    }
    const f = children && children.find(c => typeof c === "function");
    if (!f) {
      throw new Error("Resolve needs a function as its only child");
    }
    return ((f as any) as (state: Props) => VNode)(state);
  }
}

function isPromise(p: any): p is Promise<{}> {
  return p && "then" in p && typeof p.then === "function";
}
