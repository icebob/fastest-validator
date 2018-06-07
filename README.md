![Photos from @ikukevk](https://user-images.githubusercontent.com/306521/30183963-9c722dca-941c-11e7-9e83-c78377ad7f9d.jpg)

[![Build Status](https://travis-ci.org/icebob/fastest-validator.svg?branch=master)](https://travis-ci.org/icebob/fastest-validator)
[![Coverage Status](https://coveralls.io/repos/github/icebob/fastest-validator/badge.svg?branch=master)](https://coveralls.io/github/icebob/fastest-validator?branch=master)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/75256e6ec26d42f5ab1dee109ae4d3ad)](https://www.codacy.com/app/mereg-norbert/fastest-validator?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=icebob/fastest-validator&amp;utm_campaign=Badge_Grade)
[![Known Vulnerabilities](https://snyk.io/test/github/icebob/fastest-validator/badge.svg)](https://snyk.io/test/github/icebob/fastest-validator)

# fastest-validator [![NPM version](https://img.shields.io/npm/v/fastest-validator.svg)](https://www.npmjs.com/package/fastest-validator) [![Tweet](https://img.shields.io/twitter/url/http/shields.io.svg?style=social)](https://twitter.com/intent/tweet?text=The%20fastest%20JS%20validator%20library%20for%20NodeJS&url=https://github.com/icebob/fastest-validator&via=Icebobcsi&hashtags=nodejs,javascript)
:zap: The fastest JS validator library for NodeJS.

## Key features
* fast! Really!
* 9 built-in validators
* custom validators
* nested object & array handling
* multiple validators
* customizable error messages
* programmable error object
* no dependencies
* unit tests & 100% cover

# How fast?
Very fast! 3 million validation/sec (on Intel i7-4770K, Node.JS: 6.10.0)
```
√ validate with pre-compiled schema x 3,052,280 ops/sec ±0.82% (93 runs sampled)
```

Compared to other popular libraries:

[![Result](https://cloud.highcharts.com/images/yqowupa/4/800.png)](https://github.com/icebob/validator-benchmark#result)
> 100x faster than Joi.

**Would you like to test it?**

```
$ git clone https://github.com/icebob/fastest-validator.git
$ cd fastest-validator
$ npm install
$ npm run bench
```

## Installation
### NPM
You can install it via [NPM](http://npmjs.org/).
```
$ npm install fastest-validator --save
```
or 
```
$ yarn add fastest-validator
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
            expected: 3,
            actual: 2,
            field: 'name',
            message: 'The \'name\' field length must be larger than or equal to 3 characters long!'
        }
    ]
*/
```
[Try it on Runkit](https://runkit.com/icebob/fastest-validator-usage-simple)

### Fast method
In this case, the first step is to compile the schema to a compiled "checker" function. After it if you would like to validate your object, just call this "checker" function with your object.
> This method is ~10x faster than "simple method".

```js
let Validator = require("fastest-validator");

let v = new Validator();

var schema = {
    id: { type: "number", positive: true, integer: true },
    name: { type: "string", min: 3, max: 255 },
    status: "boolean" // short-hand def
};

var check = v.compile(schema);

console.log(check({ id: 5, name: "John", status: true }));
// Returns: true

console.log(check({ id: 2, name: "Adam" }));
/* Returns an array with errors:
    [
        { 
            type: 'required',
            field: 'status',
            message: 'The \'status\' field is required!'
        }
    ]
*/
```
[Try it on Runkit](https://runkit.com/icebob/fastest-validator-usage-quick)

### Browser usage
```html
<script src="https://unpkg.com/fastest-validator"></script>
```

```js
var v = new FastestValidator();

const schema = {
    id: { type: "number", positive: true, integer: true },
    name: { type: "string", min: 3, max: 255 },
    status: "boolean" // short-hand def
};

const check = v.compile(schema);

console.log(check({ id: 5, name: "John", status: true }));
// Returns: true
```

# Optional & required fields
Every fields in the schema will be required field. If you would like to define optional fields, set `optional: true`.

```js
let schema = {
    name: { type: "string" }, // required
    age: { type: "number", optional: true }
}

v.validate({ name: "John", age: 42 }, schema); // Valid
v.validate({ name: "John" }, schema); // Valid
v.validate({ age: 42 }, schema); // Fail
```

# Multiple validators
There is possible to define more validators for a field. In this case if one of all validators is success, the field will be valid.

```js
let schema = {
    cache: [
        { type: "string" },
        { type: "boolean" }
    ]
}

v.validate({ cache: true }, schema); // Valid
v.validate({ cache: "redis://" }, schema); // Valid
v.validate({ cache: 150 }, schema); // Fail
```

# Built-in validators

## `any`
This is not validate the type of value. Accept any types.

```js
let schema = {
    prop: { type: "any" }
}

v.validate({ prop: true }, schema); // Valid
v.validate({ prop: 100 }, schema); // Valid
v.validate({ prop: "John" }, schema); // Valid
```

## `array`
This is an `Array` validator. 

**Simple example with strings:**
```js
let schema = {
    roles: { type: "array", items: "string" }
}

v.validate({ roles: ["user"] }, schema); // Valid
v.validate({ roles: [] }, schema); // Valid
v.validate({ roles: "user" }, schema); // Fail
```

**Example with only positive number:**
```js
let schema = {
    list: { type: "array", min: 2, items: {
        type: "number", positive: true, integer: true
    } }
}

v.validate({ list: [2, 4] }, schema); // Valid
v.validate({ list: [1, 5, 8] }, schema); // Valid
v.validate({ list: [1] }, schema); // Fail (min 2 elements)
v.validate({ list: [1, -7] }, schema); // Fail (negative number)
```

**Example with object list:**
```js
let schema = {
    users: { type: "array", items: {
        type: "object", props: {
            id: { type: "number", positive: true },
            name: { type: "string", empty: false },
            status: "boolean"
        }
    } }
}

v.validate({ 
    users: [
        { id: 1, name: "John", status: true },
        { id: 2, name: "Jane", status: true },
        { id: 3, name: "Bill", status: false }
    ]
}, schema); // Valid
```


### Properties
Property | Default  | Description
-------- | -------- | -----------
`empty`  | `true`   | If true, the validator accepts empty array `[]`.
`min`  	 | `null`   | Minimum count of elements.
`max`  	 | `null`   | Maximum count of elements.
`length` | `null`   | Fix count of elements.
`contains` | `null` | The array must contains this element too.
`enum`	 | `null`   | Every element must be an element of the `enum` array.

**Example for `enum`:**
```js
let schema = {
    roles: { type: "array", items: "string", enum: [ "user", "admin" ] }
}

v.validate({ roles: ["user"] }, schema); // Valid
v.validate({ roles: ["user", "admin"] }, schema); // Valid
v.validate({ roles: ["guest"] }, schema); // Fail
```


## `boolean`
This is a `Boolean` validator. 

```js
let schema = {
    status: { type: "boolean" }
}

v.validate({ status: true }, schema); // Valid
v.validate({ status: false }, schema); // Valid
v.validate({ status: 1 }, schema); // Fail
v.validate({ status: "true" }, schema); // Fail
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

v.validate({ dob: new Date() }, schema); // Valid
v.validate({ dob: new Date(1488876927958) }, schema); // Valid
v.validate({ dob: 1488876927958 }, schema); // Fail
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

v.validate({ email: "john.doe@gmail.com" }, schema); // Valid
v.validate({ email: "james.123.45@mail.co.uk" }, schema); // Valid
v.validate({ email: "abc@gmail" }, schema); // Fail
```

### Properties
Property | Default  | Description
-------- | -------- | -----------
`mode`   | `quick`  | Checker method. Can be `quick` or `precise`.

## `enum`
This is an enum validator. 

```js
let schema = {
    sex: { type: "enum", values: ["male", "female"] }
}

v.validate({ sex: "male" }, schema); // Valid
v.validate({ sex: "female" }, schema); // Valid
v.validate({ sex: "other" }, schema); // Fail
```

### Properties
Property | Default  | Description
-------- | -------- | -----------
`values` | `null`   | The valid values.


## `forbidden`
This validator gives error if the property is exists in the object. 

```js
let schema = {
    password: { type: "forbidden" }
}

v.validate({ user: "John" }, schema); // Valid
v.validate({ user: "John", password: "pass1234" }, schema); // Fail
```

## `function`
The type of value must be `Function`.

```js
let schema = {
    show: { type: "function" }
}

v.validate({ show: function() {} }, schema); // Valid
v.validate({ show: Date.now }, schema); // Valid
v.validate({ show: null }, schema); // Fail
```


## `number`
This is a number validator. The type of value must be `Number`.

```js
let schema = {
    age: { type: "number" }
}

v.validate({ age: 123 }, schema); // Valid
v.validate({ age: 5.65 }, schema); // Valid
v.validate({ age: "100" }, schema); // Fail
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
This is a nested object validator.
```js
let schema = {
    address: { type: "object", props: {
        country: { type: "string" },
        city: "string", // short-hand
        zip: "number" // short-hand
    } }
}

v.validate({ 
    address: {
        country: "Italy",
        city: "Rome",
        zip: 12345
    } 
}, schema); // Valid

v.validate({ 
    address: {
        country: "Italy",
        city: "Rome"
    }
}, schema); // Fail ("The 'address.zip' field is required!")
```


## `string`
This is a `string` validator. The type of value must be `String`.

```js
let schema = {
    name: { type: "string" }
}

v.validate({ name: "John" }, schema); // Valid
v.validate({ name: "" }, schema); // Valid
v.validate({ name: 123 }, schema); // Fail
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

v.validate({ url: "http://google.com" }, schema); // Valid
v.validate({ url: "https://github.com/icebob" }, schema); // Valid
v.validate({ url: "www.facebook.com" }, schema); // Fail
```

# Custom validator
You can also create your custom validator.

```js
let v = new Validator({
    messages: {
        // Register our new error message text
        evenNumber: "The '{field}' field must be an even number! Actual: {actual}"
    }
});

// Register a custom 'even' validator
v.add("even", value => {
    if (value % 2 != 0)
        return v.makeError("evenNumber", null, value);

    return true;
});

const schema = {
    name: { type: "string", min: 3, max: 255 },
    age: { type: "even" }
};

console.log(v.validate({ name: "John", age: 20 }, schema));
// Returns: true

console.log(v.validate({ name: "John", age: 19 }, schema));
/* Returns an array with errors:
    [{
        type: 'evenNumber',
        expected: null,
        actual: 19,
        field: 'age',
        message: 'The \'age\' field must be an even number! Actual: 19'
    }]
*/
```

Or you can use the `custom` type with inline checker function:
```js
let v = new Validator({
	messages: {
		// Register our new error message text
		weightMin: "The weight must be larger than {expected}! Actual: {actual}"
	}
});

const schema = {
	name: { type: "string", min: 3, max: 255 },
	weight: { 
		type: "custom", 
		minWeight: 10, 
		check(value, schema) {
			return (value < schema.minWeight)
				? this.makeError("weightMin", schema.minWeight, value)
				: true;
		}
	}
};

console.log(v.validate({ name: "John", weight: 50 }, schema));
// Returns: true

console.log(v.validate({ name: "John", weight: 8 }, schema));
/* Returns an array with errors:
	[{ 
		type: 'weightMin',                                       
		expected: 10,                                            
		actual: 8,                                               
		field: 'weight',                                         
		message: 'The weight must be larger than 10! Actual: 8' 
	}]
*/
```

# Custom error messages (l10n)
You can set your custom messages in constructor of validator.

```js
const Validator = require("fastest-validator");
const v = new Validator({
    messages: {
        stringMin: "A(z) '{field}' mező túl rövid. Minimum: {expected}, Jelenleg: {actual}",
        stringMax: "A(z) '{field}' mező túl hosszú. Minimum: {expected}, Jelenleg: {actual}"
    }
});

v.validate({ name: "John" }, { name: { type: "string", min: 6 }});
/* Returns:
[ 
    { 
        type: 'stringMin',
        expected: 6,
        actual: 4,
        field: 'name',
        message: 'A(z) \'name\' mező túl rövid. Minimum: 6, Jelenleg: 4' 
    } 
]
*/
```

## Message types
Name                | Default text
------------------- | -------------
`required`          | The '{field}' field is required!
`string`            | The '{field}' field must be a string!
`stringEmpty`       | The '{field}' field must not be empty!
`stringMin`         | The '{field}' field length must be larger than or equal to {expected} characters long!
`stringMax`         | The '{field}' field length must be less than or equal to {expected} characters long!
`stringLength`      | The '{field}' field length must be {expected} characters long!
`stringPattern`     | The '{field}' field fails to match the required pattern!
`stringContains`    | The '{field}' field must contain the '{expected}' text!
`stringEnum`        | The '{field}' field does not match any of the allowed values!
`number`            | The '{field}' field must be a number!
`numberMin`         | The '{field}' field must be larger than or equal to {expected}!
`numberMax`         | The '{field}' field must be less than or equal to {expected}!
`numberEqual`       | The '{field}' field must be equal with {expected}!
`numberNotEqual`    | The '{field}' field can't be equal with {expected}!
`numberInteger`     | The '{field}' field must be an integer!
`numberPositive`    | The '{field}' field must be a positive number!
`numberNegative`    | The '{field}' field must be a negative number!
`array`             | The '{field}' field must be an array!
`arrayEmpty`        | The '{field}' field must not be an empty array!
`arrayMin`          | The '{field}' field must contain at least {expected} items!
`arrayMax`          | The '{field}' field must contain less than or equal to {expected} items!
`arrayLength`       | The '{field}' field must contain {expected} items!
`arrayContains`     | The '{field}' field must contain the '{expected}' item!
`arrayEnum`         | The '{field} field value '{expected}' does not match any of the allowed values!
`boolean`           | The '{field}' field must be a boolean!
`function`          | The '{field}' field must be a function!
`date`              | The '{field}' field must be a Date!
`dateMin`           | The '{field}' field must be larger than or equal to {expected}!
`dateMax`           | The '{field}' field must be less than or equal to {expected}!
`forbidden`         | The '{field}' field is forbidden!
`email`             | The '{field}' field must be a valid e-mail!

## Message fields
Name        | Description
----------- | -------------
`field`     | Name of field
`expected`  | The expected value of field
`actual`    | The actual value of field
`type`      | Type of field

## Development
```
npm run dev
```

## Test
```
npm test
```

### Coverage report
```
---------------|----------|----------|----------|----------|----------------|
File           |  % Stmts | % Branch |  % Funcs |  % Lines |Uncovered Lines |
---------------|----------|----------|----------|----------|----------------|
All files      |      100 |      100 |      100 |      100 |                |
 lib           |      100 |      100 |      100 |      100 |                |
  messages.js  |      100 |      100 |      100 |      100 |                |
  validator.js |      100 |      100 |      100 |      100 |                |
 lib/rules     |      100 |      100 |      100 |      100 |                |
  any.js       |      100 |      100 |      100 |      100 |                |
  array.js     |      100 |      100 |      100 |      100 |                |
  boolean.js   |      100 |      100 |      100 |      100 |                |
  date.js      |      100 |      100 |      100 |      100 |                |
  email.js     |      100 |      100 |      100 |      100 |                |
  forbidden.js |      100 |      100 |      100 |      100 |                |
  function.js  |      100 |      100 |      100 |      100 |                |
  number.js    |      100 |      100 |      100 |      100 |                |
  object.js    |      100 |      100 |      100 |      100 |                |
  string.js    |      100 |      100 |      100 |      100 |                |
  url.js       |      100 |      100 |      100 |      100 |                |
---------------|----------|----------|----------|----------|----------------|
```

## Contribution
Please send pull requests improving the usage and fixing bugs, improving documentation and providing better examples, or providing some testing, because these things are important.

## License
fastest-validator is available under the [MIT license](https://tldrlegal.com/license/mit-license).

## Contact

Copyright (C) 2017 Icebob

[![@icebob](https://img.shields.io/badge/github-icebob-green.svg)](https://github.com/icebob) [![@icebob](https://img.shields.io/badge/twitter-Icebobcsi-blue.svg)](https://twitter.com/Icebobcsi)
