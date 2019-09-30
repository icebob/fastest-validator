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
