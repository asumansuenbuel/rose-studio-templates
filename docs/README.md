<style>
hl {
    background-color: yellow;
}
invisible {
    display: none;
}

.shadow {
    -webkit-box-shadow: 10px 10px 4px -5px rgba(0,0,0,0.75);
    -moz-box-shadow: 10px 10px 4px -5px rgba(0,0,0,0.75);
    box-shadow: 10px 10px 4px -5px rgba(0,0,0,0.75);
}

</style>

Using Rose-Studio's Meta-Programming Features
=============================================

_Asuman Suenbuel (c) 2019_

This 'scenario class' is created for documentation purposes to illustrate and explain the use of the meta-programming features available when working with Rose-Studio. This is a 'live' document that is part of the Github code that is associated with this class; you can find it's content in the toplevel README.md file. If you are reading this as part of the "Settings" tab, then you are seeing one Rose-Studio's feature in action: if there is a README.md file on the toplevel of the file hierarchy, it will be display here formatted using the markdown processor [showdownjs](http://showdownjs.com).

The meta-programming constructs in Rose-Studio enable you to customize your body of code for scenarios that represent variations from each other. Meta-programming works purely at design-time by generating different variations from a common code base.
Situation where this technique has advantages include the following:
- the differences between the variations are spread over many different source files at multiple location; code refactoring are either infeasible and/or would require major changes to the code;
- in cases where runtime efficiency is key, meta-programming can minimize runtime checks by compiling information already known at design-time into the running code;
- in cases, where you need to be careful which code you share with which customer/partner (IP issues);
- in case you want to instrument your code with instructions for debugging and/or profiling, but want to ship out a "clean" version.


## The Meta-Programming features

You can use the following features in your code files to control the code generation in instances of your scenario classes:

- **directive lines** starting with the string &#47;&#47;! followed by a line of JavaScript syntax;
- **inline meta expression** of the form &#36;&#36;{_expression_} which can be embedded into any other part of a file.

Rose-Studio uses JavaScript for evaluating the meta-programming constructs. The code generation is controlled by the following configuration components:
- a JSON object specified in the "Config" tab of the scenario *instance*
- JSON objects derived from the instantiations of the placeholders with concrete objects from the Rose-Studio robots and systems registry.

Let's start with the first item; we'll cover the second one after that.

### 'Hello World' Example

The Config JSON object is specified in the "Config" tab. Let's assume, we have the following Config object:

```json
{
    "checkDivisionByZero": true,
    "errorMessage": "error: division by 0"
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

The highlighted parts are meta-programming parts; those are evaluated when you create an instance of the scenario class. With the above settings in the Config, the generated code would look like this:

```javascript
function doSomething(a,b) {
    //...
    if (b === 0) {
        throw "error: division by 0"
    }
    let res = a / b
    // ...
}
```

You can try this out yourself by creating an instance of this scenario class or using an existing instance:
- to create an instance, click on the 'Create Instance' button in the top toolbar of the connection scenario class
- to navigate to an existing instance open the 'Instances' panel on the right side and click on one of the instances.

You can tell whether you currently in a scenario *class* page or in an scenario *instance* page:
- the scenario *class* page has a blueish top toolbar, while
- the *instance* page has a greenish top toolbar.

<div style="font-style: italic; padding: 10px">
//! // If you see this, you are in a scenario <b>class</b> page. Why? Because this line starts with &#47;&#47;! and will be processed as Javascript line (which in this case is a comment line) by the Rose-Studio code generator.
</div>

The code files contain a "HelloWorld.js" with the above content. If you are in the instance page, you can play with the values in the Config tab to change the generated code for HelloWorld.js. See below for how this could look like:

<invisible>
//! if (includeVideosInReadme) {
</invisible>
<embed type="video/webm" src="https://asu-file-hosting.firebaseapp.com/rose-hello-world.mp4" width="800px" height="500px">
<invisible>
//! }
</invisible>

Note: we are using JavaScript for our code examples here, but the meta-programming is applicable to all kinds of text files (including the file containing this document; you can see for yourself by playing with the "includeVideosInReadme" flag in the Config object when viewing this in an instance page).

## Using Placeholders

Rose-Studio uses placeholders as a convenient way of providing stored configuration settings used during the design-time code generation. Currently, Rose-Studio supports two kinds of objects: backend systems (e.g. various SAP systems) and robotic systems (e.g. Fetch, Baxter, UR, Mir). The system maintains a registry for those objects; the user can create new entries as needed, as well as adding new fields of various types to the objects, if necessary. Below is an example entry for an robotic system:

<center>
<img class="shadow" src="https://asu-file-hosting.firebaseapp.com/fetch-robot-rose-studio.png" width="50%" style="border: 1px solid grey">
<p>Figure 1</p>
</center>

From the Rose-Studio start page you can navigate to the "Robots and Robotics System" page and browse through the registered objects. As you might notice, some of the fields are purely informational, like 'Website' and 'Description', while other are more technical in nature, for instance the 'jsconfig' field. As mentioned earlier, the list of fields can be extended by the Rose-Studio users to include different kind of (technical and/or non-technical) information. In particular, we can add fields that contain code snippets, which could in turn be used by the meta-programming within a scenario class.

### Defining Placeholders

Placeholders are defined in a scenario class like this one. While in "Edit" mode (see toolbar), you can add either backend system or robotic system placeholders. During the definition, you need to assign a unique identifier to each of the placeholders; those are the identifiers that are used to refer to the fields with the meta-programming constructs. In this class, these are 'sys1' and 'robot1'. 

//! // You can see the placeholders at the top of this page.

While defining the placeholders you can add constraints to them, thus limiting the set of object they can be instantiated with. Here, we have added a constraint to the robot placeholder, so that only robot objects where the field "Robot Category" is set to "logistic" are valid instantiations of this placeholder.

<img class="shadow" src="https://asu-file-hosting.firebaseapp.com/placeholder-dialog.png" width="50%" style="border: 1px solid grey">

_Note: If you want to modify the dialog fields, you first have to switch to "Edit" mode._

### Instantiating Placeholders

Placeholder instantiations are done while inside on a scenario *instance* page.

//! // Please navigate to an instance page by either creating a new instance or clicking on an existing one on the right.

There, placeholder can be in one of the two following states:
- **not instantiated**: the placeholder box has a white background with a dashed border:

<center><img src="https://asu-file-hosting.firebaseapp.com/placeholder-not-instantiated.png" width="20%"></center>

- **instantiated**: the placeholder box has a blueish background, a thick black border, and contains the title and image of the object which it is instantiated with:

<center><img src="https://asu-file-hosting.firebaseapp.com/placeholder-instantiated.png" width="20%"></center>

The instantiation (and undoing of the instantiation) is done visually in the UI using drag-and-drop from (to) the right-side panel that contains shortcuts to the objects defined in the Rose-Studio systems and robots registries.

- In order to instantiate a placeholder object that is in state 'not instantiated', you expand the corresponding panel on the right side, scroll to the object that you want to use and drag it onto the placeholder box and drop it as soon as the cursor becomes a green plus symbol:

<invisible>
//! if (includeVideosInReadme) {
</invisible>
<center>
<embed type="video/webm" src="https://asu-file-hosting.firebaseapp.com/instantiating-a-placeholder.mp4" width="800px" height="500px">
</center>
<invisible>
//! }
</invisible>

- For undoing an instantiation you can simply drag the object box back into the right-side panel area.

### Using the instantiated placeholders

Once a placeholder is instantiated, its instantiated value can be used in the meta-programming constructs in the same way as illustrated above using the fields of the Config JSON object. The placeholder identifier is used to reference the fields of the instantiated object in the Config. As an example, let's assume we instantiated our placeholder 'robot1' with the 'Fetch Freight Base' entry shown in Figure 1, the Config JSON object is extended with a field names 'robot1', which contains as subfields all the fields defined in the 'Fetch Freight Base' entry. Internally, the Config object would then look something like this:

<pre>
{
    "checkDivisionByZero": true,
    "errorMessage": "error: division by 0"
    "robot1": {
        "NAME": "Fetch Freight Base",
        "Robot Category": "logistic",
        "shortName": "Fetch",
        "Website": "https://fetchrobotics.com",
        "Manufacturer": "Fetch Robotics",
        "jsconfig": {
            "wrapperServiceFunction": "fetchWrapperService"
        }
        // <em>skipping some fields from robot entry</em>
    }
}
</pre>

Some Notes:
- the 'robot1' Config entry (and all entries associated with placeholder instantiation) do not actually appear in the Config tab; we just spell it out here for illustration purposes
- the 'jsconfig' field in the robot structure has been created as a 'JSON' field; it is interpreted as a substructure.

The following line displays a different message depending on whether the 'robot1' placeholder is instantiated or not:

//! // <div style="display:none">

//! if (typeof robot1 === 'undefined') {
**Please instantiate the robot placeholder.**
//! } else {
The robot placeholder has been instantiated with "$${robot1.NAME}" from manufacturer _$${robot1.Manufacturer}_. You can learn more about this robot at <a href="$${robot1.Website}" target="_blank">$${robot1.Website}</a>

//! }

//! // </div>



