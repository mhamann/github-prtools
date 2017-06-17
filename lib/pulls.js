const events = require('./events');
const logger = require('../utils/logging').createLogger('lib/pulls');
const NodeGit = require('nodegit');
const Promise = require('bluebird');
const Clone = NodeGit.Clone;
const Rebase = NodeGit.Rebase;
const os = require('os');
const path = require('path');
const rm = Promise.promisify(require('rimraf'));
const tmp = path.join.bind(path, os.tmpdir());
const local = path.join.bind(path, __dirname);

const sshPublicKeyPath = local('../certs/publicKey.pem');
const sshPrivateKeyPath = local('../certs/privateKey.pem');

function handlePullReview(req) {
  let payload = req.body;
  logger.trace('Received payload:', payload);

  if (payload.action !== 'submitted' || payload.review.state !== 'approved') {
    return;
  }

  let pullRequest = payload.pull_request;

  if (pullRequest.base.ref === 'master' && pullRequest.head.ref === 'develop') {
    // Rebase master on develop
    // Push to master
    rebaseBranch(pullRequest.base.ref, pullRequest.head.ref, pullRequest.base.repo.ssh_url, pullRequest.base.repo.name);
  } else {
    // Loop through open PRs
    // If base === develop, rebase and force push
  }

  logger.info(`PR: ${payload.review.pull_request_url}`);
}
events.register('pull_request_review', 'handlePullReview', handlePullReview);

function rebaseBranch(baseBranch, headBranch, cloneUrl, repoName) {
	var opts = {
      fetchOpts: {
        callbacks: {
          credentials: function(url, userName) {
            return NodeGit.Cred.sshKeyNew(
              userName,
              sshPublicKeyPath,
              sshPrivateKeyPath,
              "");
          }
        }
      }
    };
  
  let cloneDir = tmp(repoName);

  return rm(cloneDir).then(() => {
    return Clone(cloneUrl, cloneDir, opts);
  })
  .then(repo => {
    logger.info(`Cloned repo ${repoName} to ${cloneDir} successfully`);
  })
  .catch(err => {
    logger.error('Failed to clone repo', err);
  });
}
