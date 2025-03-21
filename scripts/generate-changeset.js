#!/usr/bin/env node

/**
 * Script to generate a changeset file from PR information
 * 
 * Usage:
 *   node scripts/generate-changeset.js --pr=123 --title="feat: Add new feature" --author="username" --body="Description of the change"
 *   node scripts/generate-changeset.js --pr=123 --title="feat!: Add breaking feature" --author="username" --body="Description of the change"
 *   node scripts/generate-changeset.js --pr=123 --title="BREAKING CHANGE: Refactor API" --author="username" --body="Description of the change"
 *   node scripts/generate-changeset.js --pr=123 --title="feat: Add new feature" --author="username" --body="Description of the change" --branch="milestone/custom-scalars"
 * 
 * Options:
 *   --pr         PR number
 *   --title      PR title
 *   --author     PR author
 *   --body       PR description
 *   --breaking   Explicitly mark as breaking change (true/false)
 *   --branch     Branch where the changeset was created (default: develop)
 *   --source     Source branch of the PR (optional)
 *   --target     Target branch of the PR (optional)
 * 
 * Breaking Change Detection:
 *   Breaking changes are automatically detected from:
 *   1. Conventional commit syntax with ! (e.g., "feat!: Add breaking feature")
 *   2. Title prefixed with "BREAKING CHANGE:" or "BREAKING-CHANGE:"
 *   3. Description containing "BREAKING CHANGE:" or "BREAKING-CHANGE:"
 *   4. Explicit --breaking=true flag
 * 
 * Special Cases:
 *   - When a PR is from a milestone branch to develop, we skip changeset generation
 *     as those changes already have changesets in the milestone branch.
 */

const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const { getEnvVar } = require('./utils/env');
const { createChangeset } = require('./utils/changesets');

// Get GitHub token from environment variables
// This will work with both GitHub Actions (GITHUB_TOKEN) and local .env file
const githubToken = getEnvVar('GITHUB_TOKEN', '');

// Parse command line arguments
const argv = yargs(hideBin(process.argv))
  .option('pr', {
    type: 'number',
    description: 'PR number',
    demandOption: true
  })
  .option('title', {
    type: 'string',
    description: 'PR title',
    demandOption: true
  })
  .option('author', {
    type: 'string',
    description: 'PR author',
    demandOption: true
  })
  .option('body', {
    type: 'string',
    description: 'PR description',
    default: ''
  })
  .option('breaking', {
    type: 'boolean',
    description: 'Whether the PR indicates a breaking change',
    default: false
  })
  .option('branch', {
    type: 'string',
    description: 'Branch where the changeset was created',
    default: 'develop'
  })
  .option('source', {
    type: 'string',
    description: 'Source branch of the PR',
    default: ''
  })
  .option('target', {
    type: 'string',
    description: 'Target branch of the PR',
    default: ''
  })
  .help()
  .argv;

/**
 * Extract change type from PR title (feat, fix, etc.)
 * 
 * @param {string} title PR title
 * @returns {string} Change type
 */
function extractChangeType(title) {
  const match = title.match(/^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert|milestone):/);
  return match ? match[1] : 'other';
}

/**
 * Check if PR indicates a breaking change
 * 
 * @param {string} title PR title
 * @param {string} body PR description
 * @returns {boolean} Whether the PR indicates a breaking change
 */
function isBreakingChange(title, body) {
  // Check for explicit breaking flag in command line args
  if (argv.breaking === true || argv.breaking === 'true') {
    return true;
  }
  
  // Check for conventional commit breaking change indicator (!)
  if (title.includes('!')) {
    return true;
  }
  
  // Check for "BREAKING CHANGE:" or "BREAKING-CHANGE:" prefix in title (case insensitive)
  const breakingPrefix = /^(BREAKING CHANGE|BREAKING-CHANGE):/i;
  if (breakingPrefix.test(title)) {
    return true;
  }
  
  // Check for "BREAKING CHANGE:" or "BREAKING-CHANGE:" in body
  if (body.includes('BREAKING CHANGE:') || body.includes('BREAKING-CHANGE:')) {
    return true;
  }
  
  return false;
}

/**
 * Check if this is a PR from a milestone branch to develop
 * 
 * @param {string} source Source branch of the PR
 * @param {string} target Target branch of the PR
 * @returns {boolean} Whether this is a milestone PR to develop
 */
function isMilestonePrToDevelop(source, target) {
  return source.startsWith('milestone/') && target === 'develop';
}

/**
 * Generate a changeset file
 */
async function generateChangeset() {
  // Extract PR information
  const { pr, title, author, body, branch, source, target } = argv;
  
  // Skip changeset generation for PRs from milestone branches to develop
  if (source && target && isMilestonePrToDevelop(source, target)) {
    console.log(`Skipping changeset generation for PR #${pr} from milestone branch ${source} to develop.`);
    console.log('Changesets for these changes already exist in the milestone branch.');
    return;
  }
  
  const changeType = extractChangeType(title);
  const breaking = isBreakingChange(title, body);

  // Use PR title as fallback description if body is empty
  const description = body.trim() || title.trim();

  // Store the complete title in the changeset
  const changesetPath = await createChangeset({
    title: title.trim(),
    pr,
    author,
    type: title.split(':')[0].trim(),
    breaking,
    branch,
    description
  });

  console.log(`Changeset created: ${changesetPath}`);
}

// Run the script
generateChangeset().catch(err => {
  console.error('Error generating changeset:', err);
  process.exit(1);
}); 