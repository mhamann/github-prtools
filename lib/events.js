const _ = require('lodash');
const logger = require('../utils/logging').createLogger('events');

let processors = {};

module.exports.register = function(eventName, fnId, fn) {
  if (!processors[eventName]) {
    processors[eventName] = {};
  }

  processors[eventName][fnId] = fn;
  logger.info(`Registered processor for event '${eventName}'`);
};

module.exports.process = function(eventName, req) {
  let fns = _.get(processors, eventName);

  if (!fns) {
    logger.debug(`No processors registered for event '${eventName}'`);
    return;
  }

  let fnArray = Object.keys(fns);
  fnArray.forEach(fnKey => {
    fns[fnKey].apply(null, [req]);
  });

  logger.info(`Called ${fnArray.length} processor(s) for event '${eventName}'`);

};
