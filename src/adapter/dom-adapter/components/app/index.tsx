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

import {
  Component,
  ComponentFactory,
  ComponentProps,
  h,
  RenderableProps,
  VNode
} from "preact";

import { defineCE, injectStyles } from "../../../../utils/dom-helpers.js";

import ItemStack from "../../elements/item-stack";
defineCE("item-stack", ItemStack);

declare global {
  namespace JSX {
    interface IntrinsicElements {
      ["item-stack"]: Partial<ItemStack> & { [x: string]: any };
    }
  }
}

import { View, ViewType } from "../../../../model/view.js";
import { AppState, ViewComponentProps } from "../../types.js";

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

interface Props extends ComponentProps {
  state: AppState;
}
export default function AppComponent({ state }: RenderableProps<Props>) {
  return (
    <main>
      <div id="root">Welcome to LurkIt</div>
      <item-stack idFunc={idFunc} onDismissgesture={back}>
        {state.value.stack.map(view => (
          <ResolveComponent<ComponentFactory<ViewComponentProps>>
            promise={loadViewComponent(view)}
            onResolve={Component => <Component state={view} />}
          />
        ))}
      </item-stack>
      <BottomBarComponent state={state} />
    </main>
  );
}
