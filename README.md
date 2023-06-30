# Label to milestone world javascript action

This action assigns milestones to pull-requests based on labels.

## Assumptions

This action assumes that you 
1. want to assign the milestones to represent future releases
2. you release the software on Github in a linear fashion, i.e. the 
   last released version is always the basis for determining the milestone
3. you use [semantic versioning](https://semver.org/)
4. your milestone titles are just the version e.g. `v1.2.3`
5. the milestones you want to assign already exist

## Inputs

### `repo-token`

**Required** The GITHUB_ACTION token.

### `bugfix-tags` (*optional*)

Comma-separated list of pull-request labels to match for targeting a *bugfix milestone*.
By *default* this option is set to `bug,documentation`.

### `minor-tags` (*optional*)

Comma-separated list of pull-request labels to match for targeting a *minor milestone*.
By *default* this option is not set, so no pull-requests are explicitly assigned to
minor milestones. You might use minor milestones as fallback for pull-requests *not*
explicitly assigned. Please see the [`fallback` option](#fallback-optional) for details.

### `major-tags`

**Optional** List of pull-request labels to match for targeting a major milestone.

### `fallback` (*optional*)

**Optional** Fallback target to use if none of the above matches *or* if the milestone is not found.

## Outputs

### `milestone`

The milestone assigned to the pull request. In case of an error or in case the action does not apply a `-` is returned.

## Example usage

```yaml
uses: actions/label-milestone-action@v1.0.0
with:
  repo-token: ${{ secrets.GITHUB_TOKEN }}
```

dsf
