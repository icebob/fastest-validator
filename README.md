[![Build Status](https://travis-ci.org/icebob/fastest-validator.svg?branch=master)](https://travis-ci.org/icebob/fastest-validator)
[![Coverage Status](https://coveralls.io/repos/github/icebob/fastest-validator/badge.svg?branch=master)](https://coveralls.io/github/icebob/fastest-validator?branch=master)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/75256e6ec26d42f5ab1dee109ae4d3ad)](https://www.codacy.com/app/mereg-norbert/fastest-validator?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=icebob/fastest-validator&amp;utm_campaign=Badge_Grade)
[![Known Vulnerabilities](https://snyk.io/test/github/icebob/fastest-validator/badge.svg)](https://snyk.io/test/github/icebob/fastest-validator)

# fastest-validator
:rocket: The fastest JS validator library for NodeJS.

## Key features
* fast! Really!
* 9 built-in validator
* nested object & array handling
* customizable error messages
* programmable error object

# How fast?
Very fast! We compared to other popular libraries:

[![Result](https://cloud.highcharts.com/images/yqowupa/2/600.png)](https://github.com/icebob/validator-benchmark#result)

**Would you like to test it?**

```js
$ git clone https://github.com/icebob/fastest-validator.git
$ cd fastest-validator
$ npm install
$ npm run bench
```

## Installation
### NPM
You can install it via [NPM](http://npmjs.org/).
```
$ npm install fastest-validator
```
### Manual
Download zip package and unpack and add the `fastest-validator.css` and `fastest-validator.js` file to your project from dist folder.
```
https://github.com/icebob/fastest-validator/archive/master.zip
```

## Usage

### Simple method
Call the `validate` method with the `object` and the `schema`. 
> If the performance is important, you won't use this method.

```js
let Validator = require("fastest-validator");

let v = new Validator();

const schema = {
    id: { type: "number", positive: true, integer: true },
    name: { type: "string", min: 3, max: 255 },
    status: "boolean" // short-hand def
};

console.log(v.validate({ id: 5, name: "John", status: true }, schema));
// Returns: true

console.log(v.validate({ id: 5, name: "Al", status: true }, schema));
/* Returns an array with errors:
	[
		{ 
			type: 'stringMin',
			args: [
				3,
				2
			],
			field: 'name',
			message: 'The \'name\' field length must be larger than or equal to3 characters long!'
		}
	]
*/
```

### Fast method
In this case, first step is to compile the schema to a compiled "checker" function. If you would like to validate your object, just call this function with your object.
> This method is ~10x faster than "simple method".

```js
let Validator = require("fastest-validator");

let v = new Validator();

const schema = {
    id: { type: "number", positive: true, integer: true },
    name: { type: "string", min: 3, max: 255 },
    status: "boolean" // short-hand def
};

const check = v.compile(schema);

console.log(check({ id: 5, name: "John", status: true }));
// Returns: true

console.log(check({ id: 2, name: "Adam" }));
/* Returns an array with errors:
	[
		{ 
			type: 'required',
			args: [],
			field: 'status',
			message: 'The \'status\' field is required!'
		}
	]
*/

```

# Built-in validators

## `any`
This is not validate the type of value. Accept any types.

```js
let schema = {
	prop: { type: "any" }
}

v.validate({ prop: true }); // Valid
v.validate({ prop: 100 }); // Valid
v.validate({ prop: "John" }); // Valid
```

## `array`
This is not validate the type of value. 

## `boolean`
This is a `Boolean` validator. 

```js
let schema = {
	status: { type: "boolean" }
}

v.validate({ status: true }); // Valid
v.validate({ status: false }); // Valid
v.validate({ status: 1 }); // Fail
v.validate({ status: "true" }); // Fail
```
### Properties
Property | Default  | Description
-------- | -------- | -----------
`convert` | `false` | if `true` and the type is not `Boolean`, try to convert. `1`, `"true"`, `"1"`, `"on"` will be true. `0`, `"false"`, `"0"`, `"off"` will be false.


## `date`
This is a `Date` validator. 

```js
let schema = {
	dob: { type: "date" }
}

v.validate({ dob: new Date() }); // Valid
v.validate({ dob: new Date(1488876927958) }); // Valid
v.validate({ dob: 1488876927958 }); // Fail
```
### Properties
Property | Default  | Description
-------- | -------- | -----------
`convert`  | `false`| if `true` and the type is not `Date`, try to convert with `new Date()`.

## `email`
This is an e-mail address validator. 

```js
let schema = {
	email: { type: "email" }
}

v.validate({ email: "john.doe@gmail.com" }); // Valid
v.validate({ email: "james.123.45@mail.co.uk" }); // Valid
v.validate({ email: "abc@gmail" }); // Fail
```

### Properties
Property | Default  | Description
-------- | -------- | -----------
`mode`   | `quick`  | Checker method. Can be `quick` or `precise`.


## `forbidden`
This validator gives error if the property is exists in the object. 

```js
let schema = {
	password: { type: "forbidden" }
}

v.validate({ user: "John" }); // Valid
v.validate({ user: "John", password: "pass1234" }); // Fail
```

## `function`
The type of value must be `Function`.

```js
let schema = {
	show: { type: "function" }
}

v.validate({ show: function() {} }); // Valid
v.validate({ show: Date.now }); // Valid
v.validate({ show: null }); // Fail
```


## `number`
This is a number validator. The type of value must be `Number`.

```js
let schema = {
	age: { type: "number" }
}

v.validate({ age: 123 }); // Valid
v.validate({ age: 5.65 }); // Valid
v.validate({ age: "100" }); // Fail
```

### Properties
Property | Default  | Description
-------- | -------- | -----------
`min`  	 | `null`   | Minimum value.
`max`  	 | `null`   | Maximum value.
`equal`  | `null`   | Fix value.
`notEqual` | `null` | Can't be equal with this value.
`integer` | `false` | The value must be a non-decimal value.
`positive` | `false`| The value must be larger than zero.
`negative` | `false`| The value must be less than zero.
`convert`  | `false`| if `true` and the type is not `Number`, try to convert with `parseFloat`.

## `object`
This is not validate the type of value. 

## `string`
This is a `string` validator. The type of value must be `String`.

```js
let schema = {
	name: { type: "string" }
}

v.validate({ name: "John" }); // Valid
v.validate({ name: "" }); // Valid
v.validate({ name: 123 }); // Fail
```

### Properties
Property | Default  | Description
-------- | -------- | -----------
`empty`  | `true`   | If true, the validator accepts empty string `""`.
`min`  	 | `null`   | Minimum length of value.
`max`  	 | `null`   | Maximum length of value.
`length` | `null`   | Fix length of value.
`pattern` | `null`   | Regex pattern.
`contains` | `null`   | The value must contains this text.
`enum`	 | `null`   | The value must be an element of the `enum` array.


## `url`
This is an URL validator. 

```js
let schema = {
	url: { type: "url" }
}

v.validate({ url: "http://google.com" }); // Valid
v.validate({ url: "https://github.com/icebob" }); // Valid
v.validate({ url: "www.facebook.com" }); // Fail
```

# Custom error messages (l10n)
You can set your custom messages in constructor of validator.

```js
const Validator = require("fastest-validator");
const v = new Validator({
	messages: {
		stringMin: "A(z) '{name}' mező túl rövid. Minimum: {0}, Jelenleg: {1}",
		stringMax: "A(z) '{name}' mező túl hosszú. Minimum: {0}, Jelenleg: {1}"
	}
});
```

## Message types
Name | Default text
---- | -------------
`required` | The '{name}' field is required!
`string` | The '{name}' field must be a string!
`stringEmpty` | The '{name}' field must not be empty!
`stringMin`: | The '{name}' field length must be larger than or equal to {0} characters long!
`stringMax`: | The '{name}' field length must be less than or equal to {0} characters long!
`stringLength` | The '{name}' field length must be {0} characters long!
`stringPattern` | The '{name}' field fails to match the required pattern!
`stringContains` | The '{name}' field must contain the '{0}' text!
`stringEnum` | The '{name}' field does not match any of the allowed values!
`number` | The '{name}' field must be a number!
`numberMin` | The '{name}' field must be larger than or equal to {0}!
`numberMax` | The '{name}' field must be less than or equal to {0}!
`numberEqual` | The '{name}' field must be equal with {0}!
`numberNotEqual` | The '{name}' field can't be equal with {0}!
`numberInteger` | The '{name}' field must be an integer!
`numberPositive` | The '{name}' field must be a positive number!
`numberNegative` | The '{name}' field must be a negative number!
`array` | The '{name}' field must be an array!
`arrayEmpty` | The '{name}' field must not be an empty array!
`arrayMin` | The '{name}' field must contain at least {0} items!
`arrayMax` | The '{name}' field must contain less than or equal to {0} items!
`arrayLength` | The '{name}' field must contain {0} items!
`arrayContains` | The '{name}' field must contain the '{0}' item!
`arrayEnum`: | The '{name} field value '{0}' does not match any of the allowed values!
`boolean` | The '{name}' field must be a boolean!
`function` | The '{name}' field must be a function!
`date` | The '{name}' field must be a Date!
`dateMin` | The '{name}' field must be larger than or equal to {0}!
`dateMax` | The '{name}' field must be less than or equal to {0}!
`forbidden` | The '{name}' field is forbidden!
`email` | The '{name}' field must be a valid e-mail!

## Development
```
npm run dev
```

## Test
```
npm test
```

## Contribution
Please send pull requests improving the usage and fixing bugs, improving documentation and providing better examples, or providing some testing, because these things are important.

## License
fastest-validator is available under the [MIT license](https://tldrlegal.com/license/mit-license).

## Contact

Copyright (C) 2017 Icebob

[![@icebob](https://img.shields.io/badge/github-icebob-green.svg)](https://github.com/icebob) [![@icebob](https://img.shields.io/badge/twitter-Icebobcsi-blue.svg)](https://twitter.com/Icebobcsi)
