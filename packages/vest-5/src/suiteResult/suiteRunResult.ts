import { assign, isFunction, numberEquals } from 'vest-utils';

import {
  DoneCallback,
  persist as persistContext,
  useDoneCallbacks,
  useFieldCallbacks,
} from 'SuiteContext';
import { TestWalker } from 'SuiteWalker';
import { suiteResult, SuiteResult } from 'suiteResult';

export function suiteRunResult(): SuiteRunResult {
  return assign({}, suiteResult(), {
    done: persistContext(done),
  });
}

/**
 * Registers done callbacks.
 * @register {Object} Vest output object.
 */
const done: Done = function done(...args): SuiteRunResult {
  const [callback, fieldName] = args.reverse() as [
    (res: SuiteResult) => void,
    string
  ];

  const output = suiteRunResult();

  if (shouldSkipDoneRegistration(callback, fieldName, output)) {
    return output;
  }

  const doneCallback = () => callback(suiteRunResult());

  if (shouldRunDoneCallback(fieldName)) {
    doneCallback();
    return output;
  }

  deferDoneCallback(doneCallback, fieldName);

  return output;
};

/**
 * DONE is here and not in its own module to prevent circular dependency issues.
 */

function shouldSkipDoneRegistration(
  callback: (res: SuiteResult) => void,

  fieldName: string | undefined,
  output: SuiteRunResult
): boolean {
  // If we do not have any test runs for the current field
  return !!(
    !isFunction(callback) ||
    (fieldName && numberEquals(output.tests[fieldName]?.testCount, 0))
  );
}

// TODO: This check also happens when tests are finished. Need to combine them.
function shouldRunDoneCallback(fieldName?: string): boolean {
  // is suite finished || field name exists, and tests are finished;

  return !!(
    !TestWalker.hasRemainingTests() ||
    (fieldName && !TestWalker.hasRemainingTests(fieldName))
  );
}

function deferDoneCallback(
  doneCallback: DoneCallback,
  fieldName?: string
): void {
  const [, setFieldCallbacks] = useFieldCallbacks();
  const [, setDoneCallbacks] = useDoneCallbacks();

  if (fieldName) {
    setFieldCallbacks(fieldCallbacks =>
      assign(fieldCallbacks, {
        [fieldName]: (fieldCallbacks[fieldName] || []).concat(doneCallback),
      })
    );

    return;
  }

  setDoneCallbacks(doneCallbacks => doneCallbacks.concat(doneCallback));
}

export type SuiteRunResult = SuiteResult & { done: Done };

interface Done {
  (...args: [cb: (res: SuiteResult) => void]): SuiteRunResult;
  (
    ...args: [fieldName: string, cb: (res: SuiteResult) => void]
  ): SuiteRunResult;
}