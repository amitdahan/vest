import { Maybe, deferThrow, text } from 'vest-utils';
import { IsolateInspector, Reconciler } from 'vestjs-runtime';
import type { TIsolate } from 'vestjs-runtime';

import { ErrorStrings } from 'ErrorStrings';
import type { TIsolateTest } from 'IsolateTest';
import { VestTest } from 'VestTest';
import cancelOverriddenPendingTest from 'cancelOverriddenPendingTest';
import { isSameProfileTest } from 'isSameProfileTest';
import { useIsExcluded } from 'useIsExcluded';
import { useVerifyTestRun } from 'verifyTestRun';

export class IsolateTestReconciler {
  static match(currentNode: TIsolate, historyNode: TIsolate): boolean {
    return VestTest.is(currentNode) && VestTest.is(historyNode);
  }

  static reconcile(
    currentNode: TIsolateTest,
    historyNode: TIsolateTest,
  ): TIsolateTest {
    const reconcilerOutput = usePickNode(currentNode, historyNode);

    const nextNode = useVerifyTestRun(currentNode, reconcilerOutput);

    cancelOverriddenPendingTestOnTestReRun(nextNode, currentNode, historyNode);

    return nextNode;
  }
}

function usePickNode(
  newNode: TIsolateTest,
  prevNode: TIsolateTest,
): TIsolateTest {
  if (IsolateInspector.usesKey(newNode)) {
    return useHandleTestWithKey(newNode);
  }

  if (
    Reconciler.dropNextNodesOnReorder(nodeReorderDetected, newNode, prevNode)
  ) {
    throwTestOrderError(newNode, prevNode);
    return newNode;
  }

  if (!VestTest.is(prevNode)) {
    // I believe we cannot actually reach this point.
    // Because it should already be handled by nodeReorderDetected.
    /* istanbul ignore next */
    return newNode;
  }

  // FIXME: May-13-2023
  // This may not be the most ideal solution.
  // In short: if the node was omitted in the previous run,
  // we want to re-evaluate it. The reason is that we may incorrectly
  // identify it is "optional" because it was omitted in the previous run.
  // There may be a better way to handle this. Need to revisit this.
  if (VestTest.isOmitted(prevNode)) {
    return newNode;
  }

  return prevNode;
}

function useHandleTestWithKey(newNode: TIsolateTest): TIsolateTest {
  return VestTest.cast(
    Reconciler.handleIsolateNodeWithKey(newNode, (prevNode: TIsolateTest) => {
      // This is the revoke callback. it determines whether we should revoke the previous node and use the new one.
      if (VestTest.isNonActionable(prevNode)) {
        return true;
      }

      if (useIsExcluded(newNode)) {
        return false;
      }

      return true;
    }),
  );
}

function cancelOverriddenPendingTestOnTestReRun(
  nextNode: TIsolate,
  currentNode: TIsolate,
  prevTestObject: TIsolateTest,
) {
  if (nextNode === currentNode && VestTest.is(currentNode)) {
    cancelOverriddenPendingTest(prevTestObject, currentNode);
  }
}

function nodeReorderDetected(
  newNode: TIsolateTest,
  prevNode: Maybe<TIsolate>,
): boolean {
  return VestTest.is(prevNode) && !isSameProfileTest(prevNode, newNode);
}

function throwTestOrderError(
  newNode: TIsolateTest,
  prevNode: Maybe<TIsolate>,
): void {
  if (IsolateInspector.canReorder(newNode)) {
    return;
  }

  deferThrow(
    text(ErrorStrings.TESTS_CALLED_IN_DIFFERENT_ORDER, {
      fieldName: VestTest.getData(newNode).fieldName,
      prevName: VestTest.is(prevNode)
        ? VestTest.getData(prevNode).fieldName
        : undefined,
    }),
  );
}
