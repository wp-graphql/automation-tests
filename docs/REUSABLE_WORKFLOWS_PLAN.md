# Reusable Workflows Plan

This document outlines a strategy for making our automation workflows reusable across multiple WPGraphQL repositories, including:

- [wp-graphql/wp-graphql](https://github.com/wp-graphql/wp-graphql)
- [wp-graphql/wp-graphql-smart-cache](https://github.com/wp-graphql/wp-graphql-smart-cache)
- [wp-graphql/wpgraphql-ide](https://github.com/wp-graphql/wpgraphql-ide)
- [wp-graphql/wpgraphql-acf](https://github.com/wp-graphql/wpgraphql-acf)

## Current State

We've developed a robust set of workflows and scripts for:
- Changeset generation
- Release management
- Version bumping
- Changelog updates
- Documentation synchronization

These workflows are currently implemented directly in this repository, but they could provide significant value across the entire WPGraphQL ecosystem.

### Current Implementation Details

Our current implementation includes:

1. **GitHub Action Workflows**:
   - `generate-changeset.yml`: Generates changesets when PRs are merged to develop
   - `release-management.yml`: Handles version bumping, changelog updates, and release creation
   - Other supporting workflows

2. **Node.js Scripts**:
   - `scripts/generate-changeset.js`: Creates changeset files from PR metadata
   - `scripts/analyze-changesets.js`: Determines version bump type
   - `scripts/generate-release-notes.js`: Formats release notes from changesets
   - `scripts/bump-version.js`: Updates version numbers in files
   - `scripts/update-changelog.js`: Updates CHANGELOG.md
   - `scripts/update-readme.js`: Updates readme.txt
   - `scripts/update-changelogs.js`: Updates both changelog files
   - `scripts/update-upgrade-notice.js`: Updates upgrade notice section

3. **Utility Modules**:
   - `scripts/utils/env.js`: Environment variable handling
   - `scripts/utils/changesets.js`: Changeset operations

4. **Documentation**:
   - `docs/WORKFLOW_VISUALIZATION.md`: Visual representations of workflows
   - `README.md`: Usage instructions
   - `SUMMARY.md`: Overview of accomplishments
   - `SUGGESTIONS.md`: Improvement tracking

## Goals

1. **Centralize Workflow Definitions**: Maintain workflows in a single location to ensure consistency and reduce duplication
2. **Simplify Adoption**: Make it easy for any WPGraphQL repository to implement these workflows
3. **Ensure Flexibility**: Allow for repository-specific customizations while maintaining core functionality
4. **Minimize Maintenance Overhead**: Updates to workflows should propagate to all repositories without manual intervention
5. **Preserve Documentation**: Ensure that documentation remains accessible and relevant across repositories

## Implementation Options

### Option 1: GitHub Reusable Workflows

GitHub Actions supports [reusable workflows](https://docs.github.com/en/actions/using-workflows/reusing-workflows), which allow workflows to be called from other workflows.

#### Pros:
- Native GitHub feature
- Versioning support
- Clear separation between workflow definition and usage
- Simplified updates (repositories reference specific versions)

#### Cons:
- Limited customization options
- May require refactoring existing workflows
- Inputs/outputs must be carefully defined

### Option 2: Centralized Scripts Repository

Create a separate repository for shared scripts, which other repositories can include as a submodule or via npm/composer.

#### Pros:
- Maximum flexibility
- Scripts can be versioned independently
- Can be used outside of GitHub Actions

#### Cons:
- More complex setup
- Requires additional dependency management
- May introduce synchronization challenges

### Option 3: Hybrid Approach

Use reusable workflows for the GitHub Actions components, and a shared package for the Node.js scripts.

#### Pros:
- Combines benefits of both approaches
- Clear separation of concerns
- Allows for more granular versioning

#### Cons:
- More complex architecture
- Requires maintaining two systems
- Potential for version mismatches

## Recommended Approach: Hybrid

The hybrid approach offers the best balance of maintainability and flexibility:

1. **Create a `wp-graphql-workflows` Repository**:
   - Contains reusable GitHub Actions workflows
   - Houses shared Node.js scripts as an npm package
   - Includes comprehensive documentation

2. **Implement in Consuming Repositories**:
   - Reference reusable workflows in GitHub Actions configurations
   - Install shared scripts via npm/composer
   - Minimal configuration required in each repository

## Implementation Plan

### Phase 1: Preparation (Current Repository)

1. **Refactor Existing Workflows**:
   - Identify and extract repository-specific configurations
   - Create configuration templates
   - Ensure all workflows can accept parameters for customization

2. **Modularize Scripts**:
   - Ensure all scripts are properly modularized (already done)
   - Add configuration options for repository-specific behavior
   - Create a package.json for the scripts directory

3. **Update Documentation**:
   - Document all configuration options
   - Create implementation guides
   - Update workflow visualizations to reflect the new architecture

### Phase 2: Create Shared Infrastructure

1. **Create `wp-graphql-workflows` Repository**:
   - Set up repository structure
   - Migrate reusable workflows
   - Package scripts for distribution
   - Set up versioning and releases

2. **Create Implementation Examples**:
   - Provide example configurations for different repository types
   - Document common customization scenarios
   - Create a quick-start guide

### Phase 3: Implementation in Target Repositories

1. **Implement in Core Repository**:
   - Start with wp-graphql/wp-graphql
   - Migrate to the shared workflows
   - Document the migration process

2. **Implement in Extension Repositories**:
   - Roll out to wp-graphql-smart-cache, wpgraphql-ide, etc.
   - Address any repository-specific challenges
   - Refine the implementation process

3. **Create Onboarding Documentation**:
   - For new repositories
   - For existing repositories without automation
   - For repositories with existing automation

## Configuration Strategy

To make workflows truly reusable, we need a consistent configuration approach:

### Repository Configuration File

Each repository will include a `.wp-graphql-workflows.json` file with repository-specific settings:

```json
{
  "name": "WPGraphQL",
  "type": "plugin",
  "mainFile": "wp-graphql.php",
  "constantsFile": "constants.php",
  "versionConstant": "WPGRAPHQL_VERSION",
  "changelogFiles": [
    "CHANGELOG.md",
    "readme.txt"
  ],
  "releaseAssets": [
    "wp-graphql.zip"
  ],
  "wpOrgSlug": "wp-graphql",
  "buildCommand": "npm run build",
  "customScripts": {
    "preRelease": "npm run docs:build",
    "postRelease": "npm run deploy:docs"
  }
}
```

### Workflow Inputs

Reusable workflows will accept inputs for customization:

```yaml
on:
  workflow_call:
    inputs:
      config_file:
        description: 'Path to configuration file'
        default: '.wp-graphql-workflows.json'
        required: false
        type: string
      release_type:
        description: 'Force a specific release type'
        required: false
        type: string
      skip_build:
        description: 'Skip build step'
        required: false
        type: boolean
```

## Script Package Structure

The shared scripts will be packaged as `@wp-graphql/workflows`:

```
@wp-graphql/workflows/
├── bin/
│   ├── generate-changeset.js
│   ├── analyze-changesets.js
│   └── ...
├── lib/
│   ├── utils/
│   │   ├── changesets.js
│   │   ├── env.js
│   │   └── ...
│   ├── config.js
│   └── ...
├── package.json
└── README.md
```

## Timeline and Milestones

1. **Preparation (2 weeks)**
   - Refactor workflows in current repository
   - Create configuration templates
   - Update documentation

2. **Infrastructure Creation (2 weeks)**
   - Set up wp-graphql-workflows repository
   - Package scripts
   - Create implementation examples

3. **Initial Implementation (1 week per repository)**
   - wp-graphql/wp-graphql
   - wp-graphql/wp-graphql-smart-cache
   - wp-graphql/wpgraphql-ide
   - wp-graphql/wpgraphql-acf

4. **Refinement (Ongoing)**
   - Address feedback
   - Improve documentation
   - Add new features

## Success Metrics

We'll consider this project successful when:

1. All target repositories use the shared workflows
2. New releases can be created with minimal manual intervention
3. Workflow updates can be propagated without breaking changes
4. New repositories can adopt the workflows with minimal effort
5. Documentation is comprehensive and up-to-date

## Next Steps

1. Review this plan with the team
2. Begin refactoring workflows in the current repository:
   - Start with `generate-changeset.yml` to make it reusable
   - Create a configuration reader utility in `scripts/utils/config.js`
   - Update `scripts/utils/changesets.js` to support configuration options

3. Create a prototype of the wp-graphql-workflows repository:
   - Set up basic repository structure
   - Create initial package.json for the npm package
   - Migrate one workflow as a proof of concept

4. Test with a single target repository before full implementation:
   - Choose wp-graphql/wp-graphql as the initial test case
   - Document the migration process in detail
   - Gather feedback and refine the approach

## Repository-Specific Considerations

### wp-graphql/wp-graphql (Core)
- Main plugin with the most complex release process
- Deploys to WordPress.org
- Has extensive documentation that needs to be updated with releases
- Uses a specific version constant (`WPGRAPHQL_VERSION`)

### wp-graphql/wp-graphql-smart-cache
- Extension plugin with its own release cycle
- Has specific cache-related tests that need to run
- Uses a different version constant (`WPGRAPHQL_SMART_CACHE_VERSION`)

### wp-graphql/wpgraphql-ide
- React-based application with different build process
- Not deployed to WordPress.org
- Uses semantic versioning in package.json

### wp-graphql/wpgraphql-acf
- Extension plugin that depends on Advanced Custom Fields
- Requires specific testing with ACF
- Deploys to WordPress.org

## Common Patterns and Differences

### Common Patterns
- All repositories use semantic versioning
- All need changeset generation and release management
- All have some form of changelog
- All use GitHub releases

### Key Differences
- Different version storage mechanisms (constants vs package.json)
- Different build processes
- Different deployment targets
- Different testing requirements
- Different documentation needs

## Reference Information

### Current Workflow Files
- `.github/workflows/generate-changeset.yml`
- `.github/workflows/release-management.yml`

### Current Script Files
- `scripts/generate-changeset.js`
- `scripts/analyze-changesets.js`
- `scripts/generate-release-notes.js`
- `scripts/bump-version.js`
- `scripts/update-changelog.js`
- `scripts/update-readme.js`
- `scripts/update-changelogs.js`
- `scripts/update-upgrade-notice.js`

### Current Utility Modules
- `scripts/utils/env.js`
- `scripts/utils/changesets.js`

### Documentation Files
- `docs/WORKFLOW_VISUALIZATION.md`
- `README.md`
- `SUMMARY.md`
- `SUGGESTIONS.md`

This plan will be updated as we progress through the implementation phases. 