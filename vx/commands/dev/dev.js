const exec = require('vx/exec');
const vxPath = require('vx/vxPath');

module.exports = () => {
  exec(
    `${vxPath.vxRoot()}/node_modules/.bin/onchange -d 5000 -i -k ${vxPath.packageSrc(
      '*',
      './src/**/*.ts',
    )} -- vx prepare`,
  );
};
