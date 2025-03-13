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
- **update-upgrade-notice.js**: Updates the upgrade notice section in readme.txt
- **build.js**: Builds the plugin for release

## Breaking Change Detection

Breaking changes are automatically detected from:

1. Conventional commit syntax with ! (e.g., "feat!: Add breaking feature")
2. Title prefixed with "BREAKING CHANGE:" or containing "BREAKING CHANGE:"
3. Explicit `breaking: true` flag in changesets

When breaking changes are detected, they are:
- Highlighted in the release notes
- Categorized separately in the changelog
- Automatically added to the upgrade notice section in readme.txt to warn users

## Changelog Formatting

Changelogs are formatted according to WordPress plugin repository standards:

- **readme.txt**: Uses the WordPress plugin repository format
- **CHANGELOG.md**: Uses a more detailed Markdown format with:
  - Categorized changes (breaking changes, features, fixes, other)
  - Links to pull requests
  - Contributors acknowledgment with special recognition for first-time contributors

## Release Notes

Release notes are generated from changesets and include:

- **Categorized Changes**: Breaking changes, features, fixes, and other changes
- **Emoji Icons**: Visual indicators for different change types (⚠️ for breaking changes, ✨ for features, etc.)
- **PR Links**: Full URLs to pull requests for easy reference
- **Contributors Section**: Lists all contributors with special recognition for first-time contributors
- **Automatic Formatting**: Unnecessary lines are removed for cleaner presentation

Release notes can be generated in both Markdown format (for GitHub releases) and JSON format (for programmatic use).

## Release Management

This repository uses an automated release management system based on [changesets](https://github.com/changesets/changesets). The process works as follows:

1. **Automatic Changeset Generation**: Changesets are automatically generated when PRs are merged to the develop branch.
2. **Accumulating Changes**: Changesets accumulate in the develop branch until a release is ready.
3. **Release PR**: A PR from develop to main is created, containing all the changesets.
4. **Automated Release**: When the PR is merged, the release workflow:
   - Bumps the version based on the changesets
   - Updates changelogs
   - Creates a GitHub release with release notes
   - Deletes the processed changesets from main
   - Syncs main back to develop to ensure both branches are in sync

5. **Branch Synchronization**: After a release, the main branch is automatically merged back into develop:
   - This ensures that version bumps and changelog updates are reflected in develop
   - The merge uses a non-fast-forward strategy with a descriptive commit message
   - The commit message includes [skip ci] to prevent triggering additional workflows
   - This keeps both branches in sync and prevents divergence

This ensures a consistent and automated release process with proper versioning and documentation.

For more details on the release process, see [.github/workflows/release-management.md](.github/workflows/release-management.md).

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

# Update upgrade notice in readme.txt
npm run upgrade-notice:update -- --version=1.0.0 --notes-file=release_notes.md
```

## Environment Variables

The scripts support the following environment variables:

- `REPO_URL`: Repository URL to use for PR links (used by `generate-release-notes.js`)
  - This is used to generate full URLs to pull requests in release notes
  - If not provided, the script will attempt to extract it from package.json
  - Example: `https://github.com/wp-graphql/automation-tests`

- `GITHUB_TOKEN`: GitHub token for API requests (used by `generate-release-notes.js` for contributor recognition)
  - This is used to identify first-time contributors (3 or fewer commits)
  - If not provided, the contributors section will still be included but without first-time contributor recognition
  - You can create a personal access token in your GitHub account settings

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
  - `REPO_URL` is used to generate proper links to pull requests in release notes
  - `GITHUB_TOKEN` is used to identify contributor status via the GitHub API
- Simplified configuration by setting values once in the environment
  - Environment variables are set at the job level in GitHub Actions workflows
  - This eliminates the need to pass them as command-line arguments to scripts
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
  - Release notes are generated in a temporary directory outside the repository (`/tmp/release-notes/`)
  - This prevents Git from tracking these temporary files and avoids issues with `.gitignore`
- Automatic PR creation and updating
- Deletion of processed changesets to prevent duplicate changelog entries
- Enhanced release notes formatting with unnecessary lines removed
- Automatic addition of breaking changes to the upgrade notice section
- Comprehensive documentation updates

These improvements make the changeset generation process more reliable, user-friendly, and informative, enhancing the overall development workflow. 

