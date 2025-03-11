# Changeset Generation Workflow

This document outlines the requirements and implementation details for the Changeset Generation workflow.

## Overview

When a pull request is merged to the `develop` branch, this workflow will automatically generate a changeset file that captures the details of the change. These changesets will be collected and used later for version bumping and changelog generation during the release process.

## Workflow Triggers

- Pull request labeled with 'ready-for-changeset'
- Manual trigger (for testing or manual changeset creation)

## Implementation Options

### Option 1: Using @changesets/cli

The [Changesets](https://github.com/changesets/changesets) package provides a standardized way to manage versioning and changelogs.

#### Pros:
- Well-established tool with good documentation
- Integrates with other tools in the JavaScript ecosystem
- Provides CLI and GitHub Action

#### Cons:
- More oriented toward JavaScript/npm packages
- May require adaptation for WordPress plugin use case

### Option 2: Custom Implementation

Create a custom script that generates changesets in a format specific to our needs.

#### Pros:
- Can be tailored exactly to WordPress plugin requirements
- More flexibility in format and storage
- Can integrate directly with other WordPress-specific workflows

#### Cons:
- Requires more custom code
- Need to maintain our own implementation

## Changeset Format

Regardless of the implementation chosen, each changeset will contain:

```yaml
---
title: "Original PR title"
pr: 123
author: "username"
type: "feat|fix|docs|etc"
description: |
  Detailed description of the change, extracted from PR description
  or generated from commit messages.
breaking: true|false
---
```

## Breaking Change Detection

Breaking changes are automatically detected from:

1. Conventional commit syntax with ! (e.g., "feat!: Add breaking feature")
2. Title prefixed with "BREAKING CHANGE:" or "BREAKING-CHANGE:"
3. Description containing "BREAKING CHANGE:" or "BREAKING-CHANGE:"
4. Explicit `--breaking=true` flag when generating a changeset

The explicit `breaking` field in the changeset takes precedence over automatic detection. This allows for manual overrides when needed.

## Workflow Steps

1. Detect when a PR is labeled with 'ready-for-changeset'
2. Extract metadata from the PR:
   - PR title
   - PR number
   - Author
   - Change type (from semantic PR title)
   - Description (from PR body)
   - Breaking change flag (from PR title/body)
3. Generate changeset file with a unique name (e.g., `{timestamp}-{pr-number}.md`)
4. Store the changeset in a `.changesets` directory
5. Commit the changeset file to the `develop` branch
6. Remove the 'ready-for-changeset' label to prevent duplicate runs

## GitHub Action Implementation

```yaml
name: Generate Changeset

# This workflow can be triggered in two ways:
# 1. By adding the 'ready-for-changeset' label to a pull request
# 2. Manually via the GitHub Actions UI using the workflow_dispatch event

on:
  pull_request:
    types: [labeled]
  workflow_dispatch:
    inputs:
      pr_number:
        description: 'PR number to generate changeset for'
        required: true
        type: string

jobs:
  generate-changeset:
    if: (github.event_name == 'pull_request' && github.event.label.name == 'ready-for-changeset') || github.event_name == 'workflow_dispatch'
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
        with:
          fetch-depth: 0
          ref: develop
          token: ${{ secrets.REPO_PAT }}
          
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '16'
          
      - name: Install dependencies
        run: npm ci
          
      - name: Extract PR information
        id: pr_info
        run: |
          # Extract PR information code here
          
      - name: Generate changeset
        run: |
          # Generate changeset code here
          
      - name: Commit changeset
        uses: stefanzweifel/git-auto-commit-action@v4
        with:
          commit_message: "chore: add changeset for PR #${{ steps.pr_info.outputs.pr_number }}"
          file_pattern: ".changesets/*.md"
          
      - name: Remove label
        if: github.event_name == 'pull_request'
        run: |
          # Remove label code here

## Next Steps and Considerations

- Create the 'ready-for-changeset' label in the repository
- Set up a Personal Access Token (PAT) with repo scope as a repository secret named `REPO_PAT`
- Test workflow with sample PRs
- Consider how to handle merge conflicts
- Plan integration with the release workflow 