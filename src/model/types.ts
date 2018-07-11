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

export type ThreadID = string;
export type SubredditID = string;
export type CommentID = string;

export interface Subreddit {
  id: SubredditID;
  items: Thread[];
}

export interface Thread {
  author: string;
  downvotes: number;
  id: ThreadID;
  numComments: number;
  fullImage?: string;
  previewImage?: string;
  subreddit: string;
  title: string;
  upvotes: number;
  body?: string;
  htmlBody?: string;
  link?: string;
}

export interface Comment {
  id: CommentID;
  author: string;
  body: string;
  htmlBody: string;
  downvotes: number;
  upvotes: number;
  replies: Comment[];
}

export interface DataSource {
  loadThread(id: ThreadID): Promise<[Thread, Comment[]]>;
  loadSubreddit(id: SubredditID): Promise<Subreddit>;
}
