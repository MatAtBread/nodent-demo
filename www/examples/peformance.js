/* Aync addition */
async function add(a,b) {
    return a+b;
}

/* Run the async addition lots of times */
async function test() {
  var x = 0 ;
  for (var n=0;n<50000;n++) {
    if (!(n&511)) {
        await breathe() ;
    }
    x = await add(x,1) ;
  }
  return n-x ;
}

/* Generators require await is inside an async function
 * unlike Pure ES5 or ES5/Promises mode */
async function run() {
    var t = Date.now() ;
    await test() ;
    log(Date.now()-t) ;
}

/* Run the test, in a Generator friendly way from non-async code. */
run().then(log,$error) ;
