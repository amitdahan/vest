const semver = require('semver');
const { packageJson } = require('../../util');
const { TAG_NEXT } = require('../constants');
const determineChangeLevel = require('./determineChangeLevel');

const {
  TRAVIS_BRANCH,
  DEFAULT_BRANCH,
  NEXT_BRANCH,
  RELEASE_BRANCH,
  TRAVIS_COMMIT,
} = process.env;

function pickTagId(nextVersion) {
  if (TRAVIS_BRANCH === RELEASE_BRANCH) {
    return nextVersion;
  }

  const commitHash = TRAVIS_COMMIT.substr(0, 6);

  if (TRAVIS_BRANCH === NEXT_BRANCH) {
    return `${nextVersion}-next-${commitHash}`;
  }

  if (TRAVIS_BRANCH !== DEFAULT_BRANCH) {
    return `${nextVersion}-dev-${commitHash}`;
  }

  throw Error('pickTagId: Encountered an unexpected input.');
}

function generatePackageData(packageName, messages) {
  const version = packageJson(packageName).version;
  const changeLevel = determineChangeLevel(messages.join(''));
  const nextVersion = semver.inc(version, changeLevel);
  const tagId = pickTagId(nextVersion);
  const tag = tagId === nextVersion ? null : TAG_NEXT;
  return {
    changeLevel,
    messages,
    nextVersion,
    packageName,
    tag,
    tagId,
    version,
  };
}

module.exports = generatePackageData;
