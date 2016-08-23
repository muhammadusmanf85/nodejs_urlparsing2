//Lets require/import dependency modules
var http = require('http');
var url = require('url');
var request = require('request');
var cheerio = require('cheerio');
var async = require('async');
var validUrl = require('valid-url');

//Lets define a port we want to listen to
const PORT=8080; 

//We need a function which handles requests and send response
function handleRequest(req, res){
  var queryData = url.parse(req.url, true).query;  

  if (queryData.address) {
    console.log('querystring: '+queryData.address);
    var addresses = queryData.address;
    addresses = addresses.toString().split(',');
    console.log('querystring array: '+JSON.stringify(addresses));

    var parsedResults = [];
    var completed = 0, t = addresses.length;

    function displayrResponse(result){
      // HTTP response body
      res.writeHead(200, {"Content-Type": "text/html"});
      res.write('<html>\n<body>\n');
      res.write('<h1>Following are the titles of given websites: <h1>\n');
      res.write('<ul>\n');
      for (var i = 0, len = result.length; i < len; i++) {
        res.write('<li> '+result[i].url+' - "'+result[i].title+'" </li>\n');
      }      
      res.write('</ul>\n');
      res.write('</body>\n</html>');
      
      // HTTP response finished
      res.end();
    }

    for (var i in addresses) {
      var addr = ''; 
      addr = addresses[i];
      console.log(addr);
      if(validUrl.isUri(addr)) {
        request(addr, function(err, response, body) {
          if (err) return console.log(err); 
          if (!err && response.statusCode == 200) {
            var $ = cheerio.load(body);
            var title = $("title").text();
            // Push title into parsedResults array
            parsedResults.push({
              'url':addr,
              'title':title
            });
            completed++;
            if (completed == addresses.length) { 
              console.log(parsedResults);
              displayrResponse(parsedResults); 
            }  
          }
        });
      }
      else{
        parsedResults.push({
          'url':addr,
          'title':'NO RESPONSE'
        });
        completed++;
        if (completed == addresses.length) { 
          console.log(parsedResults);
          displayrResponse(parsedResults); 
        }
      } 
    }


  } else {
    res.writeHead(200, {"Content-Type": "text/plain"});
    res.end("Hello World\n");
  }
   
}

//Create a server
var server = http.createServer(handleRequest);

//Lets start our server
server.listen(PORT, function(){

  //Callback triggered when server is successfully listening. Hurray!
  console.log("Server listening on: http://localhost:%s", PORT);
});
