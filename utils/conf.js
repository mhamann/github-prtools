const nconf = require('nconf');

nconf.argv()
     .env({ lowerCase: true, separator: '__' })
     .defaults({
       logger: { level: 'info' }
     });
