/* eslint-disable @typescript-eslint/ban-ts-comment */
import { suiteRuntime, useIsolate } from '../context/ctx';

import { createIsolate } from './createIsolate';
import { IsolateTypes } from './isolateTypes';

export function isolate<T>(type: IsolateTypes, callback: IsolateCb<T>): T {
  const parent = useIsolate();

  const child = createIsolate<T>(type);

  if (parent) {
    // @ts-ignore
    parent.children[parent.cursor++] = child;
  }

  // @ts-ignore
  return suiteRuntime.run<T>(child, () => {
    const result = callback();

    return result;
  });
}

type IsolateCb<T> = (...args: any[]) => T;