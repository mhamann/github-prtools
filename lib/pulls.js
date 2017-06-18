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
	var remoteOpts = {
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
    return Clone(cloneUrl, cloneDir, remoteOpts);
  })
  .then(repo => {
    logger.info(`Cloned repo ${repoName} to ${cloneDir} successfully`);
    this.repo = repo;

    return Promise.props({
      baseRef: repo.getReference(`${baseBranch}`),
      headRef: repo.getReference(`origin/${headBranch}`)
    });
  })
  .then(refs => {
    return Promise.props({
      baseCommit: NodeGit.AnnotatedCommit.fromRef(this.repo, refs.baseRef),
      headCommit: NodeGit.AnnotatedCommit.fromRef(this.repo, refs.headRef)
    });
  })
  .then(commits => {
    return Rebase.init(this.repo, commits.baseCommit, commits.headCommit, commits.headCommit);
  })
  .then(rebase => {
    let signature = NodeGit.Signature.default(this.repo);
    return rebase.finish(signature);
  })
  .then(() => {
    logger.info(`Successfully rebased ${baseBranch} from ${headBranch}. Pushing to remote.`);
  })
  .then(() => {
    return NodeGit.Remote.lookup(this.repo, 'origin')
  })
  .then(remote => {
    return remote.push(["refs/heads/master:refs/heads/master"], remoteOpts.fetchOpts);
  })
  .then(() => {
    logger.info(`Successfully pushed updated ${baseBranch} to remote.`);
  })
  .catch(err => {
    logger.error('The branch rebasing process failed due to:', err);
  });
}
