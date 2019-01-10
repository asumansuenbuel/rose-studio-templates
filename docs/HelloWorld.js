/**
 * example to illustrate basic meta-programming constructs
 */
 
 function doSomething(a,b) {
    // ...
    //! if (checkDivisionByZero) {
    if (b === 0) {
        throw "<hl>$${errorMessage}</hl>"
    }
    //! }
    let res = a / b
    // ...
}