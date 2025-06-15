# Contributing to Priority CMS

Thank you for your interest in contributing to Priority CMS! This document provides guidelines and instructions for contributing to the project.

## Git Workflow

Priority CMS follows a Git Flow-inspired branching strategy:

```
main (or master) ─────────────────────────────────────
    │                                    │
    └── develop ───────────────────────┐ │
         │                             │ │
         ├── feature/roadmap ──────────┘ │
         │                               │
         ├── feature/fastapi-backend     │
         │                               │
         └── feature/templates           │
                                         │
                                         v
                                      release
                                         │
                                         v
                                  client-website
```

### Branch Purposes:
- **main**: Stable production code
- **develop**: Integration branch for features
- **feature/xxx**: Individual feature branches
- **release**: Pre-production testing
- **client-website**: Stable branch for client website

## Getting Started

### Initial Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/Priority-CMS.git
   cd Priority-CMS
   ```

2. Create a new branch for your work:
   ```bash
   git checkout -b feature/your-feature-name
   ```

### Getting Updates from Main

To keep your feature branch up-to-date with the latest changes from main:

```bash
# Make sure you're on your feature branch
git checkout feature/your-feature-name

# Fetch latest changes
git fetch origin

# Merge changes from main
git merge origin/main

# Resolve any conflicts if they occur

# Continue working on your feature
```

Alternatively, you can use rebase instead of merge:

```bash
git checkout feature/your-feature-name
git fetch origin
git rebase origin/main
# Resolve conflicts if any
```

## Making Changes

1. Make your changes in your feature branch
2. Commit your changes with descriptive commit messages:
   ```bash
   git add .
   git commit -m "Brief description of your changes"
   ```
3. Push your changes to the remote repository:
   ```bash
   git push -u origin feature/your-feature-name
   ```
4. Create a pull request to merge your changes into the develop branch

## Commit Message Guidelines

Write clear, concise commit messages that describe what the commit does. Use the imperative mood ("Add feature" not "Added feature").

Good examples:
- "Add user authentication feature"
- "Fix login form validation bug"
- "Update README with new installation instructions"

## Pull Request Process

1. Ensure your code follows the project's coding standards
2. Update documentation if necessary
3. Make sure all tests pass
4. Request a review from a project maintainer
5. Address any feedback from the review

## Client Website Branch

For maintaining a stable client website while continuing development:

1. Create a branch from the current stable state:
   ```bash
   git checkout main
   git checkout -b client-website
   ```

2. Cherry-pick essential features:
   ```bash
   # Cherry-pick specific commits
   git cherry-pick <commit-hash>
   ```

3. For urgent fixes to the client website:
   ```bash
   # Create hotfix branch from client-website
   git checkout client-website
   git checkout -b hotfix/issue-description
   
   # Make fixes, then merge back
   git checkout client-website
   git merge hotfix/issue-description
   
   # Also merge to main to keep it updated
   git checkout main
   git merge hotfix/issue-description
   ```

## Questions?

If you have any questions about contributing, please reach out to the project maintainers.
