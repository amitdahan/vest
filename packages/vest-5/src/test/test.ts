import { VestTest } from 'VestTest';
import { CurrentTestContext } from 'ctx';
import { isolate } from 'isolate';

import { TestFn } from 'TestTypes';
import { IsolateTypes } from 'isolateTypes';

function vestTest(fieldName: string, message: string, cb: TestFn): VestTest;
function vestTest(fieldName: string, cb: TestFn): VestTest;
function vestTest(
  fieldName: string,
  ...args: [message: string, cb: TestFn] | [cb: TestFn]
): VestTest {
  const [cb, message] = args.reverse() as [TestFn, string | undefined];

  const test = new VestTest(fieldName, cb, {
    message,
  });

  isolate(
    IsolateTypes.TEST,
    () => {
      return CurrentTestContext.run(test, () => {
        test.run();
      });
    },
    test
  );

  return test;
}

export { vestTest as test };