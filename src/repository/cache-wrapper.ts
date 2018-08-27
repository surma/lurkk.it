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

import { del, get, set } from "idb-keyval";

import { DataSource } from "./data-source/data-source.js";
import { Subreddit } from "./storage-model/subreddit.js";
import { Thread } from "./storage-model/thread.js";

const VERSION = 2;

export interface CacheableDataSource extends DataSource {
  refreshSubreddit(id: string): Promise<void>;
  refreshThread(id: string): Promise<void>;
  cacheDateForThread(id: string): Promise<number>;
}

async function migrateCache(newVersion: number) {
  const key = "storage-format-version";
  const oldVersion = (await get(key)) as number | undefined;
  switch (oldVersion) {
    case undefined: {
      const migrator = await import("./storage-model/migrator/undefined.js");
      await migrator.default();
    }
    case 1: {
      const migrator = await import("./storage-model/migrator/1.js");
      await migrator.default();
    }
  }
  await set(key, newVersion);
}

export async function cacheWrapper(
  source: DataSource
): Promise<CacheableDataSource> {
  await migrateCache(VERSION);

  return {
    async loadThread(id: string): Promise<Thread> {
      const key = `thread-${id}`;
      const cached = (await get(key)) as Thread;
      if (!cached) {
        const live = await source.loadThread(id);
        live[0].cachedAt = Date.now();
        await set(key, live);
        return live;
      }
      return cached;
    },
    async loadSubreddit(id: string): Promise<Subreddit> {
      const key = `subreddit-${id}`;
      let result = (await get(key)) as Subreddit;
      if (!result) {
        result = await source.loadSubreddit(id);
        result.cachedAt = Date.now();
        await set(key, result);
      }
      for (const item of result.items) {
        item.cachedAt = await this.cacheDateForThread(item.id);
      }
      return result;
    },
    async refreshSubreddit(id: string): Promise<void> {
      const key = `subreddit-${id}`;
      const old = (await get(key)) as Subreddit;
      await del(key);
      try {
        await this.loadSubreddit(id);
      } catch (e) {
        console.error("Could not refresh subreddit:", e);
        await set(key, old);
      }
    },
    async refreshThread(id: string): Promise<void> {
      const key = `thread-${id}`;
      const old = (await get(key)) as Thread;
      await del(key);
      try {
        await this.loadThread(id);
      } catch (e) {
        console.error("Could not refresh thread:", e);
        await set(key, old);
      }
    },
    async cacheDateForThread(id: string): Promise<number> {
      const key = `thread-${id}`;
      const thread = (await get(key)) as Thread | null;
      if (!thread) {
        return -1;
      }
      return thread[0].cachedAt;
    }
  };
}

export function isCacheableDataSource(
  source: DataSource
): source is CacheableDataSource {
  return "refreshSubreddit" in source && "refreshThread" in source;
}
