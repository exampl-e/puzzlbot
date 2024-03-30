const express = require("express");
const rdb = require("./database");
const server = express();

server.all("/", (req, res) => {
  res.send(`
<!DOCTYPE html>
<html>
<head>
  <base href="https://puzzl.surge.sh/">
  <link href="/style.css" rel="stylesheet" type="text/css" media="all">
</head>
<body>
  <h1>Bot Status</h1>
  <h3>puzzl#5669 is online!</h3>
</body>
</html>
  `);
});
server.all("/database", (req, res) => {
  rdb.getusers(function(value) {
    res.send(JSON.stringify(value));
  });
});
function keepAlive() {
  server.listen(3000, () => {
    console.log("Not yet ready...");
  });
};
module.exports = keepAlive;