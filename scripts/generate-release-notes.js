#!/usr/bin/env node

/**
 * Script to generate release notes from changesets
 * 
 * Usage:
 *   node scripts/generate-release-notes.js [--format=markdown|json] [--repo-url=<url>] [--token=<github-token>] [--branch=<branch-name>]
 * 
 * Options:
 *   --format    Output format (markdown or json, default: markdown)
 *   --repo-url  Repository URL to use for PR links (default: extracted from package.json)
 *   --token     GitHub token for API requests (needed to identify first-time contributors)
 *   --branch    Branch to generate release notes for (default: all branches)
 * 
 * Environment Variables:
 *   REPO_URL     Alternative to --repo-url parameter
 *   GITHUB_TOKEN Alternative to --token parameter
 */

const fs = require('fs-extra');
const path = require('path');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const fetch = require('node-fetch');
const { getEnvVar } = require('./utils/env');
const { readAllChangesets, categorizeChangesets, determineBumpType } = require('./utils/changesets');

// Parse command line arguments
const argv = yargs(hideBin(process.argv))
  .option('format', {
    type: 'string',
    description: 'Output format (markdown or json)',
    choices: ['markdown', 'json'],
    default: 'markdown'
  })
  .option('repo-url', {
    type: 'string',
    description: 'Repository URL to use for PR links'
  })
  .option('token', {
    type: 'string',
    description: 'GitHub token for API requests'
  })
  .option('branch', {
    type: 'string',
    description: 'Branch to generate release notes for',
    default: null
  })
  .help()
  .argv;

// Get repository URL from command line, environment variable, or package.json
async function getRepoUrl() {
  // First, check command line argument
  if (argv['repo-url']) {
    return argv['repo-url'];
  }
  
  // Next, check environment variable
  const envRepoUrl = getEnvVar('REPO_URL', '');
  if (envRepoUrl) {
    return envRepoUrl;
  }
  
  // Finally, try to extract from package.json
  try {
    const packageJson = await fs.readJson(path.join(process.cwd(), 'package.json'));
    const repoUrl = packageJson.repository?.url || packageJson.repository;
    
    if (repoUrl) {
      // Clean up the URL if it's in git+https format or has .git suffix
      return repoUrl
        .replace(/^git\+/, '')
        .replace(/\.git$/, '')
        .replace(/^git@github\.com:/, 'https://github.com/');
    }
  } catch (error) {
    // Ignore errors reading package.json
  }
  
  return '';
}

// Get GitHub token from command line or environment variable
function getGitHubToken() {
  return argv.token || getEnvVar('GITHUB_TOKEN', '');
}

// Check if a contributor is a first-time contributor (3 or fewer commits)
async function isFirstTimeContributor(author, repoUrl, token) {
  if (!token || !author || !repoUrl) {
    return false;
  }
  
  try {
    // Extract owner and repo from the repository URL
    const match = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
    if (!match) {
      return false;
    }
    
    const [, owner, repo] = match;
    
    // Query the GitHub API for the contributor's commit count
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/commits?author=${author}&per_page=4`,
      {
        headers: {
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      }
    );
    
    if (!response.ok) {
      return false;
    }
    
    const commits = await response.json();
    
    // Consider a contributor "first-time" if they have 3 or fewer commits
    return commits.length <= 3;
  } catch (error) {
    return false;
  }
}

// Update the readChangesets function to handle milestone branch changesets
async function readChangesets(options = {}) {
  const { branch } = options;
  
  // Read all changesets
  const changesets = await readAllChangesets();
  
  // If no branch filter is specified, return all changesets
  if (!branch) {
    return changesets;
  }
  
  // Special case: if branch is 'develop', include changesets from milestone branches
  // This ensures that when milestone branches are merged to develop, their changesets are included
  if (branch === 'develop') {
    return changesets.filter(changeset => 
      changeset.branch === branch || 
      changeset.branch.startsWith('milestone/')
    );
  }
  
  // Otherwise, filter by the specified branch
  return changesets.filter(changeset => changeset.branch === branch);
}

// Ensure consistent formatting for changeset entries
function formatChangesetEntry(changeset) {
  // Clean up the title (remove quotes, ensure proper format)
  const title = changeset.title.replace(/^['"]|['"]$/g, '');
  
  return `* **${title}** (#${changeset.pr}) - @${changeset.author}`;
}

// Generate release notes in markdown format
async function generateMarkdownReleaseNotes(changesets, repoUrl, token) {
  // Categorize changesets
  const categories = categorizeChangesets(changesets);
  
  // Determine the appropriate version bump type
  const bumpType = determineBumpType(changesets);
  
  // Start building the release notes
  let notes = ``;
  
  // Add breaking changes section if there are any
  if (categories.breaking.length > 0) {
    notes += `### Breaking Changes ⚠️\n\n`;
    
    for (const changeset of categories.breaking) {
      const prLink = repoUrl ? `([#${changeset.pr}](${repoUrl}/pull/${changeset.pr}))` : `(#${changeset.pr})`;
      const prefixRegex = /^(feat!?|fix!?|docs!?|style!?|refactor!?|perf!?|test!?|build!?|ci!?|chore!?|revert!?)(\([^)]+\))?:/;
      const match = changeset.title.match(prefixRegex);
      if (match) {
        const prefix = changeset.title.substring(0, match[0].length);
        const restOfTitle = changeset.title.substring(match[0].length).trim();
        notes += `- **${prefix}** ${restOfTitle} ${prLink} - @${changeset.author}\n`;
      } else {
        notes += `- **${changeset.title}** ${prLink} - @${changeset.author}\n`;
      }
    }
    
    notes += `\n`;
  }
  
  // Add features section if there are any
  if (categories.features.length > 0) {
    notes += `### Features ✨\n\n`;
    
    for (const changeset of categories.features) {
      const prLink = repoUrl ? `([#${changeset.pr}](${repoUrl}/pull/${changeset.pr}))` : `(#${changeset.pr})`;
      const prefixRegex = /^(feat!?|fix!?|docs!?|style!?|refactor!?|perf!?|test!?|build!?|ci!?|chore!?|revert!?)(\([^)]+\))?:/;
      const match = changeset.title.match(prefixRegex);
      if (match) {
        const prefix = changeset.title.substring(0, match[0].length);
        const restOfTitle = changeset.title.substring(match[0].length).trim();
        notes += `- **${prefix}** ${restOfTitle} ${prLink} - @${changeset.author}\n`;
      } else {
        notes += `- **${changeset.title.replace(/^feat:\s*/i, '')}** ${prLink} - @${changeset.author}\n`;
      }
    }
    
    notes += `\n`;
  }
  
  // Add fixes section if there are any
  if (categories.fixes.length > 0) {
    notes += `### Fixes 🐛\n\n`;
    
    for (const changeset of categories.fixes) {
      const prLink = repoUrl ? `([#${changeset.pr}](${repoUrl}/pull/${changeset.pr}))` : `(#${changeset.pr})`;
      const prefixRegex = /^(feat!?|fix!?|docs!?|style!?|refactor!?|perf!?|test!?|build!?|ci!?|chore!?|revert!?)(\([^)]+\))?:/;
      const match = changeset.title.match(prefixRegex);
      if (match) {
        const prefix = changeset.title.substring(0, match[0].length);
        const restOfTitle = changeset.title.substring(match[0].length).trim();
        notes += `- **${prefix}** ${restOfTitle} ${prLink} - @${changeset.author}\n`;
      } else {
        notes += `- **${changeset.title.replace(/^fix:\s*/i, '')}** ${prLink} - @${changeset.author}\n`;
      }
    }
    
    notes += `\n`;
  }
  
  // Add other changes section if there are any
  if (categories.other.length > 0) {
    notes += `### Other Changes 🔄\n\n`;
    
    for (const changeset of categories.other) {
      const prLink = repoUrl ? `([#${changeset.pr}](${repoUrl}/pull/${changeset.pr}))` : `(#${changeset.pr})`;
      const prefixRegex = /^(feat!?|fix!?|docs!?|style!?|refactor!?|perf!?|test!?|build!?|ci!?|chore!?|revert!?)(\([^)]+\))?:/;
      const match = changeset.title.match(prefixRegex);
      if (match) {
        const prefix = changeset.title.substring(0, match[0].length);
        const restOfTitle = changeset.title.substring(match[0].length).trim();
        notes += `- **${prefix}** ${restOfTitle} ${prLink} - @${changeset.author}\n`;
      } else {
        notes += `- **${changeset.title.replace(/^[^:]+:\s*/i, '')}** ${prLink} - @${changeset.author}\n`;
      }
    }
    
    notes += `\n`;
  }
  
  // Add contributors section
  const contributors = new Set();
  const firstTimeContributors = new Set();
  
  // Collect all contributors
  for (const changeset of changesets) {
    contributors.add(changeset.author);
  }
  
  // Check which contributors are first-time contributors
  if (token) {
    await Promise.all(
      Array.from(contributors).map(async (author) => {
        if (await isFirstTimeContributor(author, repoUrl, token)) {
          firstTimeContributors.add(author);
        }
      })
    );
  }
  
  // Add contributors section if there are any
  if (contributors.size > 0) {
    notes += `## Contributors\n\n`;
    notes += `Thanks to all the contributors who made this release possible!\n\n`;
    
    for (const contributor of contributors) {
      if (firstTimeContributors.has(contributor)) {
        notes += `- @${contributor} 🎉 (First-time contributor)\n`;
      } else {
        notes += `- @${contributor}\n`;
      }
    }
  }
  
  return notes;
}

// Generate release notes in JSON format
async function generateJsonReleaseNotes(changesets, repoUrl, token) {
  // Categorize changesets
  const categories = categorizeChangesets(changesets);
  
  // Determine the appropriate version bump type
  const bumpType = determineBumpType(changesets);
  
  // Collect all contributors
  const contributors = new Set();
  const firstTimeContributors = new Set();
  
  for (const changeset of changesets) {
    contributors.add(changeset.author);
  }
  
  // Check which contributors are first-time contributors
  if (token) {
    await Promise.all(
      Array.from(contributors).map(async (author) => {
        if (await isFirstTimeContributor(author, repoUrl, token)) {
          firstTimeContributors.add(author);
        }
      })
    );
  }
  
  // Build the JSON object
  const releaseNotes = {
    bumpType,
    categories: {
      breaking: categories.breaking.map(changeset => ({
        title: changeset.title,
        pr: changeset.pr,
        author: changeset.author,
        description: changeset.description,
        branch: changeset.branch
      })),
      features: categories.features.map(changeset => ({
        title: changeset.title.replace(/^feat:\s*/i, ''),
        pr: changeset.pr,
        author: changeset.author,
        description: changeset.description,
        branch: changeset.branch
      })),
      fixes: categories.fixes.map(changeset => ({
        title: changeset.title.replace(/^fix:\s*/i, ''),
        pr: changeset.pr,
        author: changeset.author,
        description: changeset.description,
        branch: changeset.branch
      })),
      other: categories.other.map(changeset => ({
        title: changeset.title.replace(/^[^:]+:\s*/i, ''),
        pr: changeset.pr,
        author: changeset.author,
        description: changeset.description,
        branch: changeset.branch
      }))
    },
    contributors: Array.from(contributors).map(author => ({
      username: author,
      isFirstTimeContributor: firstTimeContributors.has(author)
    }))
  };
  
  return JSON.stringify(releaseNotes, null, 2);
}

// Main function
async function generateReleaseNotes() {
  // Get repository URL
  const repoUrl = await getRepoUrl();
  
  // Get GitHub token
  const token = getGitHubToken();
  
  // Read all changesets, filtering by branch if specified
  const changesets = await readChangesets({ branch: argv.branch });
  
  // Log the number of changesets found
  console.log(`Found ${changesets.length} changesets${argv.branch ? ` for branch ${argv.branch}` : ''}.`);
  
  // Generate release notes in the requested format
  if (argv.format === 'json') {
    const jsonNotes = await generateJsonReleaseNotes(changesets, repoUrl, token);
    console.log(jsonNotes);
  } else {
    const markdownNotes = await generateMarkdownReleaseNotes(changesets, repoUrl, token);
    console.log(markdownNotes);
  }
}

// Run the script
generateReleaseNotes().catch(err => {
  console.error('Error generating release notes:', err);
  process.exit(1);
}); 