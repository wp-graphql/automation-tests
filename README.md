# Automation Tests

This is a test repository for experimenting with GitHub Workflows for WordPress plugin development and release management.

## Overview

This repository serves as a testing ground for GitHub Actions workflows before implementing them in production repositories like WPGraphQL. The goal is to create a set of reusable workflows that can be adapted for use across multiple WordPress plugin repositories.

## Workflows

The following workflows are implemented:

- **[Semantic PR Titles](.github/workflows/semantic-pr-titles.yml)**: Ensures pull request titles follow semantic conventions (feat, fix, etc.)
- **[Changeset Generation](.github/workflows/generate-changeset.yml)**: Generates changesets when PRs are labeled with 'ready-for-changeset'
- **[Release Management](.github/workflows/release-management.yml)**: Collects changesets and prepares releases
- **[Create Tag](.github/workflows/create-tag.yml)**: Creates a tag when a release PR is merged to main
- **[Deployment](.github/workflows/deploy.yml)**: Deploys plugin to WordPress.org and creates GitHub releases

## Scripts

All workflow logic is also available as Node.js scripts that can be run locally:

| Script | Description | Example Usage |
|--------|-------------|---------------|
| `npm run changeset:generate` | Generate a new changeset file | `npm run changeset:generate -- --pr=123 --title="feat: Add new feature"` or with breaking change `npm run changeset:generate -- --pr=123 --title="BREAKING CHANGE: Refactor API"` |
| `npm run changeset:analyze` | Analyze changesets and determine bump type | `npm run changeset:analyze` or `npm run changeset:analyze -- --verbose` |
| `npm run version:bump` | Bump version in constants.php | `npm run version:bump -- --type=minor` or `npm run version:bump` (auto-detects type) |
| `npm run changelogs:update` | Update both CHANGELOG.md and readme.txt | `npm run changelogs:update -- --version=1.2.0` |
| `npm run changelog:update` | Update only CHANGELOG.md | `npm run changelog:update -- --version=1.2.0` |
| `npm run readme:update` | Update only readme.txt | `npm run readme:update -- --version=1.2.0` |
| `npm run build` | Build the project | `npm run build` |
| `npm run release:prepare` | Run version bump and update changelogs | `npm run release:prepare -- --version=1.2.3` |

## Breaking Change Detection

Breaking changes are automatically detected from:

1. Conventional commit syntax with ! (e.g., "feat!: Add breaking feature")
2. Title prefixed with "BREAKING CHANGE:" or "BREAKING-CHANGE:"
3. Description containing "BREAKING CHANGE:" or "BREAKING-CHANGE:"
4. Explicit `--breaking=true` flag when generating a changeset

The explicit `breaking` field in the changeset takes precedence over automatic detection. This allows for manual overrides when needed.

## Changelog Formatting

The changelog generation process:

- Highlights breaking changes with prominent warnings
- Includes full links to PRs (e.g., `https://github.com/username/repo/pull/123`)
- Categorizes changes by type (breaking changes, features, bug fixes)
- Adds upgrade notice section for breaking changes in `readme.txt`

## Workflow Documentation

Detailed documentation for each workflow can be found in the [.github/workflows](.github/workflows) directory:

- [Changeset Generation](.github/workflows/changeset-generation.md)
- [Release Management](.github/workflows/release-management.md)
- [Deployment](.github/workflows/deployment.md)

## Development Process

1. Contributors open pull requests from forks to the `develop` branch
2. PR titles are validated using the Semantic PR Titles workflow
3. When a PR is ready, the 'ready-for-changeset' label is added to trigger the Changeset Generation workflow
4. The workflow creates a changeset file and commits it to the `develop` branch
5. Changesets accumulate in the `develop` branch
6. The Release Management workflow collects changesets and creates a release PR
7. When the release PR is merged to `main`, the Create Tag workflow creates a tag
8. The Deployment workflow is triggered by the tag and deploys the plugin to WordPress.org and creates a GitHub release

## Directory Structure

```
.
├── .github/
│   └── workflows/
│       ├── semantic-pr-titles.yml  # Validates PR titles
│       ├── generate-changeset.yml  # Generates changesets
│       ├── release-management.yml  # Prepares releases
│       ├── create-tag.yml          # Creates tags
│       ├── deploy.yml              # Deploys plugin
│       └── README.md               # Workflow documentation
├── .changesets/                    # Stores changesets
│   └── archive/                    # Archives processed changesets
├── scripts/                        # Node.js scripts
│   ├── generate-changeset.js       # Generate changeset file
│   ├── analyze-changesets.js       # Analyze changesets and determine bump type
│   ├── bump-version.js             # Bump version numbers
│   ├── update-changelog.js         # Update CHANGELOG.md
│   ├── update-readme.js            # Update readme.txt
│   └── build.js                    # Build plugin zip
├── automation-tests.php            # Main plugin file
├── constants.php                   # Plugin constants
├── CHANGELOG.md                    # Changelog
└── readme.txt                      # WordPress.org readme
```

## Contributing

This is a test repository for workflow development. If you have suggestions for improvements, please open an issue or pull request.

## License

This project is licensed under the GPL v2 or later. 

