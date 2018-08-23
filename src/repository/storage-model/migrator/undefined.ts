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

import { del, keys } from "idb-keyval";

export default async function() {
  const allKeys = (await keys()) as string[];
  const relevantKeys = allKeys.filter(
    key => key.startsWith("thread-") || key.startsWith("subreddit-")
  );
  for (const key of relevantKeys) {
    await del(key);
  }
}
