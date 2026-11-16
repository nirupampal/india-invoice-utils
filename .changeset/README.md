# Changesets

Run `npx changeset` for user-facing changes. Choose a semver level and describe
the observable behavior. Commit the generated Markdown file with the change.
The release workflow opens a Version Packages PR. Merging it publishes the
new version using the configured npm credentials and provenance.

The initial package version is 0.1.0; no artificial changeset is needed for its
first publication. Confirm npm name availability before enabling release CI.
