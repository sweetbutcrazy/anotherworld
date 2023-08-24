var http = require('http'); 
http.createServer(function (req, res) { 
  
  res.write("I'm alive, https://discord.gg/anotherworldserver");
  res.end();
}).listen(8080);; 