# Automation Tests

This repository contains tests and examples for automating various aspects of WordPress plugin development, including:

- Changeset generation
- Version bumping
- Changelog updates
- Release management

## Scripts

The repository includes several Node.js scripts for automating common tasks:

- **generate-changeset.js**: Creates changeset files for tracking changes
- **generate-release-notes.js**: Generates formatted release notes from changesets
- **analyze-changesets.js**: Analyzes changesets to determine version bump type
- **bump-version.js**: Updates version numbers in plugin files
- **update-changelog.js**: Updates the CHANGELOG.md file with new entries
- **update-readme.js**: Updates the readme.txt file with new entries
- **update-changelogs.js**: Updates both changelog files at once
- **build.js**: Builds the plugin for release

## Breaking Change Detection

Breaking changes are automatically detected from:

1. Conventional commit syntax with ! (e.g., "feat!: Add breaking feature")
2. Title prefixed with "BREAKING CHANGE:" or containing "BREAKING CHANGE:"
3. Explicit `breaking: true` flag in changesets

## Changelog Formatting

Changelogs are formatted according to WordPress plugin repository standards:

- **readme.txt**: Uses the WordPress plugin repository format
- **CHANGELOG.md**: Uses a more detailed Markdown format with:
  - Categorized changes (breaking changes, features, fixes, other)
  - Links to pull requests
  - Contributors acknowledgment with special recognition for first-time contributors

## Workflows

The repository implements several GitHub Actions workflows:

- **Changeset Generation**: Generates changesets when PRs are merged to develop
  - Creates a changeset file for the PR
  - Generates release notes from all changesets
  - Creates or updates a release PR from develop to main
  - Uses temporary files to keep the repository clean
- **Release Management**: Automates version bumping and changelog updates
  - Extracts release notes from PR body when merging to main
  - Creates GitHub releases with proper tagging
- **Deploy**: Handles deployment to various environments

## Development Process

1. Create a feature branch from `develop`
2. Make changes and submit a PR to `develop`
3. When the PR is merged, a changeset is automatically generated
4. The changeset is committed to `develop`
5. A release PR is created or updated from `develop` to `main`
6. When ready for release, merge the release PR to `main`
7. The release management workflow creates a tag and GitHub release
8. The plugin is deployed to the appropriate environments

## Local Testing

You can test the scripts locally:

```bash
# Generate a changeset
npm run changeset:generate -- --title="Add new feature" --pr=123 --author="username" --type="feat"

# Generate release notes
npm run release:notes

# Generate release notes in JSON format
npm run release:notes -- --format=json

# Generate release notes with a specific repository URL for PR links
npm run release:notes -- --repo-url="https://github.com/wp-graphql/automation-tests"

# Generate release notes with contributor recognition (requires GitHub token)
npm run release:notes -- --token="your_github_token"

# Using environment variables instead of command-line arguments
export REPO_URL="https://github.com/wp-graphql/automation-tests"
export GITHUB_TOKEN="your_github_token"
npm run release:notes

# Analyze changesets
npm run changeset:analyze

# Bump version
npm run version:bump -- --type=minor

# Update changelogs
npm run changelogs:update
```

## Environment Variables

The scripts support the following environment variables:

- `REPO_URL`: Repository URL to use for PR links (used by `generate-release-notes.js`)
- `GITHUB_TOKEN`: GitHub token for API requests (used by `generate-release-notes.js` for contributor recognition)

You can set these variables in your environment or in a `.env` file to avoid passing them as command-line arguments each time.

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
│   ├── generate-release-notes.js   # Generate release notes from changesets
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

## Recent Improvements

We've made several significant improvements to the changeset generation workflow:

### 1. Environment Variables Support
- Added support for `REPO_URL` and `GITHUB_TOKEN` environment variables
- Simplified configuration by setting values once in the environment
- Reduced command-line complexity in the GitHub workflow

### 2. Contributor Recognition
- Added a contributors section to release notes
- Special recognition for first-time contributors (3 or fewer commits)
- Uses GitHub API to accurately identify contributor status

### 3. Enhanced Release Notes
- Better formatting with emoji icons for different change types
- Full URLs for pull requests instead of just PR numbers
- Automatic determination of bump type (major, minor, patch)
- Categorization of changes into breaking changes, features, fixes, and other changes

### 4. Improved Workflow
- Cleaner GitHub workflow configuration
- Better error handling and fallbacks
- Direct file processing instead of relying on external scripts
- Use of temporary files to keep the repository clean
- Automatic PR creation and updating
- Comprehensive documentation updates

These improvements make the changeset generation process more reliable, user-friendly, and informative, enhancing the overall development workflow. 

