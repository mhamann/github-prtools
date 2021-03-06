const nconf = require('nconf');

nconf.argv()
     .env({ lowerCase: true, separator: '__' })
     .defaults({
       logger: { level: 'info' },
       github: { token: null },
       auth: { secret: null }
     });
