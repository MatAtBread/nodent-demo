async function breathe() {
    setTimeout($return,0) ;
}

/* Aync addition */
async function add(a,b) {
    return a+b;
}

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

var t = Date.now() ;
await test() ;
log(Date.now()-t) ;
