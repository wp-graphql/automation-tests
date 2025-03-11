# GitHub Workflows

This directory contains GitHub Workflows used to automate various tasks for WordPress plugin development and release management.

## Workflow Overview

| Workflow | Status | Description |
|----------|--------|-------------|
| [Semantic PR Titles](./semantic-pr-titles.yml) | ✅ Implemented | Ensures pull request titles follow semantic conventions |
| [Changeset Generation](./generate-changeset.yml) | ✅ Implemented | Generates changesets when PRs are merged to develop |
| [Release Management](./release-management.yml) | ✅ Implemented | Collects changesets and prepares releases |
| [Create Tag](./create-tag.yml) | ✅ Implemented | Creates a tag when a release PR is merged to main |
| [Deploy](./deploy.yml) | ✅ Implemented | Deploys plugin to WordPress.org and creates GitHub release |

## Detailed Workflow Descriptions

### Semantic PR Titles
- **Trigger**: When a PR is opened, edited, or synchronized
- **Purpose**: Ensures PR titles follow semantic conventions (feat, fix, etc.)
- **Status**: ✅ Implemented

### Changeset Generation
- **Trigger**: When a PR is merged to develop
- **Purpose**: Generates a changeset file with PR details
- **Requirements**:
  - [x] Detect merged PRs
  - [x] Extract PR title, description, and metadata
  - [x] Generate changeset file in a specified format
  - [x] Commit changeset to develop branch

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

### Create Tag
- **Trigger**: When a release PR is merged to main
- **Purpose**: Creates a tag to trigger the deployment workflow
- **Requirements**:
  - [x] Extract version from release branch name
  - [x] Create and push tag

### Deploy
- **Trigger**: When a tag is pushed
- **Purpose**: Deploys plugin to WordPress.org and creates GitHub release
- **Requirements**:
  - [x] Build plugin
  - [x] Create GitHub release
  - [x] Deploy to WordPress.org

