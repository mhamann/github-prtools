const request = require('request-promise');
const nconf = require('nconf');

module.exports = request.defaults({
  json: true,
  headers: {
    Authorization: `token ${nconf.get('github:token')}`,
    'User-Agent': 'GitHub Toolbox'
  }
});
