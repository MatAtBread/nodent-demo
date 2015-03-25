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

/* This doesn't work in Generator mode as 'await' is not inside an 'async' function */
try {
	var w = "The quick brown fox jumps thoughtlessly over the lazy dog".split(" ") ;
	/* Serial loop */
	for (var i=0; i<w.length; i++)
		log("for",await remote(w[i]));
} catch(ex) {
	console.error("OOPS!",ex) ;
}

/* Parallel loop. NB: This doesn't work in Generator mode as the executing function
 * (within the forEach) cannot yield as it is synchronous */
w.forEach(function(e){
	log("each",await remote(e));
}) ;

