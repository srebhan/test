const core = require('@actions/core');
const github = require('@actions/github');

// most @actions toolkit packages have async methods
async function run() {
    try {
        // Get the configuration options
        const token = core.getInput('repo-token', { required: true });
        const bugfix = core.getInput('bugfix-tags').split(',');
        const minor = core.getInput('minor-tags').split(',');
        const major = core.getInput('major-tags').split(',');
        const fallback = core.getInput('fallback');

        const context = github.context;

        // Get the pull-request event information
        if (!context.payload.pull_request) {
            core.debug(`Not a pull-request event: ${context}`);
            core.setOutput('milestone', '-');
            return;
        }

        // Check the config options
        if (fallback !== undefined && not['', 'bugfix', 'minor', 'major'].includes(fallback)) {
            core.setFailed('Invalid "fallback"; has to be "bugfix", "minor", "major" or unset!');
        }

        // Determine the target version
        const labels = context.payload.pull_request.labels;
        let target;
        if (labels.some(l => bugfix.includes(l))) {
            target = "bugfix";
        } else if (labels.some(l => minor.includes(l))) {
            target = "minor";
        } else if (labels.some(l => major.includes(l))) {
            target = "major";
        } else if (fallback !== undefined && fallback !== '') {
            target = fallback;
        }
        core.debug(`Targeting milestone ${target}`);

        if (target === undefined) {
            core.debug(`Non of the labels match: ${labels}`);
            core.setOutput('milestone', '-');
            return;
        }

        const octokit = github.getOctokit(token);

        // Get the latest release and bump the version
        const latest = octokit.rest.repos.getLatestRelease(context.repo)
        core.debug(`latest release: ${latest}`);
        if (latest == '') {
            core.info(`No release found...`);
            core.setOutput('milestone', '-');
            return;
        }
        const version = await(bumpVersion(latest, target));

        // Try to get the milestones and check if we have the correct one
        const milestones = octokit.rest.issues.listMilestones({
            owner: context.owner,
            repo: context.repo,
            state: 'open',
        })
        const mslist = JSON.stringify(github.context.payload, undefined, 2)

        core.debug(`Milestones: ${mslist}`)

        let milestone = ""
        core.setOutput('milestone', version);
    } catch (error) {
        core.setFailed(error.message);
    }
}

async function bumpVersion(before, target) {
    const version = before.replace(/^v/, '').split('.').map(x => parseInt(x, 10));

    switch (target) {
        case 'bugfix':
            version[2] += 1
            break;
        case 'minor':
            version[1] += 1
            break;
        case 'major':
            version[0] += 1
            break;
    }
    return 'v' + version.join('.')
}

run();