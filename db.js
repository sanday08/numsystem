var mysql = require('mysql');

var con = mysql.createConnection({
  host: "localhost",
  user: "win123",
  password: "Win24",
  database: "win24",
  multipleStatements: true
});

con.connect(function (err) {
  if (err) throw err;
  console.log("Connected!");

});


con.end();

module.exports = con