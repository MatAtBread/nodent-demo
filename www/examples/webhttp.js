async function httpGet(url) {
	var xhr = new XMLHttpRequest() ;
	xhr.onload = function(){
		if (xhr.status<400)
			$return(xhr.responseText) ;
		else 
			$error(new Error(xhr.statusText)) ;
	}
	xhr.open("get",url,true) ;
	xhr.send() ;
}

async function remote(w) {
	if (w.length>6){
		return await httpGet("/failure?"+w);
	}
	return await httpGet("/echo?"+w);
}

try {
	var w = "The quick brown fox jumps thoughtlessly over the lazy dog".split(" ") ;
	/* Serial loop */
	for (var i=0; i<w.length; i++)
		log("for",await remote(w[i]));
} catch(ex) {
	console.error("OOPS!",ex) ;
}

/* Parallel loop */
w.forEach(function(e){
	log("each",await remote(e));
}) ;
