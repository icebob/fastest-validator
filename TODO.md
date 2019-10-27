# Fully rewritten codebase
Entire codebase will be rewritten. Compiler will make the source code of the check function and compile it with `new Function`.

# New `equal` type˙
It checks the value equal (`==`) with a static value. The `strict` property uses `===` to check values.

```js
{
    password: { type: "string", min: 6 },
    confirmPassword: { type: "equal", field: "password", strict: true } // strict means `===`
}
```

# Enhanced shorthand types
Using rule properties in string shorthand definition.
```js
{
    role: "string|number", // multiple types

    password: "string,min:6" // additional properties
    age: "number,optional,integer,positive,min:0,max:99", // additional properties

    retry: "number,integer,min:0 | boolean"
}
```

# Compile async validator
It compiles an async validator function which returns a Promise. On the other hand, it adds a new `customAsync` custom rule.
```js
const check = validator.compileAsync({
    username: { type: "customAsync", async check(value) { /* .... */} }
});

check(obj).then(res => {
    // Sanitized obj
}).catch(errors => {
    console.log(errors);
});
```

# Sanitizations
Some common sanitization features. It modifies the original object!

- [ ] **convert strings to numbers**
  ```js
  age: { type: "number", convert: true }
  ```
- [ ] **convert strings & numbers to booleans**
  ```js
  age: { type: "boolean", convert: true }
  ```
- [ ] **convert strings to dates**
  ```js
  age: { type: "date", convert: true }
  ```
- [ ] **trim strings**
  ```js
  name: { type: "string", trim: true }
  ```
- [ ] **left-trim strings**
  ```js
  name: { type: "string", ltrim: true }
  ```
- [ ] **right-trim strings**
  ```js
  name: { type: "string", rtrim: true }
  ```
- [ ] **lowercase strings**
  ```js
  name: { type: "string", lowercase: true }
  ```
- [ ] **uppercase strings**
  ```js
  name: { type: "string", uppercase: true }
  ```
- [ ] **normalize emails** (lowercase, ...)
  ```js
  name: { type: "email", normalize: true }
  ```
- [ ] **default value** (if `undefined`)
  ```js
  role: { type: "string", optional: true, default: "user" }
  ```
- [ ] **left padding**
  ```js
  name: { type: "string", leftpad: 5, padchar: " " }
  ```
- [ ] **right padding**
  ```js
  name: { type: "string", rightpad: 5, padchar: "0" }
  ```
- [ ] **convert (date, number, boolean) to string**
  ```js
  name: { type: "string", convert: true }
  ```
