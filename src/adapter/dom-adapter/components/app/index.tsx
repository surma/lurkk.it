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

import { ComponentFactory, h, RenderableProps } from "preact";

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

import ScrollRestoreComponent from "../scroll-restore";

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

import { block, unblock } from "../../state-stream.js";

function idFunc(item: HTMLElement) {
  if (!("viewId" in item.dataset)) {
    return "";
  }
  return item.dataset.viewId!;
}

function back() {
  history.back();
}

function blockRender() {
  block("itemstack-animation");
}

function unblockRender() {
  unblock("itemstack-animation");
}

interface Props {
  state: State;
}

export default function AppComponent({ state }: RenderableProps<Props>) {
  return (
    <main class={state.isLoading ? "loading" : ""}>
      <div class="loader" />
      <div id="root">Welcome to LurkIt</div>
      <item-stack
        idFunc={idFunc}
        onDismissgesture={back}
        onViewtransitionstart={blockRender}
        onViewtransitionend={unblockRender}
      >
        {state.stack.slice(-2).map(view => (
          <ResolveComponent<ComponentFactory<ViewComponentProps>>
            promise={loadViewComponent(view)}
            onResolve={Component => (
              <ScrollRestoreComponent idFunc={idFunc}>
                <Component state={view as any} />
              </ScrollRestoreComponent>
            )}
          />
        ))}
      </item-stack>
      <BottomBarComponent state={state} />
    </main>
  );
}
