/**
 * example to illustrate basic meta-programming constructs
 */
 
 function doSomething(a,b) {
    // ...
    //! if (checkDivisionByZero) {
    if (b === 0) {
        throw "$${errorMessage}"
    }
    //! }
    let res = a / b
    // ...
}