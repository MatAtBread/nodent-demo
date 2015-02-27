var nodent = require('nodent')() ;
var http = require('http') ;
var fs = require('fs') ;

function handle(req,res) {
  var complete = res.end ;
  res.end = function() {
	complete.apply(this,arguments) ;
	console.log(JSON.stringify([req.method,req.url,res.statusCode,req.socket.remoteAddress,req.headers])) ;
  };

  var url = req.url.split("?") ;
  switch(url[0]) {
  case '/':
    res.body = "" ;
    req.on('data',function(data){ res.body += data.toString() }) ;
    req.on('end',function(){
      res.statusCode = 200 ;
      res.setHeader("Content-type","text/html") ;
      fs.readFile('www/index.html',function(err,data){
        res.end(data.toString()) ;
      }) ;    
    }) ;
    break ;

  case '/js':
  case '/js-promise':
	  try {
	      res.statusCode = 200 ;
	      res.setHeader("Content-type","text/javascript") ;
	      res.end(nodent.compile(decodeURIComponent(url[1]),"source.js",2,{es7:true,promises:req.url=='/js-promise'}).code) ;
	  } catch(ex) {
	      res.statusCode = 500 ;
	      res.setHeader("Content-type","text/plain") ;
	      res.end(ex.message) ;
	  }
	  break ;
	  
  case '/es7':
  case '/promise':
    res.body = "" ;
    req.on('data',function(data){ res.body += data.toString() }) ;
    req.on('end',function(){
      try {
        var result = {} ;
        result.compiled = nodent.compile(res.body,"source.js",2,{es7:true,promises:req.url=='/promise'}).code ;
        res.statusCode = 200 ;
        res.setHeader("Content-type","application/json") ;
        res.end(JSON.stringify(result)) ;
      } catch (ex) {
        res.statusCode = 500 ;
        res.setHeader("Content-type","text/plain") ;
        res.end(ex.message) ;
      }
    }) ;
    break ;

  default:
    res.statusCode = 404 ;
    res.setHeader("Content-type","text/plain") ;
    res.end("Not found: "+req.url) ;
    break;
  }
} ;

http.createServer(handle).listen(8880) ;
