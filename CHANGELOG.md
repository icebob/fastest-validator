<a name="1.15.0"></a>

# 1.15.0 (2022-08-30)

## Changes
- fixed bug in record rule. [#307](https://github.com/icebob/fastest-validator/issues/307)
- add label support for error messages (https://github.com/icebob/fastest-validator#label-option). [#306](https://github.com/icebob/fastest-validator/pull/306)

<a name="1.14.0"></a>

# 1.14.0 (2022-08-27)

## Changes
- fix: Multi-schema nullable validators not working as expected. [#303](https://github.com/icebob/fastest-validator/issues/303)
- add new `haltOnFirstError` option (https://github.com/icebob/fastest-validator#halting). [#304](https://github.com/icebob/fastest-validator/pull/304)

<a name="1.13.0"></a>

# 1.13.0 (2022-08-15)

## Changes
- update dev dependencies.
- update d.ts
- fixing string enum check in case of optional field. [#284](https://github.com/icebob/fastest-validator/pull/284)
- date rule add convert string to number for timestamp. [#286](https://github.com/icebob/fastest-validator/pull/286)
- fix(multi): item rule has custom checker will throw error if validate. [#290](https://github.com/icebob/fastest-validator/pull/290)
- fix backward compatibility issue. [#298](https://github.com/icebob/fastest-validator/pull/298)
- add [new `Record` rule](https://github.com/icebob/fastest-validator#record). [#300](https://github.com/icebob/fastest-validator/pull/300)

<a name="1.12.0"></a>

# 1.12.0 (2021-10-17)

## Changes
- update dev dependencies.
- add parameters to dynamic default value function. E.g: `age: (schema, field, parent, context) => { ... }`
- fix typescript definitions. [#269](https://github.com/icebob/fastest-validator/pull/269), [#270](https://github.com/icebob/fastest-validator/pull/270), [#261](https://github.com/icebob/fastest-validator/pull/261)
- fix multi validate with object strict remove. [#272](https://github.com/icebob/fastest-validator/pull/272) 
- add `normalize` method. [#275](https://github.com/icebob/fastest-validator/pull/275) E.g.: `validator.normalize({ a: "string[]|optional" })`

<a name="1.11.1"></a>
# 1.11.1 (2021-07-14)

## Changes
- fix debug mode. [#237](https://github.com/icebob/fastest-validator/pull/237)
- fix object "toString" issue. [#235](https://github.com/icebob/fastest-validator/pull/235)
- remove Node 10 from CI pipeline.
- refactoring the typescript definitions. [#251](https://github.com/icebob/fastest-validator/pull/251)
- update examples in readme. [#255](https://github.com/icebob/fastest-validator/pull/255) 

--------------------------------------------------
<a name="1.11.0"></a>
# 1.11.0 (2021-05-11)

## Async custom validator supports

```js
const schema = {
    // Turn on async mode for this schema
    $$async: true,
    name: {
        type: "string",
        min: 4,
        max: 25,
        custom: async (v) => {
            await new Promise(resolve => setTimeout(resolve, 1000));
            return v.toUpperCase();
        }
    },

    username: {
        type: "custom",
        custom: async (v) => {
            // E.g. checking in the DB that whether is unique.
            await new Promise(resolve => setTimeout(resolve, 1000));
            return v.trim();
        }
    },
}
```

The compiled `check` function has an `async` property to detect this mode. If `true` it returns a `Promise`.
```js
const check = v.compile(schema);
console.log("Is async?", check.async);
```

## Meta-information for custom validators
You can pass any extra meta information for the custom validators which is available via `context.meta`.
```js
const schema = {
    name: { type: "string", custom: (value, errors, schema, name, parent, context) => {
        // Access to the meta
        return context.meta.a;
    } },
};
const check = v.compile(schema);

const res = check(obj, {
    // Passes meta information
    meta: { a: "from-meta" }
});
```

## Changes
- support default and optional in tuples and arrays [#226](https://github.com/icebob/fastest-validator/pull/226)
- fix that `this` points to the Validator instance in custom functions [#231](https://github.com/icebob/fastest-validator/pull/231)
- 
--------------------------------------------------
<a name="1.10.1"></a>
# 1.10.1 (2021-03-22)

## Changes
- fix issue with regex `pattern` in `string` rule [#221](https://github.com/icebob/fastest-validator/pull/221)
- fix returned value issue in `email` rule in case of `empty: false` [#224](https://github.com/icebob/fastest-validator/pull/224)

--------------------------------------------------
<a name="1.10.0"></a>
# 1.10.0 (2021-02-03)

## Changes
- fix issue in multiple custom validator [#203](https://github.com/icebob/fastest-validator/pull/203)
- Add `min`, `max` property to `email` rule [#213](https://github.com/icebob/fastest-validator/pull/213)
- Add `base64` property to `string` rule [#214](https://github.com/icebob/fastest-validator/pull/214)

--------------------------------------------------
<a name="1.9.0"></a>
# 1.9.0 (2020-11-16)

## Changes
- `uuid` rule supports version 0 in [#201](https://github.com/icebob/fastest-validator/pull/201) by [@intech](https://github.com/intech)

--------------------------------------------------
<a name="1.8.0"></a>
# 1.8.0 (2020-10-18)

## New `nullable` rule attribute in [#185](https://github.com/icebob/fastest-validator/pull/185)

```js
const schema = {
    age: { type: "number", nullable: true }
}
v.validate({ age: 42 }, schema); // Valid
v.validate({ age: null }, schema); // Valid
v.validate({ age: undefined }, schema); // Fail because undefined is disallowed
v.validate({}, schema); // Fail because undefined is disallowed
```

## Changes
- Shorthand for array `foo: "string[]" // means array of string` in [#190](https://github.com/icebob/fastest-validator/pull/190)
- allow converting `objectID` to `string` in in [#196](https://github.com/icebob/fastest-validator/pull/196)
 
--------------------------------------------------
<a name="1.7.0"></a>
# 1.7.0 (2020-08-30)

## Changes
- New `currency` rule by [@ishan-srivastava](https://github.com/ishan-srivastava) in [#178](https://github.com/icebob/fastest-validator/pull/178)
- fix issue in `any` rule [#185](https://github.com/icebob/fastest-validator/pull/185)
- update dev deps

--------------------------------------------------
<a name="1.6.1"></a>
# 1.6.1 (2020-08-11)

## Changes
- Fix issue with `ObjectID` rule

--------------------------------------------------
<a name="1.6.0"></a>
# 1.6.0 (2020-08-06)

## New `objectID` rule
You can validate BSON/MongoDB ObjectID's

**Example**
```js
const  { ObjectID } = require("mongodb") // or anywhere else 
const schema = {
    id: {
        type: "objectID",
        ObjectID // passing the ObjectID class
    }  
}
const check = v.compile(schema);
check({ id: "5f082780b00cc7401fb8e8fc" }) // ok
check({ id: new ObjectID() }) // ok
check({ id: "5f082780b00cc7401fb8e8" }) // Error
```

## Dynamic default value
You can use dynamic default value by defining a function that returns a value.

**Example**
In the following code, if `createdAt` field not defined in object`, the validator sets the current time into the property:
```js
const schema = {
    createdAt: {
        type: "date",
        default: () => new Date()
    }
};
const obj = {}
v.validate(obj, schema); // Valid
console.log(obj);
/*
{
    createdAt: Date(2020-07-25T13:17:41.052Z)
}
*/
```

## Changes
- Add support for uuid v6. [#181](https://github.com/icebob/fastest-validator/issues/181)
- Add `addMessage` method for using in plugins [#166](https://github.com/icebob/fastest-validator/issues/166)
- Fix uppercase uuid issue. [#176](https://github.com/icebob/fastest-validator/issues/176)
- Add `singleLine` property to `string` rule. [#180](https://github.com/icebob/fastest-validator/issues/180)

## Credits
Many thanks to @intech and @erfanium for contributing.

--------------------------------------------------
<a name="1.5.1"></a>
# 1.5.1 (2020-06-19)

## Changes
- Fixing issue with pattern & empty handling in `string` rule [#165](https://github.com/icebob/fastest-validator/issues/165)
 
--------------------------------------------------
<a name="1.5.0"></a>
# 1.5.0 (2020-06-18)

## New `tuple` validation rule
Thanks for [@Gamote](https://github.com/Gamote), in this version there is a new `tuple`. This rule checks if a value is an `Array` with the elements order as described by the schema.

**Example**
```js
const schema = {
    grade: { type: "tuple", items: ["string", "number", "string"] }
};
```

```js
const schema = {
    location: { type: "tuple", empty: false, items: [
        { type: "number", min: 35, max: 45 },
        { type: "number", min: -75, max: -65 }
    ] }
}
```

## Define aliases & custom rules in constructor options [#162](https://github.com/icebob/fastest-validator/issues/162)
You can define aliases & custom rules in constructor options instead of using `v.alias` and `v.add`.

**Example**

```js
const v = new Validator({
    aliases: {
        username: {
            type: 'string',
            min: 4,
            max: 30
        }
    },
    customRules: {
        even: function({ schema, messages }, path, context) {
            return {
                source: `
                    if (value % 2 != 0)
                        ${this.makeError({ type: "evenNumber",  actual: "value", messages })}

                    return value;
                `
            };
        })
    }
});
```

## Support plugins
Thanks for [@erfanium](https://github.com/erfanium), you can create plugin for `fastest-validator`.

**Example**
```js
// Plugin Side
function myPlugin(validator){
    // you can modify validator here
    // e.g.: validator.add(...)
    // or  : validator.alias(...)
}
// Validator Side
const v = new Validator();
v.plugin(myPlugin)
```

## Changes
- Allow `empty` property in  `string` rule with pattern [#149](https://github.com/icebob/fastest-validator/issues/149)
- Add `empty` property to `url` and `email` rule [#150](https://github.com/icebob/fastest-validator/issues/150)
- Fix custom rule issue when multiple rules [#155](https://github.com/icebob/fastest-validator/issues/155)
- Update type definition [#156](https://github.com/icebob/fastest-validator/issues/156)
 
 --------------------------------------------------
<a name="1.4.2"></a>
# 1.4.2 (2020-06-03)

## Changes
- added Deno example to readme.
- added `minProps` and `maxProps` by [@alexjab](https://github.com/alexjab) [#142](https://github.com/icebob/fastest-validator/issues/142)
- shorthand for nested objectsby [@erfanium](https://github.com/erfanium) [#143](https://github.com/icebob/fastest-validator/issues/143)
- typescript generics for `compile` method by [@Gamote](https://github.com/Gamote) [#146](https://github.com/icebob/fastest-validator/issues/146)

--------------------------------------------------
<a name="1.4.1"></a>
# 1.4.1 (2020-05-13)

## Changes
- Fix `custom` function issue in `array` rule and in root-level [#136](https://github.com/icebob/fastest-validator/issues/136), [#137](https://github.com/icebob/fastest-validator/issues/137)
 
--------------------------------------------------
<a name="1.4.0"></a>
# 1.4.0 (2020-05-08)

## New `custom` function signature
Thanks for [@erfanium](https://github.com/erfanium), in this version there is a new signature of custom check functions.
In this new function you should always return the value. It means you can change the value, thus you can also sanitize the input value.

**Old custom function:**
```js
const v = new Validator({});

const schema = {
    weight: {
        type: "custom",
        minWeight: 10,
        check(value, schema) {
            return (value < schema.minWeight)
                ? [{ type: "weightMin", expected: schema.minWeight, actual: value }]
                : true;
        }
    }
};
```

**New custom function:**
```js
const v = new Validator({
    useNewCustomCheckerFunction: true, // using new version
});

const schema = {
    name: { type: "string", min: 3, max: 255 },
    weight: {
        type: "custom",
        minWeight: 10,
        check(value, errors, schema) {
            if (value < minWeight) errors.push({ type: "weightMin", expected: schema.minWeight, actual: value });
            if (value > 100) value = 100
            return value
        }
    }
};
```

>Please note: the old version will be removed in the version 2.0.0!

The signature is used in `custom` function of built-in rules.

```js
const v = new Validator({
    useNewCustomCheckerFunction: true // using new version
});

const schema = {
    phone: { type: "string", length: 15, custom(v, errors) => {
        if (!v.startWith("+")) errors.push({ type: "phoneNumber" })
        return v.replace(/[^\d+]/g, ""); // Sanitize: remove all special chars except numbers
    } }	
};
```

--------------------------------------------------
<a name="1.3.0"></a>
# 1.3.0 (2020-04-29)

## Changes
- Add new `class` rule to check the instance of value [#126](https://github.com/icebob/fastest-validator/issues/126)
- Updated typescript definitions [#127](https://github.com/icebob/fastest-validator/issues/127) [#129](https://github.com/icebob/fastest-validator/issues/129)
- Fix deep-extend function to detect objects better. [#128](https://github.com/icebob/fastest-validator/issues/128)
- Add `hex` check to `string` rule [#132](https://github.com/icebob/fastest-validator/issues/132)
--------------------------------------------------
<a name="1.2.0"></a>
# 1.2.0 (2020-04-05)

## Changes
- Add default settings for built-in rules [#120](https://github.com/icebob/fastest-validator/issues/120) by [@erfanium](https://github.com/erfanium)
- Updated typescript definitions [#122](https://github.com/icebob/fastest-validator/issues/122) by [@FFKL](https://github.com/FFKL)

--------------------------------------------------
<a name="1.1.0"></a>
# 1.1.0 (2020-03-22)

## Changes
- New user-defined 'alias' feature [#118](https://github.com/icebob/fastest-validator/issues/118) by [@erfanium](https://github.com/erfanium)
- Add custom validation function for built-in rules [#119](https://github.com/icebob/fastest-validator/issues/119) by [@erfanium](https://github.com/erfanium)

--------------------------------------------------
<a name="1.0.2"></a>
# 1.0.2 (2020-02-09)

## Changes
- Fix string with pattern where regular expression contains a double quote [#111](https://github.com/icebob/fastest-validator/issues/111) by [@FranzZemen](https://github.com/FranzZemen)

--------------------------------------------------
<a name="1.0.1"></a>
# 1.0.1 (2020-02-01)

## Changes
- fix missing field property in custom rules [#109](https://github.com/icebob/fastest-validator/issues/109)

--------------------------------------------------
<a name="1.0.0"></a>
# 1.0.0 (2019-12-18)

## Changes
- add unique validation in array rule [#104](https://github.com/icebob/fastest-validator/pull/104)

--------------------------------------------------
<a name="1.0.0-beta4"></a>
# 1.0.0-beta4 (2019-11-17)

## Changes
- fix optional multi rule.
- fix array rule return value issue (again). 

--------------------------------------------------
<a name="1.0.0-beta2"></a>
# 1.0.0-beta2 (2019-11-15)

## Changes
- fix array rule return value issue.

--------------------------------------------------
<a name="1.0.0-beta1"></a>
# 1.0.0-beta1 (2019-11-15)

The full library has been rewritten. It uses code generators in order to be much faster.

## Breaking changes
This new version contains several breaking changes.

### Rule logic changed
The rule codes have been rewritten to code generator functions. Therefore if you use custom validators, you should rewrite them after upgrading.

### Convert values
The `number`, `boolean` and `date` rules have a `convert: true` property. In the previous version it doesn't modify the value in the checked object, just converted the value to the rules. In the version 1.0 this property converts the values in the checked object, as well.

## New

### Sanitizations
The sanitization function is implemented. There are several rules which contains sanitizers. **Please note, the sanitizers change the original checked object values.**

| Rule | Property | Description |
| ---- | -------- | ----------- |
`boolean` | `convert` | Convert the value to a boolean.
`number` | `convert` | Convert the value to a number.
`date` | `convert` | Convert the value to a date.
`string` | `trim` | Trim the value.
`string` | `trimLeft` | Left trim the value.
`string` | `trimRight` | Right trim the value.
`string` | `lowercase` | Lowercase the value.
`string` | `uppercase` | Uppercase the value.
`string` | `localeLowercase` | Lowercase the value with `String.toLocaleLowerCase`.
`string` | `localeUppercase` | Uppercase the value with `String.toLocaleUpperCase`.
`string` | `padStart` | Left padding the value.
`string` | `padEnd` | Right padding the value.
`string` | `convert` | Convert the value to a string.
`email` | `normalize` | Trim & lowercase the value.
`forbidden` | `remove` | Remove the forbidden field.
`object` | `strict: "remove"` | Remove additional properties in the object.
`*` | `default` | Use this default value if the value is `null` or `undefined`.

### Root element validation
Basically the validator expects that you want to validate a Javascript object. If you want others, you can define the root level schema, as well. In this case set the `$$root: true` property.

**Example to validate a `string` variable instead of `object`**
```js
const schema = {
    $$root: true,
    type: "string", 
    min: 3, 
    max: 6
};

v.validate("John", schema); // Valid
v.validate("Al", schema); // Fail, too short.
```

### Enhanced shorthand types
You can use string-based shorthand validation definitions in the schema with properties.

```js
{
    password: "string|min:6",
    age: "number|optional|integer|positive|min:0|max:99",

    retry: ["number|integer|min:0", "boolean"] // multiple types
}
```

## Other changes

### New `equal` rule
It checks the value equal (`==`) to a static value or another property. The `strict` property uses `===` to check values.

**Example with static value**:
```js
const schema = {
    agreeTerms: { type: "equal", value: true, strict: true } // strict means `===`
}

v.validate({ agreeTerms: true }, schema); // Valid
v.validate({ agreeTerms: false }, schema); // Fail
```

**Example with other field**:
```js
const schema = {
    password: { type: "string", min: 6 },
    confirmPassword: { type: "equal", field: "password" }
}

v.validate({ password: "123456", confirmPassword: "123456" }, schema); // Valid
v.validate({ password: "123456", confirmPassword: "pass1234" }, schema); // Fail
```

### `properties` in object rule
You can use the `properties` property besides the `props` property in the object rule.

--------------------------------------------------
<a name="0.6.19"></a>
# 0.6.19 (2019-10-25)

## Changes
- update typescript definitions.
- add "actual" variable into string messages.

--------------------------------------------------
<a name="0.6.18"></a>
# 0.6.18 (2019-09-30)

## Changes
- add `mac` and `luhn` rules by [@intech](https://github.com/intech);
- update dev dependencies.
- fix custom rule custom messages issue. [#83](https://github.com/icebob/fastest-validator/issues/83)

--------------------------------------------------
<a name="0.6.17"></a>
# 0.6.17 (2019-03-20)

## Changes
- fix typescript definitions.
- fix strict property compilation.

--------------------------------------------------
<a name="0.6.16"></a>
# 0.6.16 (2019-03-01)

## Changes
- fix typescript definitions.

--------------------------------------------------
<a name="0.6.15"></a>
# 0.6.15 (2019-02-13)

## Changes
- fix `uuid` rule. [#60](https://github.com/icebob/fastest-validator/issues/60)
- fix typescript definitions. [#59](https://github.com/icebob/fastest-validator/issues/59)

--------------------------------------------------
<a name="0.6.14"></a>
# 0.6.14 (2019-02-07)

## Changes
- add `uuid` rule by [@intech](https://github.com/intech). [#43](https://github.com/icebob/fastest-validator/issues/43)
- fix typescript exposing by [@darky](https://github.com/darky). [#58](https://github.com/icebob/fastest-validator/issues/58)
- add personalised error messages per field by [@ispyinternet](https://github.com/ispyinternet). [#57](https://github.com/icebob/fastest-validator/issues/57)
- add strict object validation by [@fabioanderegg](https://github.com/fabioanderegg) & [@mbaertschi](https://github.com/mbaertschi). [#47](https://github.com/icebob/fastest-validator/issues/47)
- linting sources.

--------------------------------------------------
<a name="0.6.13"></a>
# 0.6.13 (2019-01-22)

## Changes
- add error message for `url` rule.
- add `numeric` attribute to `string` rule.
- add `alpha`, `alphanum` & `alphadash` attributes to `string` rule.
- add `index.d.ts` file.
- fix multiple validator with different messages issue.

--------------------------------------------------
<a name="0.6.12"></a>
# 0.6.12 (2018-12-04)

## Changes
- support recursive schemas by [@andersnm](https://github.com/andersnm)
- fix irregular object property names

--------------------------------------------------
<a name="0.6.11"></a>
# 0.6.11 (2018-10-25)

## Changes
- performance improvements by [@andersnm](https://github.com/andersnm)
- rewritten schema compiling by [@andersnm](https://github.com/andersnm)

--------------------------------------------------
<a name="0.6.10"></a>
# 0.6.10 (2018-06-25)

## Changes
- fix [#27](https://github.com/icebob/fastest-validator/issues/27) - multiple optional validators

--------------------------------------------------
<a name="0.6.9"></a>
# 0.6.9 (2018-06-07)

## Changes
- fix [#25](https://github.com/icebob/fastest-validator/issues/25) - multiple optional validators
- Add new `enum` rule
    ```js
        { type: "enum", values: ["male", "female"] }
    ```

--------------------------------------------------
<a name="0.6.7"></a>
# 0.6.7 (2018-05-29)

## Changes
- supports multiple object validators [#22](https://github.com/icebob/fastest-validator/issues/22) by [@mauricedoepke](https://github.com/mauricedoepke)
    ```js
    const schema = {
        list: [
            { 
                type: "object",
                props: {
                    name: {type: "string"},
                    age: {type: "number"},
                } 
            },
            { 
                type: "object",
                props: {
                    country: {type: "string"},
                    code: {type: "string"},
                } 
            }
        ]
    };
    ```
--------------------------------------------------
<a name="0.6.6"></a>
# 0.6.6 (2018-04-04)

# Access to the original object in custom validator [#5](https://github.com/icebob/fastest-validator/issues/5)

```js
const schema = {
    email: { 
        type: "custom", 
        check(value, schema, stack, obj) {
            return obj.username || obj.email ? null : this.makeError(...);
        }
    }
};
```
