const fs = require('fs');
module.exports = JSON.parse(fs.readFileSync(__dirname + '/.eslintrc.json', 'utf8'));
