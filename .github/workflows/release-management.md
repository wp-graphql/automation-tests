# Release Management Workflow

This document outlines the requirements and implementation details for the Release Management workflow.

## Overview

The Release Management workflow is responsible for collecting changesets, determining the appropriate version bump (major, minor, patch), updating version numbers in files, generating changelogs, and initiating the build and deployment processes.

## Workflow Triggers

- When a PR from develop to main is merged
- Manual trigger via GitHub Actions UI
- Scheduled trigger (e.g., weekly/monthly)

## Workflow Steps

The workflow performs the following steps:

1. **Checkout Code**: Checks out the appropriate branch based on the trigger.
2. **Setup Node.js**: Sets up Node.js environment.
3. **Install Dependencies**: Installs npm dependencies.
4. **Check for Changesets**: Verifies that there are changesets to process.
5. **Determine Version Bump**: Analyzes changesets to determine the appropriate version bump (major, minor, patch).
6. **Update Changelogs**: Updates the changelog files with the new version information.
7. **Generate Release Notes**: Generates release notes from changesets or extracts them from the PR body.
8. **Commit Changes**: Commits the version bump and changelog updates to the appropriate branch.
9. **Create and Push Tag**: Creates a Git tag for the new version.
10. **Create GitHub Release**: Creates a GitHub release with the generated release notes.
11. **Delete Processed Changesets**: Removes the processed changesets from the main branch.
12. **Sync Main to Develop**: Merges changes from main back to develop to ensure both branches are in sync after a release.

## Changeset Lifecycle

Changesets follow this lifecycle:

1. **Automatic Creation**: Changesets are automatically generated when PRs are merged to the develop branch.
2. **Accumulation**: These changeset files accumulate in the develop branch until a release is ready.
3. **Release Preparation**: When a PR from develop to main is created, the changesets are used to generate release notes.
4. **Release**: When the PR is merged, the workflow:
   - Bumps the version based on the changesets
   - Updates changelogs
   - Creates a GitHub release
   - Deletes the changeset files from the main branch
   - Syncs the main branch back to develop, which also removes the changesets from develop

This ensures that changesets are properly tracked, used for release notes, and then cleaned up from both branches after a release is complete.

## Temporary Files

The workflow uses a temporary directory (`/tmp/release-notes/`) outside the repository to store release notes during processing. This prevents Git from tracking these temporary files and avoids issues with `.gitignore`.

## Integration with Changeset Generation

The Release Management workflow works in tandem with the Changeset Generation workflow:

1. The Changeset Generation workflow creates changesets for merged PRs
2. It also creates or updates a release PR from develop to main
3. The release PR contains formatted release notes from all changesets
4. When the release PR is merged to main, the Release Management workflow is triggered
5. It extracts the release notes from the PR body and uses them for the GitHub release
6. After the release is created, all changesets are deleted to prevent duplication in future releases

This integration ensures a smooth, automated release process with minimal manual intervention and accurate changelog entries.

## GitHub Action Implementation

```yaml
name: Release Management

on:
  pull_request_target:
    types: [closed]
    branches:
      - main
  workflow_dispatch:
    inputs:
      release_type:
        description: 'Force a specific release type (leave empty for auto-detection)'
        required: false
        type: choice
        options:
          - auto
          - major
          - minor
          - patch
        default: 'auto'
      target_branch:
        description: 'Target branch for manual release (usually develop)'
        required: false
        default: 'develop'
  schedule:
    # Run on the 1st and 15th of each month
    - cron: '0 0 1,15 * *'

jobs:
  prepare-release:
    # Only run if:
    # 1. PR from develop to main is merged, OR
    # 2. Manually triggered, OR
    # 3. Scheduled run
    if: (github.event_name == 'pull_request_target' && github.event.pull_request.merged == true && github.event.pull_request.head.ref == 'develop') || github.event_name == 'workflow_dispatch' || github.event_name == 'schedule'
    runs-on: ubuntu-latest
    steps:
      # Checkout code
      # Setup Node.js
      # Install dependencies
      # Extract release notes from PR body or generate them
      # Determine version bump
      # Update version numbers
      # Generate changelog
      # Build dependencies
      # Create GitHub release
      # Archive changesets
```

## Considerations and Next Steps

- Decide on the frequency of releases
- Determine how to handle emergency/hotfix releases
- Create scripts for version bumping and changelog generation
- Set up test environment for validating releases
- Consider how to handle release notes for different audiences (developers vs. users)
- Plan for handling release candidates or beta releases 