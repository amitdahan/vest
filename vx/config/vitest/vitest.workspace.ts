import { defineProject, defineWorkspace } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';
import vxPath from 'vx/vxPath';
import opts from 'vx/opts';
import packageNames from 'vx/packageNames';
import path from 'path';
import * as glob from 'glob';
import { usePackage } from 'vx/vxContext';

const setupPerPackage = glob.sync(
  vxPath.packageConfigPath(
    usePackage() ?? '*',
    opts.dir.VITEST,
    opts.fileNames.VITEST_SETUP,
  ),
);

export default defineWorkspace(
  packageNames.list.map(packageName =>
    defineProject({
      root: vxPath.package(packageName),
      plugins: [
        tsconfigPaths({
          root: vxPath.package(packageName),
          parseNative: true,
        }),
      ],
      test: {
        name: packageName,
        include: [
          vxPath.package(packageName, `**/${opts.dir.TESTS}/*.(spec|test).ts`),
        ],
        maxConcurrency: 1,
        isolate: false,
        clearMocks: true,
        setupFiles: [
          path.resolve(vxPath.VITEST_CONFIG_PATH, opts.fileNames.VITEST_SETUP),
        ].concat(setupPerPackage),
      },
    }),
  ),
);
