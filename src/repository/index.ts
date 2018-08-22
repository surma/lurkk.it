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

import { cacheWrapper, isCacheableDataSource } from "./cache-wrapper.js";
import { DataSource } from "./data-source/data-source.js";
import { Subreddit } from "./storage-model/subreddit.js";
import { Thread } from "./storage-model/thread.js";

import * as RedditDataSource from "./data-source/reddit.js";

export const dataSources = new Map<string, () => Promise<DataSource>>([
  ["reddit", async () => cacheWrapper(RedditDataSource)],
  ["mock", () => import("./data-source/mock.js")]
]);

export let dataSourceName = "reddit";

function getDataSource(): Promise<DataSource> {
  if (!dataSources.has(dataSourceName)) {
    throw new Error(`Invalid data source ${dataSourceName}`);
  }
  const dataSource = dataSources.get(dataSourceName)!;
  return dataSource();
}

export async function loadSubreddit(id: string): Promise<Subreddit> {
  const dataSource = await getDataSource();
  return dataSource.loadSubreddit(id);
}

export async function loadThread(id: string): Promise<Thread> {
  const dataSource = await getDataSource();
  return dataSource.loadThread(id);
}

export async function refreshThread(id: string): Promise<void> {
  const dataSource = await getDataSource();
  if (!isCacheableDataSource(dataSource)) {
    return;
  }
  await dataSource.refreshThread(id);
}

export async function refreshSubreddit(id: string): Promise<void> {
  const dataSource = await getDataSource();
  if (!isCacheableDataSource(dataSource)) {
    return;
  }
  await dataSource.refreshSubreddit(id);
}

export async function cacheDate(id: string): Promise<number> {
  const dataSource = await getDataSource();
  if (!isCacheableDataSource(dataSource)) {
    return -1;
  }
  return dataSource.cacheDateForThread(id);
}

export {
  getFavorites,
  addFavorite,
  delFavorite,
  toggleFavorite
} from "./favorites.js";

import * as RequestResponseBus from "westend/utils/request-response-bus.js";

export type DataSourceNameRequest = string;
export type DataSourceNameResponse = void;
export const DATA_SOURCE_NAME_CHANNEL = "datasourcename";

import * as ServiceReady from "westend/utils/service-ready.js";
export const READY_CHANNEL = "repository.ready";
export async function init() {
  RequestResponseBus.register<DataSourceNameRequest, DataSourceNameResponse>(
    DATA_SOURCE_NAME_CHANNEL,
    async newDataSourceName => {
      dataSourceName = newDataSourceName;
    }
  );
  ServiceReady.signal(READY_CHANNEL);
}
