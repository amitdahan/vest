import {
  isStringValue,
  defaultTo,
  hasOwnProperty,
  invariant,
  optionalFunctionValue,
} from 'vest-utils';

import { useExclusion, useInclusion } from 'SuiteContext';
import { suiteResult, SuiteResult } from 'suiteResult';

export function include(fieldName: string): {
  when: (
    condition: string | boolean | ((draft: SuiteResult) => boolean)
  ) => void;
} {
  const inclusion = useInclusion();
  const exclusion = useExclusion();

  invariant(isStringValue(fieldName));

  inclusion[fieldName] = defaultTo(exclusion.tests[fieldName], true);

  return { when };

  function when(
    condition: string | ((draft: SuiteResult) => boolean) | boolean
  ): void {
    const inclusion = useInclusion();
    const exclusion = useExclusion();

    // This callback will run as part of the "isExcluded" series of checks
    inclusion[fieldName] = (): boolean => {
      if (hasOwnProperty(exclusion.tests, fieldName)) {
        // I suspect this code is technically unreachable because
        // if there are any skip/only rules applied to the current
        // field, the "isExcluded" function will have already bailed
        return defaultTo(exclusion.tests[fieldName], true);
      }

      if (isStringValue(condition)) {
        return Boolean(exclusion.tests[condition]);
      }

      return optionalFunctionValue(
        condition,
        optionalFunctionValue(suiteResult)
      );
    };
  }
}