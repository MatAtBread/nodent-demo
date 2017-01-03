'use strict';
var nodent = require('nodent') ;
nodent = nodent({log:function(){ compileLog.push(arguments) }}) ;
var http = require('http') ;
var fs = require('fs') ;
var nodeStatic = require('node-static') ;
var compileLog ;

function sendError(req,res){
	res.statusCode = 404 ;
	res.setHeader("Content-type","text/plain") ;
	res.end("Not found: "+req.url) ;
}

function parseOpts(paths) {
	var opts = JSON.parse(decodeURIComponent(paths[2]) || "{}");
	if (opts.mode && opts.mode !== 'es5') {
		opts[opts.mode] = true
	}
	delete opts.mode;
	delete opts.promiseType;
	delete opts.spec; // this is technically a fast-async option
	return opts;
}

var file = new nodeStatic.Server('./www',{ cache: 60 });

var clients = [];
function handle(req,res) {
	var complete = res.end ;
	res.end = function() {
		complete.apply(this,arguments) ;
		if (clients.indexOf(req.socket.remoteAddress)<0) {
			clients.push(req.socket.remoteAddress) ;
			if (clients.length>1000)
				clients.splice(0,clients.length-1000) ;
			console.log(JSON.stringify([req.method,req.url,res.statusCode,req.socket.remoteAddress,req.headers])) ;
		}
	};

	var url = req.url.split("?") ;
	var paths = url[0].split("/") ;
	switch(paths[1]) {
	case '':
	  url[0] = '/index.html';
	case 'index.html':
    case 'source-map.js':
    case 'setImmediate.js':
		res.statusCode = 200 ;
//		res.setHeader("Content-type","text/html") ;
		fs.readFile('www'+url[0],function(err,data){
			res.end(data.toString().
					replace(/\<\@version\@\>/g,nodent.version.toString()).
					replace(/\<\@\$asyncbind\@\>/g,nodent.$asyncbind.toString()).
					replace(/\<\@\$asyncspawn\@\>/g,nodent.$asyncspawn.toString())
					) ;
		}) ;
		break ;

    case 'echo':
        res.statusCode = 200 ;
        res.setHeader("Content-type","text/plain") ;
        res.end(decodeURIComponent(url[1])) ;
        break ;

    case 'go':
		var options = parseOpts(paths);
		res.body = "" ;
		req.on('data',function(data){ res.body += data.toString() }) ;
		req.on('end',function(){
			try {
				var result = {} ;
				compileLog = [] ;
				var pr = nodent.parse(res.body,"source.js",3,options);
				nodent.prettyPrint(pr,3,options) ;
				result.pretty = pr.code ;
				pr = nodent.compile(res.body,"source.js",2,options) ;
				result.compiled = pr.code ;
				result.map = pr.sourcemap ;
				res.statusCode = 200 ;
				res.setHeader("Content-type","application/json") ;
				res.end(JSON.stringify(result)) ;
			} catch (ex) {
				res.statusCode = 500 ;
				res.setHeader("Content-type","text/plain") ;
				res.end(ex.message+"\n"+compileLog.join("\n")) ;
			}
		}) ;
		break ;

	default:
		if (/\.\./.test(url[0])) {
			return sendError(req,res) ;
		}
		var fileName = 'www/' + url[0].replace(/^\//, '') ;
		fs.stat(fileName,function(err,stat){
			if (err) return sendError(req,res) ;
			// List directories
			if (stat.isDirectory()) {
				fs.readdir(fileName,function(err,data){
					if (err) return sendError(req,res) ;
					res.statusCode = 200 ;
					res.setHeader("Content-type","application/json") ;
					res.end(JSON.stringify(data.map(function(f){ return url[0]+"/"+f}))) ;
				}) ;
			}
			// Otherwise, fallback to node-static
			else {
				return file.serve(req, res) ;
			}
		}) ;
	}
} ;

http.createServer(handle).listen(8880) ;
console.log("Serving on port 8880");
