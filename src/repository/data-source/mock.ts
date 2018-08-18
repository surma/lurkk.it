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
  processLoadSubredditAPIResponse,
  processLoadThreadAPIResponse
} from "./reddit.js";

export async function loadSubreddit(id: string) {
  const rawData = await fetch("/subreddit.json").then(r => r.json());
  return processLoadSubredditAPIResponse(id, rawData);
}

export async function loadThread(id: string) {
  const rawData = await fetch("/thread.json").then(r => r.json());
  return processLoadThreadAPIResponse(id, rawData);
}
