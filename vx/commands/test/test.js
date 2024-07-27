const path = require('path');

const exec = require('vx/exec');
const opts = require('vx/opts');
const { usePackage } = require('vx/vxContext');
const vxPath = require('vx/vxPath');

const configOpt = `--workspace ${path.resolve(
  vxPath.VITEST_CONFIG_PATH,
  opts.fileNames.VITEST_CONFIG,
)}`;

function test({ cliOptions }) {
  const pkgName = usePackage();

  exec([
    'yarn vitest run',
    pkgName && `--project ${vxPath.package(pkgName)}`,
    configOpt,
    cliOptions,
  ]);
}

module.exports = test;
