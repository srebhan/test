# Label to milestone world javascript action

This action assigns milestones to pull-requests based on labels.

## Assumptions

This action assumes that you 
1. want to assign the milestones to represent future releases
2. you release the software on Github in a linear fashion, i.e. the 
   last released version is always the basis for determining the milestone
3. you use [semantic versioning](https://semver.org/)
4. your milestone titles are just the version e.g. `v1.2.3`

## Inputs

### `repo-token`

**Required** The GITHUB_ACTION token.

### `bugfix-tags`

**Optional** List of pull-request labels to match for targeting a bugfix milestone.

### `minor-tags`

**Optional** List of pull-request labels to match for targeting a minor milestone.

### `major-tags`

**Optional** List of pull-request labels to match for targeting a major milestone.

### `fallback`

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

## Description

lala
s
