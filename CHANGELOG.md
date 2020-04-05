--------------------------------------------------
<a name="1.2.0"></a>
# 1.2.0 (2020-04-05)

## Changes
- Add default settings for built-in rules [#120](https://github.com/icebob/fastest-validator/issues/120) by [@erfanium](https://github.com/erfanium)
- Updated typescript definitions [#122](https://github.com/icebob/fastest-validator/issues/122) by [@erfanium](https://github.com/erfanium)

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
