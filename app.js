require('./utils/conf');
const express = require('express');
const nconf = require('nconf');
const logger = require('./utils/logging').createLogger('main');
const routes = require('./routes');
const bodyParser = require('body-parser');

// Some setup
require('./lib/pulls');

const app = express();
app.set('host', nconf.get('host') || '0.0.0.0');
app.set('port', nconf.get('port') || 3830);

app.use(bodyParser.json());
app.use(routes);

app.listen(app.get('port'), function() {
  logger.info(`Server listening on ${app.get('host')}:${app.get('port')}`);
});
