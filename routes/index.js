const router = require('express').Router();
const events = require('../lib/events');
const nconf = require('nconf');
const crypto = require('crypto');

// Validate HMAC signatures if configured
if (nconf.get('auth:secret') !== null) {
  router.use('/v1/events', function(req, res, next) {
    let signature = req.get('X-Hub-Signature');
    let hash = crypto.createHmac('sha1', nconf.get('auth:secret')).update(JSON.stringify(req.body)).digest('hex');
    console.log(hash);
    if (hash !== signature) {
      let err = new Error('Signature mismatch');
      err.statusCode = 400;
      throw err;
    }

    next();
  });
}

router.post('/v1/events', function(req, res, next) {
  
  let name = req.get('X-GitHub-Event');

  events.process(name, req);

  res.send();

});

module.exports = router;
