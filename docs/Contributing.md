# Contributing

Thanks for your interest in contributing! This document describes how you can contribute to the project.

## New features
Before starting work on a new feature, open an issue to discuss the idea and get feedback. This helps ensure alignment with project goals.
The new feature must also comply with the following rules:
- Keep dependencies minimal and lightweight.
- Ensure compatibility with existing features and configurations.
- If a feature improves functionality in one case but worsens it in another, or if it is optional, create a toggle in the `settings.json` file.
- The code must comply with the code style of the entire project.
- Test the feature on different environments if applicable.

## Bug fixes
When fixing bugs, please:
- Reproduce the issue and understand its root cause.
- Create a PR that includes a test case demonstrating the bug and its fix.
- Ensure the fix does not introduce new issues or regressions.

## Translating
Information about translating the project into other languages ​​is available in the [docs/Translating.md](Translating.md) file.

## Code style and testing
There are no plans to create tests, CI/CD or completely update the code style. PRs with such changes will be rejected.
The project's goal is to be lightweight and simple, and there's no need to overload it with CI/CD or code style changes.

## Issues
Open issues for bugs or feature requests with steps to reproduce and expected vs actual behavior.
