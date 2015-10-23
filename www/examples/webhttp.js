/* Async http GET */
async function httpGet(url) {
    var xhr = new XMLHttpRequest();
    xhr.onload = function() {
        if (xhr.status < 400) {
            async return xhr.responseText;
        } else {
            async throw new Error(xhr.statusText);
        }
    };
    xhr.open("get", url, true);
    xhr.send();
}

async function remote(w) {
    if (w.length > 6) {
        return await httpGet("/failure?" + w);
    }
    return await httpGet("/echo?" + w);
}

var w = "The quick brown fox jumps thoughtlessly over the lazy dog".split(" ");

/* Serial loop */
async function test() {
    try {
        for (var i = 0; i < w.length; i++) {
            log("serial", await remote(w[i]));
        }
    } catch (ex) {
        console.error("OOPS!", ex);
        return "Failed on "+w[i] ;
    }
    return "serial done" ;
}

test().then(log, $error);

/* Parallel loop - start all the awaits at one.
 * This doesn't work with generators as the executing function
 * (within the forEach) cannot yield as it is synchronous, so nodent falls
 * back to using Promises
 */
w.forEach(function(e) {
  try {
    log("parallel", await remote(e));
  } catch (ex) {
    console.error("parallel "+e,ex) ;
  }
});
