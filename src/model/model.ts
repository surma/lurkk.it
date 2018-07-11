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

import * as ServiceReady from "westend/utils/service-ready.js";

import * as RedditDataSource from "./reddit.js";
import {
  Comment,
  DataSource,
  Subreddit,
  SubredditID,
  Thread,
  ThreadID
} from "./types.js";

import * as RequestResponseBus from "../utils/request-response-bus.js";

export const config = {
  dataSource: "reddit"
};

export const dataSources = new Map<string, Promise<DataSource>>([
  ["reddit", Promise.resolve(RedditDataSource)],
  ["mock", import("./mock.js")]
]);

export async function loadSubreddit(id: SubredditID): Promise<Subreddit> {
  if (!dataSources.has(config.dataSource)) {
    throw new Error(`Invalid data source ${config.dataSource}`);
  }
  const dataSource = await dataSources.get(config.dataSource)!;
  return dataSource.loadSubreddit(id);
}

export async function loadThread(id: ThreadID): Promise<[Thread, Comment[]]> {
  if (!dataSources.has(config.dataSource)) {
    throw new Error(`Invalid data source ${config.dataSource}`);
  }
  const dataSource = await dataSources.get(config.dataSource)!;
  return dataSource.loadThread(id);
}

export type ModelConfigRequest = Partial<typeof config>;
export type ModelConfigResponse = void;
export const MODEL_CONFIG = "model.config";

export async function init() {
  RequestResponseBus.register<ModelConfigRequest, ModelConfigResponse>(
    MODEL_CONFIG,
    async b => {
      Object.assign(config, b);
    }
  );
  ServiceReady.signal("model");
}
