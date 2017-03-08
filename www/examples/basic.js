async function tellYouLater(sayWhat) {
    // Do something asynchronous, such as DB access, web access, etc.
    return "I said: "+sayWhat;
}

async function test() {
    return tellYouLater("I'll tell you later") ;
}

console.log(await test());
