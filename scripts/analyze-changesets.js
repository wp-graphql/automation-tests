#!/usr/bin/env node

/**
 * Script to analyze changesets and determine the appropriate version bump type
 * 
 * Usage:
 *   node scripts/analyze-changesets.js
 * 
 * Output:
 *   Logs the recommended version bump type to the console
 *   Returns an exit code corresponding to the bump type (1 for major, 2 for minor, 3 for patch)
 */

const { readAllChangesets, determineBumpType, categorizeChangesets } = require('./utils/changesets');

/**
 * Analyze changesets and determine the appropriate version bump type
 */
async function analyzeChangesets() {
  // Read all changesets
  const changesets = await readAllChangesets();
  
  console.log(`Analyzing changesets...`);
  console.log(`Found ${changesets.length} changesets.`);
  
  if (changesets.length === 0) {
    console.log('No changesets found. No version bump needed.');
    process.exit(0);
  }
  
  // Categorize changesets
  const categories = categorizeChangesets(changesets);
  
  // Log the counts for each category
  console.log(`Breaking changes: ${categories.breaking.length}`);
  console.log(`Features: ${categories.features.length}`);
  console.log(`Fixes: ${categories.fixes.length}`);
  console.log(`Other changes: ${categories.other.length}`);
  
  // Determine the appropriate version bump type
  const bumpType = determineBumpType(changesets);
  
  console.log(`Recommended version bump: ${bumpType}`);
  
  // Return an exit code corresponding to the bump type
  switch (bumpType) {
    case 'major':
      process.exit(1);
    case 'minor':
      process.exit(2);
    case 'patch':
      process.exit(3);
    default:
      process.exit(0);
  }
}

// Run the script
analyzeChangesets().catch(err => {
  console.error('Error analyzing changesets:', err);
  process.exit(1);
}); 