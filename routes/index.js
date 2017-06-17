const router = require('express').Router();
const events = require('../lib/events.js');

router.post('/v1/events', function(req, res, next) {
  
  let name = req.get('X-GitHub-Event');

  events.process(name, req);

  res.send();

});

module.exports = router;
