async function httpGet(url) {
    var xhr = new XMLHttpRequest();
    xhr.onload = function() {
        if (xhr.status < 400) {
            return async xhr.responseText;
        } else {
            throw async new Error(xhr.statusText);
        }
    };
    xhr.open("get", url, true);
    xhr.send();
};

async function remote(w) {
    if (w.length > 6) {
        return await httpGet("/failure?" + w);
    }
    return await httpGet("/echo?" + w);
};

var w = "The quick brown fox jumps thoughtlessly over the lazy dog".split(" ");

async function test() {
    /* Serial loop */
    try {
        for (var i = 0; i < w.length; i++) {
            log("for", await remote(w[i]));
        }
    } catch (ex) {
        console.error("OOPS!", ex);
    }
};

test().then(log, $error);

/* Parallel loop. NB: This doesn't work in Generator mode as the executing function
 * (within the forEach) cannot yield as it is synchronous 
 * 
 * DELETE ME IF USING GENERATORS
 * */
w.forEach(function(e) {
    log("each", await remote(e));
});
