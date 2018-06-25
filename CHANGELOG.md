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