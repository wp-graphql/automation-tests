# Workflow Visualizations

This document provides visual representations of the automation workflows used in this repository. These diagrams help to understand how the different components interact and the flow of operations during the release process.

## Overall Release Process

```mermaid
flowchart TD
    PR[Pull Request] -->|Merged to develop| GC[Generate Changeset]
    GC -->|Creates| CS[Changeset File]
    CS -->|Accumulates in| DEV[Develop Branch]
    DEV -->|PR created to main| RPR[Release PR]
    RPR -->|Merged to main| RM[Release Management]
    RM -->|Determines| VB[Version Bump]
    RM -->|Generates| RN[Release Notes]
    VB -->|Updates| VF[Version in Files]
    RN -->|Updates| CL[Changelogs]
    VF --> TAG[Create Tag]
    CL --> TAG
    TAG -->|Triggers| DEP[Deployment]
    DEP -->|Creates| GHR[GitHub Release]
    DEP -->|Deploys to| WP[WordPress.org]
    RM -->|Syncs changes back to| DEV
```

## Changeset Generation Workflow

```mermaid
flowchart TD
    PR[Pull Request] -->|Merged to develop| GCW[Generate Changeset Workflow]
    GCW -->|Extracts| PRM[PR Metadata]
    PRM -->|Passes to| GCS[generate-changeset.js]
    GCS -->|Uses| CU[changesets.js Utility]
    CU -->|Creates| CSF[Changeset File]
    CSF -->|Stored in| CSD[.changesets Directory]
    GCW -->|Generates| RN[Release Notes]
    RN -->|Checks for| EPR[Existing Release PR]
    EPR -->|Yes| UPR[Update PR Body]
    EPR -->|No| CPR[Create New PR]
    UPR --> END[End]
    CPR --> END
```

## Release Management Workflow

```mermaid
flowchart TD
    RPR[Release PR] -->|Merged to main| RMW[Release Management Workflow]
    RMW -->|Checks out| CODE[Code]
    CODE -->|Checks for| CS[Changesets]
    CS -->|Yes| PARALLEL[Parallel Execution]
    PARALLEL -->|Task 1| GRN[Generate Release Notes]
    PARALLEL -->|Task 2| DVB[Determine Version Bump]
    GRN -->|Creates| RN[Release Notes File]
    DVB -->|Updates| VF[Version in Files]
    RN --> UCL[Update Changelogs]
    VF --> UCL
    UCL -->|Commits changes to| MAIN[Main Branch]
    MAIN -->|Creates| TAG[Git Tag]
    TAG -->|Creates| GHR[GitHub Release]
    MAIN -->|Deletes| CS
    MAIN -->|Syncs back to| DEV[Develop Branch]
```

## Deployment Workflow

```mermaid
flowchart TD
    TAG[Git Tag] -->|Triggers| DW[Deployment Workflow]
    DW -->|Checks out| CODE[Code]
    CODE -->|Builds| PKG[Plugin Package]
    PKG -->|Creates| ZIP[ZIP File]
    ZIP -->|Uploads to| GHR[GitHub Release]
    ZIP -->|Deploys to| SVN[WordPress.org SVN]
    SVN -->|Available on| WP[WordPress.org]
```

## Script Dependencies

```mermaid
flowchart TD
    GCS[generate-changeset.js] -->|Uses| CU[changesets.js Utility]
    GCS -->|Uses| EU[env.js Utility]
    ACS[analyze-changesets.js] -->|Uses| CU
    GRNS[generate-release-notes.js] -->|Uses| CU
    GRNS -->|Uses| EU
    BV[bump-version.js] -->|Uses| EU
    UCL[update-changelog.js] -->|Uses| CU
    UR[update-readme.js] -->|Uses| CU
    UCS[update-changelogs.js] -->|Uses| UCL
    UCS -->|Uses| UR
    UUN[update-upgrade-notice.js] -->|Uses| CU
    UUN -->|Uses| EU
```

## Data Flow

```mermaid
flowchart LR
    PR[PR Metadata] -->|Input to| GCS[generate-changeset.js]
    GCS -->|Creates| CSF[Changeset Files]
    CSF -->|Read by| GRNS[generate-release-notes.js]
    CSF -->|Analyzed by| ACS[analyze-changesets.js]
    ACS -->|Determines| BT[Bump Type]
    BT -->|Input to| BV[bump-version.js]
    GRNS -->|Generates| RN[Release Notes]
    RN -->|Input to| UCL[update-changelog.js]
    RN -->|Input to| UR[update-readme.js]
    RN -->|Input to| UUN[update-upgrade-notice.js]
```

## Parallel Execution in Release Management

```mermaid
gantt
    title Release Management Workflow
    dateFormat  YYYY-MM-DD
    section Preparation
    Checkout Code           :a1, 2023-01-01, 1d
    Setup Node.js           :a2, after a1, 1d
    Install Dependencies    :a3, after a2, 1d
    Check for Changesets    :a4, after a3, 1d
    section Parallel Tasks
    Generate Release Notes  :b1, after a4, 2d
    Determine Version Bump  :b2, after a4, 2d
    section Finalization
    Update Changelogs       :c1, after b1 b2, 1d
    Commit Changes          :c2, after c1, 1d
    Create Tag              :c3, after c2, 1d
    Create GitHub Release   :c4, after c3, 1d
    Delete Changesets       :c5, after c4, 1d
    Sync to Develop         :c6, after c5, 1d
```

## Error Handling Strategy

```mermaid
flowchart TD
    START[Start Workflow] --> CHECK[Check Inputs]
    CHECK -->|Valid| EXEC[Execute Task]
    CHECK -->|Invalid| ERR1[Report Error]
    EXEC -->|Success| NEXT[Next Step]
    EXEC -->|API Error| RATE[Check Rate Limits]
    RATE -->|Limited| WARN[Log Warning]
    WARN --> ALT[Try Alternative Method]
    RATE -->|Not Limited| RETRY[Retry Operation]
    EXEC -->|Other Error| LOG[Log Error Details]
    LOG --> ALT
    ALT -->|Success| NEXT
    ALT -->|Failure| FALL[Use Fallback]
    RETRY -->|Success| NEXT
    RETRY -->|Failure| FALL
    FALL -->|Success| NEXT
    FALL -->|Failure| ERR2[Report Fatal Error]
    ERR1 --> END[End Workflow]
    ERR2 --> END
    NEXT --> CLEAN[Cleanup Resources]
    CLEAN --> END
```

## Utility Module Usage

```mermaid
flowchart TD
    subgraph "Utility Modules"
        ENV[env.js]
        CS[changesets.js]
    end
    
    subgraph "Scripts"
        GCS[generate-changeset.js]
        ACS[analyze-changesets.js]
        GRNS[generate-release-notes.js]
        BV[bump-version.js]
        UCL[update-changelog.js]
        UR[update-readme.js]
        UCS[update-changelogs.js]
        UUN[update-upgrade-notice.js]
    end
    
    ENV -->|getEnvVar| GCS
    ENV -->|getEnvVar| GRNS
    ENV -->|getBoolEnvVar| BV
    ENV -->|getNumEnvVar| UUN
    
    CS -->|createChangeset| GCS
    CS -->|readAllChangesets| ACS
    CS -->|determineBumpType| ACS
    CS -->|categorizeChangesets| ACS
    CS -->|readAllChangesets| GRNS
    CS -->|determineBumpType| GRNS
    CS -->|categorizeChangesets| GRNS
    CS -->|readAllChangesets| UCL
    CS -->|readAllChangesets| UUN
```

## Branch Strategy

```mermaid
gitGraph
    commit id: "Initial commit"
    branch develop
    checkout develop
    commit id: "Feature 1"
    commit id: "Feature 2"
    commit id: "Generate changeset for Feature 2"
    commit id: "Feature 3"
    commit id: "Generate changeset for Feature 3"
    checkout main
    merge develop
    commit tag: "v1.0.0" id: "v1.0.0"
    checkout develop
    merge main id: "Sync v1.0.0 back to develop"
    commit id: "Feature 4"
    commit id: "Generate changeset for Feature 4"
    checkout main
    merge develop
    commit tag: "v1.1.0" id: "v1.1.0"
    checkout develop
    merge main id: "Sync v1.1.0 back to develop"
```

## Standard Workflow

```mermaid
graph TD
    A[Feature Branch] -->|Create PR| B[develop]
    B -->|Merge PR| C[Generate Changeset]
    C -->|Commit Changeset| B
    B -->|Create/Update PR| D[main]
    D -->|Merge PR| E[Release Management]
    E -->|Version Bump| F[Create Tag]
    F -->|Push Tag| G[Deploy]
    G -->|Create GitHub Release| H[WordPress.org SVN]
    E -->|Sync Changes| B
```

## Milestone Branch Workflow

```mermaid
graph TD
    A[Feature Branch 1] -->|Create PR| B[milestone/feature]
    C[Feature Branch 2] -->|Create PR| B
    D[Feature Branch 3] -->|Create PR| B
    B -->|Merge PR| E[Generate Changeset]
    E -->|Commit Changeset| B
    B -->|Create/Update PR with title "milestone: feature-name 🚀"| F[develop]
    F -->|Merge PR| G[Generate Changeset]
    G -->|Commit Changeset| F
    F -->|Create/Update PR| H[main]
    H -->|Merge PR| I[Release Management]
    I -->|Version Bump| J[Create Tag]
    J -->|Push Tag| K[Deploy]
    K -->|Create GitHub Release| L[WordPress.org SVN]
    I -->|Sync Changes| F
```

## Milestone Branch Integration

```mermaid
sequenceDiagram
    participant FB as Feature Branches
    participant MB as Milestone Branch
    participant GH as GitHub Actions
    participant MS as GitHub Milestone
    participant PR as Milestone PR
    participant D as develop
    
    FB->>MB: Create PRs
    MB->>GH: Merge PRs
    GH->>MB: Generate changesets
    GH->>MS: Update progress
    GH->>PR: Update PR to develop
    MB->>D: Merge when complete
    Note over D,GH: No new changeset generated for milestone PR
    D->>GH: Include milestone changes in next release
```

This diagram shows how feature branches are merged into a milestone branch, which generates changesets. When the milestone branch is merged to develop, no new changeset is generated since all changes already have their own changesets. The existing changesets are included in the develop branch and will be part of the next release.

## Complete Workflow with Milestone Branches

```mermaid
graph TD
    A[Feature Branch] -->|Create PR| B[develop]
    C[Feature Branch 1] -->|Create PR| D[milestone/feature]
    E[Feature Branch 2] -->|Create PR| D
    F[Feature Branch 3] -->|Create PR| D
    
    B -->|Merge PR| G[Generate Changeset for develop]
    D -->|Merge PR| H[Generate Changeset for milestone]
    
    G -->|Commit Changeset| B
    H -->|Commit Changeset| D
    
    D -->|Create/Update PR| B
    B -->|Create/Update PR| I[main]
    
    I -->|Merge PR| J[Release Management]
    J -->|Version Bump| K[Create Tag]
    K -->|Push Tag| L[Deploy]
    L -->|Create GitHub Release| M[WordPress.org SVN]
    J -->|Sync Changes| B
```

These visualizations provide a comprehensive overview of how the different components of the automation system interact. They can be especially helpful for new contributors to understand the workflow and for maintainers to identify potential areas for improvement. 