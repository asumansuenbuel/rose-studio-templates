<style>
hl {
    background-color: yellow;
}
</style>
## Using Rose-Studio's Meta-Programming Features

_Asuman Suenbuel (c) 2019_

This 'connection scenario class' is created for documentation purposes to illustrate and explain the use of the meta-programming features available when working with Rose-Studio. This is a 'live' document that is part of the Github code that is associated with this class; you can find it's content in the toplevel README.md file. If you are reading this as part as part of the "Settings" tab, then you are seeing one Rose-Studio's feature in action: if there is a README.md file on the toplevel of the file hierarchy, it will be display here formatted using a markdown processor.

The meta-programming constructs in Rose-Studio enable you to customize your body of code for scenarios that represent variations from each other. Meta-programming works purely at design-time by generating different variations from a common code base.
Situation where this technique has advantages include the following:
- The differences between the variations are spread over many different source files at multiple location; code refactoring are either infeasible and/or would require major changes to the code.
- In cases where runtime efficiency is key, meta-programming can minimize runtime checks by compiling information already know at design-time into the running code.
- In cases, where you need to be careful which code you share with which customer/partner (IP issues).


# The Meta-Programming features

You can use the following features in your code files to control the code generation in instances of your scenario classes:

- **directive lines** starting with the string &#47;&#47;! followed by a line of JavaScript syntax;
- **inline meta expression** of the form &#36;&#36;{_expression_} which can be embedded into any other part of a file.

Rose-Studio uses JavaScript for evaluating the meta-programming constructs. The code generation is controlled by the following configuration components:
- a JSON object specified in the "Config" tab of the scenario *instance*
- JSON objects derived from the instantiations of the placeholders with concrete objects from the Rose-Studio robots and systems registry.

Let's start with the first item; we'll cover the second one after that.

# 'Hello World' Example

The Config JSON object is specified in the "Config" tab. Let's assume, we have the following Config object:

```javascript
{
    checkDivisionByZero: true,
    errorMessage: "error: division by 0"
}
```

You can now use those config settings in any part of your code, for instance in a snippet like this:

<pre>
function doSomething(a,b) {
    // ...
    <hl>&#47;&#47;! if (checkDivisionByZero) {</hl>
    if (b === 0) {
        throw "<hl>$${errorMessage}</hl>"
    }
    <hl>&#47;&#47;! }</hl>
    let res = a / b
    // ...
}
</pre>

