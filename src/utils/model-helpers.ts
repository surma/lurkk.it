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

import { Thread } from "../model/thread.js";

import { ago } from "../utils/mini-moment.js";

export function computeAdditionalThreadData(thread: Thread) {
  const points = thread.upvotes - thread.downvotes;
  return {
    commentLabel: "comment" + (thread.numComments === 1 ? "" : "s"),
    elapsed: ago(thread.created),
    pointLabel: "points" + (points === 1 ? "" : "s"),
    points
  };
}
