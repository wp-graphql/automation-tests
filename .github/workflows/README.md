# GitHub Workflows

This directory contains GitHub Workflows used to automate various tasks for WordPress plugin development and release management.

## Workflow Overview

| Workflow | Status | Description |
|----------|--------|-------------|
| [Semantic PR Titles](./semantic-pr-titles.yml) | ✅ Implemented | Ensures pull request titles follow semantic conventions |
| [Generate Changeset](./generate-changeset.yml) | ✅ Implemented | Generates changesets for PRs merged to develop or milestone branches |
| [Milestone Merge](./milestone-merge.yml) | ✅ Implemented | Handles milestone branches being merged to develop |
| [Release Management](./release-management.yml) | ✅ Implemented | Collects changesets and prepares releases |
| [Create Tag](./create-tag.yml) | ✅ Implemented | Creates a tag when a release PR is merged to main |
| [Deploy](./deploy.yml) | ✅ Implemented | Deploys plugin to WordPress.org and creates GitHub release |

## Detailed Workflow Descriptions

### Semantic PR Titles
- **Trigger**: When a PR is opened, edited, or synchronized
- **Purpose**: Ensures PR titles follow semantic conventions (feat, fix, etc.)
- **Status**: ✅ Implemented

### Generate Changeset
- **Trigger**: When a PR is merged to develop or a milestone branch
- **Purpose**: Generates a changeset file with PR details
- **Requirements**:
  - [x] Detect merged PRs
  - [x] Extract PR title, description, and metadata
  - [x] Generate changeset file in a specified format
  - [x] Commit changeset to appropriate branch
  - [x] Update appropriate PR (release or milestone)
- **Error Handling**:
  - Validates input parameters before processing
  - Provides clear error messages for missing or invalid inputs
  - Uses environment variables with fallbacks for configuration

### Milestone Merge
- **Trigger**: When a milestone branch PR is merged to develop
- **Purpose**: Updates release PR with milestone changes
- **Requirements**:
  - [x] Detect milestone branch merges
  - [x] Use existing changesets from milestone branch
  - [x] Update release PR with milestone changes
  - [x] Maintain milestone context in release notes
- **Error Handling**:
  - Validates milestone branch format
  - Ensures proper handling of existing changesets
  - Provides clear status messages for each operation

### Release Management
- **Trigger**: Manual or scheduled
- **Purpose**: Prepares a release from accumulated changesets
- **Requirements**:
  - [x] Collect all changesets since last release
  - [x] Determine release type (major, minor, patch)
  - [x] Create release branch
  - [x] Update version numbers
  - [x] Generate changelog
  - [x] Create pull request
- **Error Handling**:
  - Uses temporary files with proper cleanup in all scenarios
  - Implements fallback mechanisms for GitHub API interactions
  - Detects and warns about rate limiting issues
  - Provides detailed error reporting for troubleshooting
  - Ensures proper synchronization between branches

### Create Tag
- **Trigger**: When a release PR is merged to main
- **Purpose**: Creates a tag to trigger the deployment workflow
- **Requirements**:
  - [x] Extract version from release branch name
  - [x] Create and push tag
- **Error Handling**:
  - Checks if tag already exists before attempting to create it
  - Provides clear status messages for each operation

### Deploy
- **Trigger**: When a tag is pushed
- **Purpose**: Deploys plugin to WordPress.org and creates GitHub release
- **Requirements**:
  - [x] Build plugin
  - [x] Create GitHub release
  - [x] Deploy to WordPress.org
- **Error Handling**:
  - Implements multiple methods for creating GitHub releases
  - Provides fallback mechanisms for failed operations
  - Includes detailed logging for troubleshooting

## Error Handling Strategy

The workflows implement a robust error handling strategy:

1. **Validation**: Input parameters are validated before processing
2. **Fallbacks**: Alternative approaches are used when primary methods fail
3. **Rate Limiting**: API rate limits are detected and reported
4. **Resource Cleanup**: Temporary resources are cleaned up in all scenarios
5. **Detailed Logging**: Comprehensive logging for troubleshooting
6. **Status Checks**: Explicit checks for common failure conditions
7. **Conditional Execution**: Steps are skipped or modified based on previous results

This ensures that the workflows are resilient to common failure scenarios and provide clear information for troubleshooting when issues occur.

