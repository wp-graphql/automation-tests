/**
 * Changeset utilities
 * 
 * This module provides utilities for working with changesets across multiple scripts.
 */

const fs = require('fs-extra');
const path = require('path');
const matter = require('gray-matter');
const glob = require('glob');

/**
 * Get the path to the changesets directory
 * 
 * @returns {string} Path to the changesets directory
 */
function getChangesetDir() {
  return path.join(process.cwd(), '.changesets');
}

/**
 * Ensure the changesets directory exists
 * 
 * @returns {Promise<void>}
 */
async function ensureChangesetDir() {
  const dir = getChangesetDir();
  await fs.ensureDir(dir);
  return dir;
}

/**
 * Get all changeset files
 * 
 * @returns {Promise<string[]>} Array of changeset file paths
 */
async function getChangesetFiles() {
  const dir = getChangesetDir();
  
  try {
    const files = await fs.readdir(dir);
    return files
      .filter(file => file.endsWith('.md'))
      .map(file => path.join(dir, file));
  } catch (error) {
    if (error.code === 'ENOENT') {
      return [];
    }
    throw error;
  }
}

/**
 * Read a changeset file and parse its contents
 * 
 * @param {string} filePath Path to the changeset file
 * @returns {Promise<Object>} Parsed changeset data
 */
async function readChangeset(filePath) {
  const content = await fs.readFile(filePath, 'utf8');
  const { data, content: description } = matter(content);
  
  return {
    ...data,
    description: description.trim(),
    filePath
  };
}

/**
 * Read all changesets from the .changesets directory
 * 
 * @param {Object} options Options for reading changesets
 * @param {string} options.branch Branch to filter changesets by
 * @returns {Promise<Array>} Array of changeset objects
 */
async function readAllChangesets(options = {}) {
  const { branch } = options || {};
  
  // Get all changeset files
  const changesetDir = path.join(process.cwd(), '.changesets');
  const files = await fs.readdir(changesetDir);
  const changesetFiles = files.filter(file => file.endsWith('.md'));
  
  // Read each changeset file
  const changesets = await Promise.all(
    changesetFiles.map(async file => {
      const filePath = path.join(changesetDir, file);
      const content = await fs.readFile(filePath, 'utf8');
      
      // Parse the changeset content
      const changeset = parseChangesetContent(content);
      
      // Add the filename to the changeset
      changeset.filename = file;
      
      return changeset;
    })
  );
  
  // If branch is specified, filter changesets by branch
  if (branch) {
    // Special case for develop branch - include milestone branch changesets
    if (branch === 'develop') {
      return changesets.filter(changeset => 
        !changeset.branch || // Include changesets without branch info
        changeset.branch === branch || 
        changeset.branch.startsWith('milestone/')
      );
    }
    
    // Otherwise, filter by the specified branch
    return changesets.filter(changeset => 
      !changeset.branch || // Include changesets without branch info
      changeset.branch === branch
    );
  }
  
  return changesets;
}

/**
 * Read and parse a changeset file
 * @param {string} content The content of the changeset file
 * @returns {Object} Parsed changeset data
 */
function parseChangesetContent(content) {
  const lines = content.split('\n');
  const changeset = {};
  
  let inFrontmatter = false;
  for (const line of lines) {
    if (line.trim() === '---') {
      inFrontmatter = !inFrontmatter;
      continue;
    }
    
    if (inFrontmatter) {
      const [key, ...valueParts] = line.split(':');
      if (key && valueParts.length) {
        // Join value parts back together and clean up quotes and whitespace
        const value = valueParts.join(':').trim().replace(/^['"]|['"]$/g, '');
        changeset[key.trim()] = value;
      }
    }
  }
  
  return changeset;
}

/**
 * Determine the version bump type based on changesets
 * 
 * @param {Object[]} changesets Array of parsed changesets
 * @returns {string} Version bump type (major, minor, patch)
 */
function determineBumpType(changesets = []) {
  // If any changeset has breaking: true, it's a major bump
  const hasBreakingChanges = changesets.some(changeset => changeset.breaking === true);
  if (hasBreakingChanges) {
    return 'major';
  }
  
  // If any changeset has type: "feat", it's a minor bump
  const hasFeatures = changesets.some(changeset => changeset.type === 'feat');
  if (hasFeatures) {
    return 'minor';
  }
  
  // Otherwise, it's a patch bump
  return 'patch';
}

/**
 * Categorize changesets by type
 * 
 * @param {Object[]} changesets Array of parsed changesets
 * @returns {Object} Categorized changesets
 */
function categorizeChangesets(changesets = []) {
  const categories = {
    breaking: [],
    features: [],
    fixes: [],
    other: []
  };
  
  changesets.forEach(changeset => {
    // Check for ! in the title for breaking changes
    if (changeset.title.includes('!')) {
      categories.breaking.push(changeset);
    } else if (changeset.title.startsWith('feat:')) {
      categories.features.push(changeset);
    } else if (changeset.title.startsWith('fix:')) {
      categories.fixes.push(changeset);
    } else {
      categories.other.push(changeset);
    }
  });
  
  return categories;
}

/**
 * Create a new changeset file
 * 
 * @param {Object} data Changeset data
 * @param {string} data.title PR title
 * @param {number} data.pr PR number
 * @param {string} data.author PR author
 * @param {string} data.type Change type (feat, fix, etc.)
 * @param {boolean} data.breaking Whether this is a breaking change
 * @param {string} data.branch Branch where the changeset was created (default: develop)
 * @param {string} data.description PR description
 * @returns {Promise<string>} Path to the created changeset file
 */
async function createChangeset(data) {
  const { title, pr, author, type, breaking, branch, description } = data;
  
  // Use the full title in the changeset content
  const content = `---
title: ${title}
pr: ${pr}
author: ${author}
type: ${type}
breaking: ${breaking}
branch: ${branch}
---

${description}`;
  
  // Ensure the .changesets directory exists
  const changesetDir = path.join(process.cwd(), '.changesets');
  await fs.ensureDir(changesetDir);
  
  // Generate a unique filename based on timestamp and PR number
  const timestamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0];
  const filename = `${timestamp}-pr-${pr}.md`;
  const filepath = path.join(changesetDir, filename);
  
  // Write the changeset file
  await fs.writeFile(filepath, content);
  
  return filepath;
}

/**
 * Delete all changeset files
 * 
 * @returns {Promise<number>} Number of deleted files
 */
async function deleteAllChangesets() {
  const files = await getChangesetFiles();
  
  if (files.length === 0) {
    return 0;
  }
  
  await Promise.all(files.map(file => fs.remove(file)));
  
  return files.length;
}

/**
 * Parse a PR title into its components
 * @param {string} title The full PR title
 * @returns {{prefix: string, description: string}} The parsed title components
 */
function parsePrTitle(title) {
  const [prefix, ...rest] = title.split(':');
  return {
    prefix: prefix.trim(),
    description: rest.join(':').trim() // Join back in case there were other colons
  };
}

/**
 * Format a changeset entry for the release notes
 * @param {Object} changeset The changeset object
 * @returns {string} Formatted entry
 */
function formatChangesetEntry(changeset) {
  const { prefix, description } = parsePrTitle(changeset.title);
  const breaking = changeset.breaking ? '!' : '';
  
  // Format as "**prefix**: description" or "**prefix!**: description" for breaking changes
  return `- **${prefix}${breaking}**: ${description} ([#${changeset.pr}](${repoUrl}/pull/${changeset.pr})) - @${changeset.author}`;
}

module.exports = {
  getChangesetDir,
  ensureChangesetDir,
  getChangesetFiles,
  readChangeset,
  readAllChangesets,
  determineBumpType,
  categorizeChangesets,
  createChangeset,
  deleteAllChangesets
}; 