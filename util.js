const http = require('follow-redirects').http;
const url = require('url');

const util = {};
module.exports = util;

util.isnumber = function(str) {
  if (typeof str != "string") return false // we only process strings!  
  return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
         !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
}

util.not404 = function(URL, fn) {
  var options = {
    method: 'GET',
    port: 80,
    host: url.parse(URL).host,
    path: url.parse(URL).path
  };
  var req = http.request(options, function (r) {
    // console.log(url.parse(URL).host, url.parse(URL).path, r.statusCode)
    fn( r.statusCode == 200 );
  });
  req.end();
}