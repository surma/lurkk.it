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

import { Component, ComponentFactory, h, RenderableProps } from "preact";

import { defineCE, injectStyles } from "../../../../utils/dom-helpers.js";

import ItemStack from "../../elements/item-stack";
defineCE("item-stack", ItemStack);

declare global {
  namespace JSX {
    interface IntrinsicElements {
      ["item-stack"]: Partial<ItemStack & { children: any }> & {
        [x: string]: any;
      };
    }
  }
}

import { View, ViewType } from "../../../../repository/view.js";
import { State, ViewComponentProps } from "../../types.js";

import ResolveComponent from "../resolve";

type ViewComponentLoader = () => Promise<ComponentFactory<ViewComponentProps>>;
const viewComponentLoaders = new Map<ViewType, ViewComponentLoader>([
  [ViewType.THREAD, () => import("../view-thread").then(m => m.default)],
  [ViewType.SUBREDDIT, () => import("../view-subreddit").then(m => m.default)]
]);

function loadViewComponent(
  view: View
): Promise<ComponentFactory<ViewComponentProps>> {
  if (!viewComponentLoaders.has(view.type)) {
    throw new Error("Unknown view type");
  }
  const viewLoader = viewComponentLoaders.get(view.type)!;
  return viewLoader();
}

import styles from "./styles.css";
injectStyles("app", styles);

import BottomBarComponent from "../bottom-bar";

function idFunc(item: HTMLElement) {
  if (!("viewId" in item.dataset)) {
    return "";
  }
  return item.dataset.viewId!;
}

function back() {
  history.back();
}

interface Props {
  state: State;
}

interface ComponentState {
}
export default class AppComponent extends Component<Props, ComponentState> {
  private scrollPositions = new Map();

  constructor() {
    super();
    this.onScroll = this.onScroll.bind(this);
  }

  componentDidMount() {
    console.log('didMOunt', this.base);
    this.base!.addEventListener('scroll', this.onScroll, {passive: true});
  }

  componentWillUnmount() {
    this.base!.removeEventListener('scroll', this.onScroll);
  }

  componentDidUpdate() {
    for(const view of this.base!.querySelectorAll('item-stack') as NodeListOf<HTMLElement>) {
      const uid = view.dataset['view-uid'];
      const scrollTop = this.scrollPositions.get(uid);
      if(!scrollTop) {
        continue;
      }
      view.scrollTop = scrollTop;
    }
  }

  render({ state }: RenderableProps<Props>, componenState: ComponentState) {
    (self as any).app = this;
    return (
      <main class={state.isLoading ? "loading" : ""}>
        <div class="loader" />
        <div id="root">Welcome to LurkIt</div>
        <item-stack idFunc={idFunc} onDismissgesture={back}>
          {state.stack.slice(-2).map(view => (
            <ResolveComponent<ComponentFactory<ViewComponentProps>>
              promise={loadViewComponent(view)}
              onResolve={Component => <Component state={view as any} data-view-uid={view.uid} />}
            />
          ))}
        </item-stack>
        <BottomBarComponent state={state} />
      </main>
    );
  }

  private onScroll(event: Event) {
    console.log('scroll', event);
    const view = event.target as HTMLElement | null;
    if(!view || !view.dataset['view-uid']) {
      return;
    }
    const uid = view.dataset['view-uid'];
    this.scrollPositions.set(uid, view.scrollTop);
  }
}
