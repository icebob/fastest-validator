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
