# Milestone Branch Workflow

This document outlines the requirements and implementation details for the Milestone Branch workflow.

## Overview

The Milestone Branch workflow allows for the development of larger features that span multiple PRs. It provides a way to collect changesets for a specific feature or milestone while keeping them separate from the main development branch until the feature is complete.

## Branch Naming Convention

Milestone branches follow this naming convention:

```
milestone/feature-name
```

For example:
- `milestone/custom-scalars`
- `milestone/media-refactor`
- `milestone/new-api`

The feature name should use kebab-case (lowercase with hyphens).

## Workflow Steps

The workflow consists of the following steps:

1. **Create Milestone Branch**: Create a branch with the `milestone/` prefix for your feature.
2. **Create GitHub Milestone**: Create a GitHub Milestone with the same name as your feature.
3. **Create Issues**: Create issues for each part of the implementation and assign them to the GitHub Milestone.
4. **Create PRs**: As you implement each part, create PRs against the milestone branch.
5. **Collect Changesets**: Each merged PR automatically generates a changeset in the milestone branch.
6. **Track Progress**: A PR from the milestone branch to develop is automatically created/updated with:
   - A list of all changes (from changesets)
   - Progress information from the GitHub Milestone
   - Links to the Milestone for more details
7. **Final Merge**: When the milestone is complete, merge the milestone branch to develop.

## Changeset Generation

When a PR is merged to a milestone branch, the changeset generation workflow:

1. Detects that the target branch is a milestone branch
2. Generates a changeset with branch information
3. Commits the changeset to the milestone branch
4. Generates release notes for the milestone branch
5. Creates or updates a PR from the milestone branch to develop

## Milestone PR Management

The workflow automatically creates and maintains a PR from the milestone branch to the develop branch:

1. **PR Title**: `milestone: feature-name 🚀`
2. **PR Body**: Contains:
   - Milestone information and progress
   - Link to the GitHub Milestone
   - List of changes from changesets
   - Explanation of the milestone

This PR serves as a preview of what will be merged to develop when the milestone is complete.

## GitHub Milestone Integration

The workflow integrates with GitHub Milestones:

1. **Milestone Assignment**: PRs targeting the milestone branch are automatically assigned to the corresponding GitHub Milestone.
2. **Progress Tracking**: The milestone PR includes progress information from the GitHub Milestone (e.g., "5/10 issues completed (50%)").
3. **Milestone Links**: The milestone PR includes links to the GitHub Milestone for more details.

## Changeset Handling

When a milestone branch is eventually merged to develop:

1. All changesets from the milestone branch are included in the develop branch.
2. The existing develop workflow kicks in, updating the PR from develop to main with all changesets.
3. The changesets maintain their original metadata, including the branch they were created in.

This ensures that the release notes for the next release include all changes, whether they came from direct PRs to develop or from milestone branches.

## Example Workflow

Here's an example of how to use the milestone branch workflow:

1. **Create a Milestone Branch**:
   ```bash
   git checkout develop
   git pull
   git checkout -b milestone/custom-scalars
   git push -u origin milestone/custom-scalars
   ```

2. **Create a GitHub Milestone**:
   - Go to GitHub > Issues > Milestones > New Milestone
   - Title: "custom-scalars"
   - Description: "Implement custom scalar types for GraphQL schema"
   - Due date: (optional)
   - Click "Create milestone"

3. **Create Issues**:
   - Create issues for each part of the implementation
   - Assign them to the "custom-scalars" milestone
   - Example issues:
     - "Implement DateTime scalar"
     - "Implement Email scalar"
     - "Implement Color scalar"

4. **Create PRs**:
   - Implement each part in a separate branch
   - Create PRs targeting the `milestone/custom-scalars` branch
   - Example PR titles:
     - "feat: Implement DateTime scalar"
     - "feat: Implement Email scalar"
     - "feat: Implement Color scalar"

5. **Review and Merge PRs**:
   - Review and merge PRs to the milestone branch
   - Each merged PR automatically generates a changeset
   - The milestone PR to develop is automatically updated

6. **Complete the Milestone**:
   - When all issues are resolved, merge the milestone PR to develop
   - The develop branch now includes all changes from the milestone
   - The existing develop workflow updates the PR from develop to main

## Benefits

The milestone branch workflow provides several benefits:

1. **Feature Isolation**: Develop large features in isolation without affecting the main development branch.
2. **Progress Tracking**: Track progress of large features using GitHub Milestones.
3. **Changeset Collection**: Collect changesets for a specific feature or milestone.
4. **Preview Changes**: Preview what will be merged to develop when the milestone is complete.
5. **Collaborative Development**: Allow multiple developers to work on different parts of the same feature.
6. **Detailed Release Notes**: Generate detailed release notes for the milestone.

## Considerations

When using the milestone branch workflow, consider the following:

1. **Branch Synchronization**: Regularly sync the milestone branch with develop to avoid divergence.
2. **Milestone Scope**: Keep milestones focused on a specific feature or set of related changes.
3. **PR Size**: Even within a milestone, keep PRs small and focused for easier review.
4. **Documentation**: Document the milestone's purpose and scope in the GitHub Milestone description.
5. **Testing**: Thoroughly test the milestone branch before merging to develop.

## GitHub Action Implementation

The milestone branch workflow is implemented in the `generate-changeset.yml` workflow:

```yaml
name: Generate Changeset

on:
  pull_request_target:
    types: [closed]
    branches:
      - develop
      - 'milestone/**'  # Support for milestone branches
  workflow_dispatch:
    # ...

jobs:
  generate-changeset:
    # ...
    steps:
      # ...
      - name: Determine target branch
        id: target_branch
        run: |
          # Check if this is a milestone branch
          if [[ "${TARGET_BRANCH}" == milestone/* ]]; then
            echo "is_milestone=true" >> $GITHUB_OUTPUT
            # Extract milestone name from branch name
            MILESTONE_NAME=$(echo "${TARGET_BRANCH}" | sed 's/^milestone\///')
            echo "milestone_name=${MILESTONE_NAME}" >> $GITHUB_OUTPUT
          else
            echo "is_milestone=false" >> $GITHUB_OUTPUT
          fi
      
      # Generate changeset with branch information
      - name: Generate changeset for current PR
        run: |
          node scripts/generate-changeset.js \
            --pr="${{ steps.pr_info.outputs.pr_number }}" \
            --title="${{ steps.pr_info.outputs.pr_title }}" \
            --author="${{ steps.pr_info.outputs.pr_author }}" \
            --body="${{ steps.pr_info.outputs.pr_body }}" \
            --branch="${{ steps.target_branch.outputs.name }}"
      
      # For milestone branches, create/update PR to develop
      - name: Create/Update milestone PR to develop
        if: steps.target_branch.outputs.is_milestone == 'true'
        # ...
```

## Next Steps and Considerations

- Create GitHub Milestones for each milestone branch
- Regularly sync milestone branches with develop
- Consider adding a workflow to automatically create milestone branches and GitHub Milestones
- Add support for milestone branch deletion after merging to develop
- Consider adding a workflow to automatically close GitHub Milestones when the milestone branch is merged to develop 