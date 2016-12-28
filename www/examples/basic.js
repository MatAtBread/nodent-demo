async function tellYouLater(sayWhat) {
    // Do something asynchronous, such as DB access, web access, etc.
    const result = await somethingAsync(sayWhat);
    return result;
}
