# Deployment Workflow

This document outlines the requirements and implementation details for the Deployment workflow.

## Overview

The Deployment workflow is triggered after a release PR is merged to the `main` branch. It handles creating a GitHub release, deploying the plugin to WordPress.org, and uploading the plugin zip to the GitHub release.

## Workflow Triggers

- Push to `main` branch (after release PR is merged)
- Tag creation (e.g., `v1.2.3`)

## Workflow Steps

### 1. Build Plugin

- Checkout the code
- Install dependencies
- Run build scripts
- Create plugin zip file

### 2. Create GitHub Release

- Create a new GitHub release with the version tag
- Upload the plugin zip to the release
- Include changelog in release notes
- Highlight breaking changes with prominent warnings
- Include full links to PRs in the changelog
- Categorize changes by type (breaking changes, features, bug fixes)

### 3. Deploy to WordPress.org

- Checkout WordPress.org SVN repository
- Copy built plugin files to SVN
- Update `readme.txt` and other metadata
- Commit to WordPress.org SVN

## GitHub Action Implementation

```yaml
name: Deploy to WordPress.org and GitHub

on:
  push:
    branches:
      - main
    tags:
      - 'v*'

jobs:
  build:
    name: Build Plugin
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
        with:
          fetch-depth: 0
          
      - name: Setup PHP
        uses: shivammathur/setup-php@v2
        with:
          php-version: '7.4'
          tools: composer
          
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '16'
          
      - name: Install dependencies
        run: |
          composer install --no-dev --optimize-autoloader
          npm ci
          
      - name: Build plugin
        run: |
          # Run build scripts
          npm run build
          
      - name: Create plugin zip
        run: |
          # Create a clean build directory
          mkdir -p build
          
          # Copy plugin files to build directory
          rsync -av --exclude={'.git*','.github','.editorconfig','node_modules','tests','build'} ./ build/
          
          # Create zip file
          cd build
          zip -r ../automation-tests.zip .
          cd ..
          
      - name: Upload artifact
        uses: actions/upload-artifact@v3
        with:
          name: plugin-zip
          path: automation-tests.zip

  github-release:
    name: Create GitHub Release
    needs: build
    runs-on: ubuntu-latest
    if: startsWith(github.ref, 'refs/tags/v')
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
          
      - name: Download artifact
        uses: actions/download-artifact@v3
        with:
          name: plugin-zip
          
      - name: Get version from tag
        id: get_version
        run: echo "::set-output name=version::${GITHUB_REF#refs/tags/v}"
          
      - name: Extract changelog
        id: changelog
        run: |
          # Extract changelog for this version
          # This would be a script to parse CHANGELOG.md
          
      - name: Create GitHub Release
        uses: softprops/action-gh-release@v1
        with:
          files: automation-tests.zip
          body: |
            ## Automation Tests v${{ steps.get_version.outputs.version }}
            
            ${{ steps.changelog.outputs.content }}
          
  wordpress-org:
    name: Deploy to WordPress.org
    needs: build
    runs-on: ubuntu-latest
    if: startsWith(github.ref, 'refs/tags/v')
    steps:
      - name: Download artifact
        uses: actions/download-artifact@v3
        with:
          name: plugin-zip
          
      - name: Unzip plugin
        run: unzip automation-tests.zip -d plugin
          
      - name: WordPress Plugin Deploy
        uses: 10up/action-wordpress-plugin-deploy@stable
        env:
          SVN_PASSWORD: ${{ secrets.SVN_PASSWORD }}
          SVN_USERNAME: ${{ secrets.SVN_USERNAME }}
          SLUG: automation-tests
        with:
          source-dir: plugin
```

## Considerations and Next Steps

### WordPress.org Deployment

- Set up WordPress.org SVN credentials as GitHub secrets
- Ensure `readme.txt` meets WordPress.org requirements
- Consider handling assets (banner, icon) for WordPress.org plugin page

### GitHub Release

- Determine format for release notes
- Consider automating release note generation from changesets
- Plan for handling release candidates or beta releases

### Security

- Ensure sensitive credentials are stored as GitHub secrets
- Consider implementing code signing for releases

### Testing

- Add pre-deployment tests to ensure plugin quality
- Consider implementing automated testing in the workflow

### Notifications

- Set up notifications for successful/failed deployments
- Consider integrating with Slack or other communication tools

## Required Secrets

- `SVN_USERNAME`: WordPress.org SVN username
- `SVN_PASSWORD`: WordPress.org SVN password
- `GITHUB_TOKEN`: Automatically provided by GitHub Actions 