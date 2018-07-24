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

import { View, ViewType } from "../../../../model/view.js";

import { defineCE, injectStyles } from "../../../../utils/dom-helpers.js";
import { pluralize } from "../../../../utils/lang-helpers.js";
import { unsafeHTML } from "../../../../utils/lit-helpers.js";

import LayerMenu from "../../../../components/layer-menu";
defineCE("layer-menu", LayerMenu);

import itemTemplate from "./item-template.html";
import styles from "./styles.css";
import template from "./template.html";

export default (view: View) => {
  injectStyles("subreddit", styles);
  if (view.type !== ViewType.SUBREDDIT) {
    throw new Error("View is not of type SUBREDDIT");
  }
  return template({
    items: view.subreddit.items.map(item =>
      itemTemplate(item, {
        pluralize,
        unsafeHTML,
        close() {
          this.close();
        }
      })
    ),
    uid: view.uid
  });
};
