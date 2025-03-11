# Release Management Workflow

This document outlines the requirements and implementation details for the Release Management workflow.

## Overview

The Release Management workflow is responsible for collecting changesets, determining the appropriate version bump (major, minor, patch), updating version numbers in files, generating changelogs, and initiating the build and deployment processes.

## Workflow Triggers

- Manual trigger via GitHub Actions UI
- Scheduled trigger (e.g., weekly/monthly)
- Optional: Tag-based trigger

## Workflow Steps

### 1. Collect and Analyze Changesets

- Read all changesets from the `.changesets` directory
- Determine the appropriate version bump:
  - Major: If any changeset indicates a breaking change
  - Minor: If any changeset is of type "feat" (new feature)
  - Patch: If all changesets are of type "fix", "docs", etc.

### 2. Create Release Branch

- Create a new branch named `release/vX.Y.Z` based on the determined version

### 3. Update Version Numbers

- Update version in `automation-tests.php`
- Update version in `constants.php`
- Update any other files that contain version references

### 4. Generate Changelog

- Generate formatted changelog entries from changesets
- Update `CHANGELOG.md` with new entries
- Update `readme.txt` with new entries
- Include full links to PRs (e.g., `https://github.com/username/repo/pull/123`)
- Highlight breaking changes with prominent warnings
- Add upgrade notice section for breaking changes in `readme.txt`
- Categorize changes by type (breaking changes, features, bug fixes)

### 5. Build Process

- Install Composer dependencies
- Install npm dependencies
- Run build scripts

### 6. Create Pull Request

- Create a PR from the release branch to `main`
- Include generated changelog in PR description

### 7. Deploy (After PR is Merged)

- Create GitHub release with version tag
- Deploy to WordPress.org
- Upload plugin zip to GitHub release

## GitHub Action Implementation

```yaml
name: Release Management

on:
  workflow_dispatch:
    inputs:
      release_type:
        description: 'Force a specific release type (leave empty for auto-detection)'
        required: false
        type: choice
        options:
          - ''
          - major
          - minor
          - patch
  schedule:
    # Run on the 1st and 15th of each month
    - cron: '0 0 1,15 * *'

jobs:
  prepare-release:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
        with:
          fetch-depth: 0
          
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '16'
          
      - name: Collect and analyze changesets
        id: analyze
        run: |
          # Script to collect changesets and determine version bump
          # Sets output variables for next steps
          
      - name: Determine new version
        id: version
        run: |
          # Get current version from constants.php
          CURRENT_VERSION=$(grep -oP "define\('AUTOMATION_TESTS_VERSION', '\K[^']+" constants.php)
          
          # Determine new version based on bump type
          if [[ "${{ github.event.inputs.release_type }}" != "" ]]; then
            BUMP_TYPE="${{ github.event.inputs.release_type }}"
          else
            BUMP_TYPE="${{ steps.analyze.outputs.bump_type }}"
          fi
          
          # Calculate new version
          # This would be a more complex script in practice
          
          echo "::set-output name=new_version::$NEW_VERSION"
          echo "::set-output name=bump_type::$BUMP_TYPE"
          
      - name: Create release branch
        run: |
          git checkout -b release/v${{ steps.version.outputs.new_version }}
          
      - name: Update version numbers
        run: |
          # Update version in automation-tests.php
          sed -i "s/Version: .*/Version: ${{ steps.version.outputs.new_version }}/" automation-tests.php
          
          # Update version in constants.php
          sed -i "s/define('AUTOMATION_TESTS_VERSION', '.*')/define('AUTOMATION_TESTS_VERSION', '${{ steps.version.outputs.new_version }}')/" constants.php
          
      - name: Generate changelog
        run: |
          # Script to generate changelog from changesets
          
      - name: Build dependencies
        run: |
          # Install and build dependencies
          
      - name: Create pull request
        uses: peter-evans/create-pull-request@v4
        with:
          title: "release: v${{ steps.version.outputs.new_version }}"
          body: |
            ## Release v${{ steps.version.outputs.new_version }}
            
            This PR prepares the release of version ${{ steps.version.outputs.new_version }}.
            
            ### Changelog
            
            ${{ steps.changelog.outputs.content }}
          branch: release/v${{ steps.version.outputs.new_version }}
          base: main
          labels: release
```

## Post-Merge Deployment Workflow

After the release PR is merged to `main`, a separate workflow will handle:

1. Creating a GitHub release
2. Deploying to WordPress.org
3. Uploading the plugin zip to the GitHub release

## Considerations and Next Steps

- Decide on the frequency of releases
- Determine how to handle emergency/hotfix releases
- Create scripts for version bumping and changelog generation
- Set up test environment for validating releases
- Consider how to handle release notes for different audiences (developers vs. users)
- Plan for handling release candidates or beta releases 