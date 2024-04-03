const exec = require('child_process').execSync;

const IGNORE_PATTERN = require('./commitIgnorePattern');

const logger = require('vx/logger');
const { STABLE_BRANCH, CURRENT_BRANCH } = require('vx/util/taggedBranch');

/**
 * Lists all the commits and their changed files:
 * Returns an array of objects that look like this:
 *
 * [{title: "...", files: ["..."]}]
 */
function listAllChangesSinceStableBranch() {
  exec(`git fetch origin ${STABLE_BRANCH}`);

  const output = exec(
    `git log origin/${STABLE_BRANCH}..origin/${CURRENT_BRANCH} --name-only --pretty='format:%h  %s (%an)'`,
  );

  logger.log(
    `All changes between origin/${STABLE_BRANCH}..origin/${CURRENT_BRANCH}: `,
    output.toString(),
  );

  return output
    .toString()
    .split('\n\n') // split each commit
    .map(
      commit =>
        commit
          .split('\n') // split each line of each commit
          .filter(Boolean), // ignore empty lines
    )
    .filter(([title]) => !title?.match(IGNORE_PATTERN) ?? false) // ignore excluded terms
    .map(([title, ...files]) => ({
      title,
      files,
    }))
    .filter(({ title }) => Boolean(title));
}

module.exports = listAllChangesSinceStableBranch;
