const bunyan = require('bunyan');
const logConf = require('nconf').get('logger');

module.exports.createLogger = function(name, opts) {
  return bunyan.createLogger({
    name,
    level: logConf.level,
    serializers: bunyan.stdSerializers
  });
};
