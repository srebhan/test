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

        // Check the pull-request event information
        core.debug(`Checking for pull-request...`);
        if (!context.payload.pull_request) {
            const out = JSON.stringify(context.payload, undefined, 2)
            core.debug(`Not a pull-request event: ${out}`);
            core.setOutput('milestone', '-');
            return;
        }
        const pull_request = context.payload.pull_request
        if (pull_request.milestone) {
            const out = JSON.stringify(context.payload.pull_request, undefined, 2)
            core.info(`Pull-request already has milestone: ${pull_request.milestone.title}`);
            core.setOutput('milestone', '-');
            return;
        }

        // Check the config options
        core.debug(`Checking fallback...`);
        const valid_fallbacks = ['', 'bugfix', 'minor', 'major']
        if (fallback !== undefined && !valid_fallbacks.includes(fallback)) {
            core.setFailed('Invalid "fallback"; has to be "bugfix", "minor", "major" or unset!');
        }

        // Determine the target version
        const labels = pull_request.labels.map(x => x.name);
        core.debug(`Determining target milestone for labels [${labels}]...`);
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
        const latest_response = await (octokit.rest.repos.getLatestRelease(context.repo))
        const latest = latest_response.data.name
        core.debug(`latest release: ${latest}`);
        if (latest == '') {
            core.info(`No release found...`);
            core.setOutput('milestone', '-');
            return;
        }
        var version = bumpVersion(latest, target);

        // Try to get the milestones and check if we have the correct one
        const milestones = await(octokit.rest.issues.listMilestones(context.repo))
        if (milestones.data.length < 1) {
            core.info(`No milestones in project...`);
            core.setOutput('milestone', '-');
            return;
        }

        var match = milestones.data.filter(m => m.title == version && m.state == 'open')
        if (match.length == 0 && fallback !== undefined && fallback !== '') {
            version = bumpVersion(latest, fallback)
            core.info(`Checking fallback version...`);
            match = milestones.data.filter(m => m.title == fallback_version_version && m.state == 'open')
        }

        // Check again to also take the fallback into account
        if (match.length == 0) {
            core.info(`No milestone matching ${version} found in project...`);
            core.setOutput('milestone', '-');
            return;
        }

        if (match.length > 1) {
            core.setFailed(`Ambiguous milestones for ` + version);
        }

        // Set the milestone
        const milestone = match[0]
        octokit.rest.issues.update({
            ...context.repo,
            issue_number: pull_request.number,
            milestone: milestone.number
        })
        core.setOutput('milestone', milestone.title);
    } catch (error) {
        core.error(error)
        core.setFailed(error.message);
    }
}

function bumpVersion(before, target) {
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