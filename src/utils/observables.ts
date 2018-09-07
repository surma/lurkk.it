/**
 * Copyright 2018 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
  ReadableStream as WhatWGReadableStream,
  TransformStream as WhatWGTransformStream,
  WritableStream as WhatWGWritableStream
} from "../../westend/src/state-machine/whatwg-streams-hack.js";

let ReadableStream: typeof WhatWGReadableStream = (self as any).ReadableStream;
let WritableStream: typeof WhatWGWritableStream = (self as any).WritableStream;
let TransformStream: typeof WhatWGTransformStream = (self as any)
  .TransformStream;

export { ReadableStream, WritableStream, TransformStream };

export function setReadableStreamConstructor(c: typeof WhatWGReadableStream) {
  ReadableStream = c;
}

export function setWritableStreamConstructor(c: typeof WhatWGWritableStream) {
  WritableStream = c;
}

export function setTransformStreamConstructor(c: typeof WhatWGTransformStream) {
  TransformStream = c;
}

export interface Observable<T> {
  stream: WhatWGReadableStream<T>;
}

type EmitterFunc<T> = (t: T) => void | Promise<void>;
export function create<T>(f: (e: EmitterFunc<T>) => void): Observable<T> {
  return {
    stream: new ReadableStream<T>({
      async start(controller) {
        await f((v: T) => controller.enqueue(v));
        controller.close();
      }
    })
  };
}

export function from<T extends Event = Event>(
  el: HTMLElement,
  evName: string
): Observable<T> {
  let f: ((ev: T) => void) | undefined;
  return {
    stream: new ReadableStream<T>({
      start(controller) {
        f = function(ev: T) {
          controller.enqueue(ev);
        };
        el.addEventListener(evName, f! as any);
      },
      cancel() {
        el.removeEventListener(evName, f! as any);
      }
    })
  };
}

export function just<T>(item: T): Observable<T> {
  return {
    stream: new ReadableStream<T>({
      start(controller) {
        controller.enqueue(item);
        controller.close();
      }
    })
  };
}

export function repeat<T>(items: T | T[]): Observable<T> {
  let i = 0;
  if (!Array.isArray(items)) {
    items = [items];
  }
  return {
    stream: new ReadableStream<T>({
      pull(controller) {
        controller.enqueue((items as T[])[i]);
        i = (i + 1) % (items as T[]).length;
      }
    })
  };
}

export function countUp(): Observable<number> {
  let i = 0;
  return {
    stream: new ReadableStream<number>({
      pull(controller) {
        controller.enqueue(i++);
      }
    })
  };
}

export function delay<T>(this: Observable<T>, ms: number): Observable<T> {
  return {
    stream: this.stream.pipeThrough(
      new TransformStream<T, T>({
        transform(item, controller) {
          setTimeout(_ => controller.enqueue(item), ms);
        }
      })
    )
  };
}

export function map<R, W>(this: Observable<W>, f: (w: W) => R): Observable<R> {
  return {
    stream: this.stream.pipeThrough(
      new TransformStream<R, W>({
        transform(item, controller) {
          controller.enqueue(f(item));
        }
      })
    )
  };
}

export function filter<T>(
  this: Observable<T>,
  f: (t: T) => boolean
): Observable<T> {
  return {
    stream: this.stream.pipeThrough(
      new TransformStream<T, T>({
        transform(item, controller) {
          if (f(item)) {
            controller.enqueue(item);
          }
        }
      })
    )
  };
}

export function take<T>(this: Observable<T>, n: number): Observable<T> {
  return {
    stream: this.stream.pipeThrough(
      new TransformStream<T, T>({
        start(controller) {
          if (n <= 0) {
            controller.terminate();
          }
        },
        transform(item, controller) {
          controller.enqueue(item);
          n--;
          if (n <= 0) {
            controller.terminate();
          }
        }
      })
    )
  };
}

export function takeLast<T>(this: Observable<T>, n: number): Observable<T> {
  const buffer = new Array<T>(n);
  return {
    stream: this.stream.pipeThrough(
      new TransformStream<T, T>({
        transform(item) {
          buffer.push(item);
          buffer.shift();
        },
        flush(controller) {
          buffer.forEach(item => controller.enqueue(item));
        }
      })
    )
  };
}

export function skip<T>(this: Observable<T>, n: number): Observable<T> {
  return {
    stream: this.stream.pipeThrough(
      new TransformStream<T, T>({
        transform(item, controller) {
          if (n > 0) {
            n--;
            return;
          }
          controller.enqueue(item);
        }
      })
    )
  };
}

export function skipLast<T>(this: Observable<T>, n: number): Observable<T> {
  const buffer: T[] = [];
  return {
    stream: this.stream.pipeThrough(
      new TransformStream<T, T>({
        transform(item, controller) {
          buffer.push(item);
          if (buffer.length === n + 1) {
            controller.enqueue(buffer.shift()!);
          }
        }
      })
    )
  };
}

export function merge<T>(...os: Array<Observable<T>>): Observable<T> {
  return {
    stream: new ReadableStream<T>({
      async start(controller) {
        const rs = os.map(o => o.stream.getReader()).map(async r => {
          while (true) {
            const { value, done } = await r.read();
            if (done) {
              return;
            }
            controller.enqueue(value);
          }
        });
        await Promise.all(rs);
        controller.close();
      }
    })
  };
}

export function concat<T>(...os: Array<Observable<T>>): Observable<T> {
  const ts = new TransformStream<T, T>();
  (async _ => {
    for (const o of os) {
      await o.stream.pipeTo(ts.writable, { preventClose: true });
    }
    ts.writable.getWriter().close();
  })();
  return { stream: ts.readable };
}

export function zip<T>(...os: Array<Observable<T>>): Observable<T[]> {
  const rs = os.map(o => o.stream.getReader());
  return {
    stream: new ReadableStream<T[]>({
      async pull(controller) {
        const values = await Promise.all(rs.map(r => r.read()));
        if (values.some(v => v.done)) {
          rs.map(r => r.releaseLock());
          controller.close();
        }
        controller.enqueue(values.map(v => v.value));
      }
    })
  };
}

export function eat<T>(this: Observable<T>) {
  this.stream.pipeTo(new WritableStream<T>());
}

export function subscribe<T>(
  this: Observable<T>,
  f: (t: T) => void | Promise<void>
): Observable<T> {
  const [rs1, rs2] = this.stream.tee();
  this.stream = rs1;
  const r = rs2.getReader();
  (async () => {
    while (true) {
      const { value, done } = await r.read();
      if (done) {
        return;
      }
      await f(value);
    }
  })();
  return this;
}

export type CachedObservable<T> = Observable<T> & { cache: T | undefined };
export function cacheLast<T>(this: Observable<T>): CachedObservable<T> {
  const o = {
    cache: undefined as T | undefined,
    stream: this.stream.pipeThrough(
      new TransformStream<T, T>({
        transform(item, controller) {
          controller.enqueue(item);
          o.cache = item;
        }
      })
    )
  };
  return o;
}

export function dedupe<T>(
  this: Observable<T>,
  id: (t: T) => any = t => t
): Observable<T> & { last: T } {
  const filtered = filter.call(this, (i: T) => i !== last.last);
  const last = cacheLast.call(filtered);
  return last;
}

export type BlockableObservable<T> = Observable<T> & {
  block: () => void;
  unblock: () => void;
};
export function blockable<T>(this: Observable<T>): BlockableObservable<T> {
  let blocked = false;
  let resolver = undefined as ((v: any) => void) | undefined;
  return {
    stream: this.stream.pipeThrough(
      new TransformStream<T, T>({
        transform(item, controller) {
          if (!blocked) {
            return controller.enqueue(item);
          }
          return new Promise(resolve => {
            resolver = resolve;
          }).then(() => {
            controller.enqueue(item);
          });
        }
      })
    ),
    block() {
      blocked = true;
    },
    unblock() {
      if (resolver) {
        resolver(null);
      }
      blocked = false;
    }
  };
}

export async function next<T>(this: Observable<T>): Promise<T | null> {
  const [rs1, rs2] = this.stream.tee();
  this.stream = rs1;
  const r = rs2.getReader();
  const { value, done } = await r.read();
  r.releaseLock();
  rs2.cancel("done with it");
  if (done) {
    return null;
  }
  return value;
}
