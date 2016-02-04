"use strict";

class Y {
	constructor() {
		this.type = "Y" ;
	}
	async is(p) { return p+"Y of type "+this.type }
	async get info() { return await this.is('I am a ') }
}

class Z extends Y {
	constructor() {
		super() ;
		this.type = "Z" ;
	}
	async is(p) { return p+"Z"+await super.is(" based on a ") }
}

async function test() {
    var a = new Y() ;
    var b = new Z() ;
    console.log(await a.info,await b.info) ;
}

test().then(function(){},$error) ;

