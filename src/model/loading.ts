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

import { Comment } from "./comment.js";
import { DataSource } from "./data-source/data-source.js";
import { Subreddit, SubredditID } from "./subreddit.js";
import { Thread, ThreadID } from "./thread.js";

import * as RedditDataSource from "./data-source/reddit.js";

export const dataSources = new Map<string, Promise<DataSource>>([
  ["reddit", Promise.resolve(RedditDataSource)],
  ["mock", import("./data-source/mock.js")]
]);

export let dataSourceName = "reddit";

export async function loadSubreddit(id: SubredditID): Promise<Subreddit> {
  if (!dataSources.has(dataSourceName)) {
    throw new Error(`Invalid data source ${dataSourceName}`);
  }
  const dataSource = await dataSources.get(dataSourceName)!;
  return dataSource.loadSubreddit(id);
}

export async function loadThread(id: ThreadID): Promise<[Thread, Comment[]]> {
  if (!dataSources.has(dataSourceName)) {
    throw new Error(`Invalid data source ${dataSourceName}`);
  }
  const dataSource = await dataSources.get(dataSourceName)!;
  return dataSource.loadThread(id);
}

import * as RequestResponseBus from "westend/utils/request-response-bus.js";

export type DataSourceNameRequest = string;
export type DataSourceNameResponse = void;
export const DATA_SOURCE_NAME_CHANNEL = "datasourcename";

export async function init() {
  RequestResponseBus.register<DataSourceNameRequest, DataSourceNameResponse>(
    DATA_SOURCE_NAME_CHANNEL,
    async newDataSourceName => {
      dataSourceName = newDataSourceName;
    }
  );
}
