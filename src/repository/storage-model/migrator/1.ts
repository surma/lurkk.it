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

import { get, keys, set } from "idb-keyval";
import { decodeHTML } from "../../../utils/dom-helpers.js";

import { Subreddit } from "../subreddit.js";
import { Thread } from "../thread.js";

export default async function() {
  const allKeys = (await keys()) as string[];

  for (const key of allKeys.filter(key => key.startsWith("thread-"))) {
    const thread = (await get(key)) as Thread;
    thread[0].title = decodeHTML(thread[0].title);
    await set(key, thread);
  }

  for (const key of allKeys.filter(key => key.startsWith("subreddit-"))) {
    const subreddit = (await get(key)) as Subreddit;
    for (const item of subreddit.items) {
      item.title = decodeHTML(item.title);
    }
    await set(key, subreddit);
  }
}
