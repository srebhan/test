# Label to milestone world javascript action

This action assigns milestones to pull-requests based on labels

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

**Optional** List of pull-request labels to match for targeting a major milestone.

## Outputs

### `milestone`

A description

## Example usage

```yaml
uses: actions/label-milestone-action@v1.0.0
```
