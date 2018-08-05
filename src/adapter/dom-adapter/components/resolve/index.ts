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

export interface Props<T> {
  promise: Promise<T>;
  onResolve: (v: T) => VNode;
}
export interface State {
  rendered?: VNode;
}
export default class ResolveComponent<T> extends Component<Props<T>, State> {
  componentWillReceiveProps(props: Props<T>) {
    props.promise.then(v => {
      // If the promise has changed in the meantime, ignore the resolution.
      if (this.props.promise !== props.promise) {
        return;
      }
      this.setState({ rendered: props.onResolve(v) });
    });
  }

  render(props: RenderableProps<Props<T>>, state: State) {
    if (!state.rendered) {
      return null;
    }
    return state.rendered;
  }
}
