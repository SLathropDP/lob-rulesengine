# Rules Engine for Line-of-Business (LOB) Applications

[![npm version](https://badge.fury.io/js/lob-rulesengine.svg)](https://badge.fury.io/js/lob-rulesengine)
[![Known Vulnerabilities](https://snyk.io/test/github/wmitio/lob-rulesengine/badge.svg)](https://snyk.io/test/github/wmitio/lob-rulesengine)
[![CircleCI](https://circleci.com/gh/wmitio/lob-rulesengine.svg?style=shield)](https://circleci.com/gh/wmitio/lob-rulesengine)

A rules engine for LOB applications in Node.JS. This library allows you to define your rules either in JSON (declarative approach) or write JS code (programmatic approach).

## Terminology

### Business Rule

A business rule is a declarative statement that governs the conduct of a business process.
A rule consists of a condition and actions. The condition is evaluated, and if it evaluates to true, the rule engine initiates one or more actions.

### Policy

A policy is a logical grouping of policy rules. The engine evaluates all rules within a policy to determine if a fact is true or false according to the rules.

### Policy Rule

A policy rule wraps either exactly one business rule or multiple policy rules, determines the order to execute and defines the relationship to the next rule (logical connectors AND/OR).

### Fact

Facts are discrete pieces of data and are fed into the rule engine to determine wether they are true or false according to a certain policy.

## Usage

### Installation

```javascript
npm install lob-rulesengine
```

### Declarative Rules

You can specify declarative business rules by using JSON.

#### Policy Format (policy.json)

```json
  {
    "rules": [
      {
        "rule": {...},
        "name: "First rule",
        "order": 1,
        "link: "AND"
      },
      {
        "rule": {...},
        "order": 2
      },
    ]
  }
```

#### Policy rule

A policy rule that wraps a single business rule is expressed as follows:

```json
  {
    "rule": {...},
    "name: "First rule",
    "order": 1,
    "link: "AND"
  }
```

A policy rule that contains multiple subrules is defined as follows:

```json
  {
    "subrules" [
      {
        "rule": {...},
        "name: "First subrule",
        "order": 1,
        "link: "AND"
      },
      {
        "rule": {...},
        "name: "Second subrule",
        "order": 2
      }
    ],
    "order": 1,
    "link": "AND"
  }
```

A policy rule that contains subrules forces the rule engine to process to evaluate the subrules first and passing the combined result up the tree.

#### Business rule

A business rule is generally expressed via the following piece of JSON:

```json
{
  "condition": {
    "type": "predefined",
    "operation": "<NAME>",
    "params": {...}
  }
}
```

The available operations are explained below.

**Numeric operations**

- [Greather than](#greather-than)
- [Greather than equal](#greather-than-equal)
- [Less than](#less-than)
- [Less than equal](#less-than-equal)
- [Between](#between)
- [Not in](#not-in)

**String operations**

- [Required](#required)
- [Maximum length](#max-length)
- [Minimum length](#min-length)
- [Between length](#between-length)

**HTTP requests**

- [Get](#http-get)
- [Post](#http-post)

##### Greather than

Use this rule to compare numeric values.

```json
{
  "condition": {
    "type": "predefined",
    "operation": "gt",
    "params": {
      "value": "<PROPERTY PATH>",
      "other": 0,
      "message": "<ERROR MESSAGE>"
    }
  }
}
```

##### Greather than equal

Use this rule to compare numeric values.

```json
{
  "condition": {
    "type": "predefined",
    "operation": "gte",
    "params": {
      "value": "<PROPERTY PATH>",
      "other": 0,
      "message": "<ERROR MESSAGE>"
    }
  }
}
```

##### Less than

Use this rule to compare numeric values.

```json
{
  "condition": {
    "type": "predefined",
    "operation": "lt",
    "params": {
      "value": "<PROPERTY PATH>",
      "other": 50,
      "message": "<ERROR MESSAGE>"
    }
  }
}
```

##### Less than equal

Use this rule to compare numeric values.

```json
{
  "condition": {
    "type": "predefined",
    "operation": "lte",
    "params": {
      "value": "<PROPERTY PATH>",
      "other": 50,
      "message": "<ERROR MESSAGE>"
    }
  }
}
```

##### Between

Use this rule to check if a numeric value is within a certain range (includes min and max value).

```json
{
  "condition": {
    "type": "predefined",
    "operation": "between",
    "params": {
      "value": "<PROPERTY PATH>",
      "min": 0,
      "max": 60,
      "message": "<ERROR MESSAGE>"
    }
  }
}
```

##### Not in

Use this rule to check if a numeric value is not within a certain range (exclude the range from min to max value).

```json
{
  "condition": {
    "type": "predefined",
    "operation": "notin",
    "params": {
      "value": "<PROPERTY PATH>",
      "min": 0,
      "max": 60,
      "message": "<ERROR MESSAGE>"
    }
  }
}
```

##### Required

Use this rule to check wether a property is present or not.

```json
{
  "condition": {
    "type": "predefined",
    "operation": "required",
    "params": {
      "value": "<PROPERTY PATH>",
      "message": "<ERROR MESSAGE>"
    }
  }
}
```

##### Max length

Use this rule to check if a string value doesn't exceed the maximum length.

```json
{
  "condition": {
    "type": "predefined",
    "operation": "maxlength",
    "params": {
      "value": "<PROPERTY PATH>",
      "max: 150,
      "message": "<ERROR MESSAGE>"
    }
  }
}
```

##### Min length

Use this rule to check if a string value doesn't fulfill the minimum length.

```json
{
  "condition": {
    "type": "predefined",
    "operation": "minlength",
    "params": {
      "value": "<PROPERTY PATH>",
      "min: 5,
      "message": "<ERROR MESSAGE>"
    }
  }
}
```

##### Between length

Use this rule to check if the length of a string value is in a given range.

```json
{
  "condition": {
    "type": "predefined",
    "operation": "betweenlength",
    "params": {
      "value": "<PROPERTY PATH>",
      "min: 5,
      "max": 150,
      "message": "<ERROR MESSAGE>"
    }
  }
}
```

##### HTTP GET

Use this rule to perform a HTTP GET request.

```json
{
  "condition": {
    "type": "predefined",
    "operation": "httpget",
    "params": {
      "options": {
        "url": "<URL WITHOUT QUERYSTRING>",
        "method": "GET",
        ...
      }
    }
  }
}
```

The rule engine will append the fact as query string to your url and expects a JSON response in the following format:

```json
  {
    "result": false, // true to indicate condition is met; otherwise false
    "message": "<ERROR MESSAGE>" // can be omitted if result = true
  }
```

##### HTTP POST

Use this rule to perform a HTTP POST request.

```json
{
  "condition": {
    "type": "predefined",
    "operation": "httppost",
    "params": {
      "options": {
        "url": "<URL>",
        "method": "POST",
        ...
      }
    }
  }
}
```

The rule engine will alter the options before performing the POST request and append the fact as `body` and set `json: true`. The engine expects a JSON response from the endpoint in the following format:

```json
  {
    "result": false, // true to indicate condition is met; otherwise false
    "message": "<ERROR MESSAGE>" // can be omitted if result = true
  }
```

### Programmatic Rules

Instead of defining rules in JSON you can also do so in your javascript code.
You can either create pre-defined rules or write your own validation code.

#### Creating pre-defined rules

You can programmatically create a pre-defined rule via code by invoking the function `defineRule` with the JS object equivalent of the JSON objects explained above. An example for the required rule:

```javascript
  const br = new BusinessRule();
  br.defineRule({
    condition: {
      type: "predefined",
      operation: "required",
      params: {
        value: "companyName",
        message: "The company name is required."
      }
    }
  });
```

#### Writing your own rules

The engine allows you to write your own rules that simply need to return a bluebird promise that returns the following object:

```javascript
  {
    result: true, // true to indicate condition is met; otherwise false
    link: "<POLICY RULE LOGICAL LINK>" // Either AND, OR or undefined 
  }
```

The object to pass into the function `defineRule` needs to meet the following signature:

```javascript
    const br1 = new BusinessRule();
    br1.defineRule({
      condition: {
        type: "custom",
        evaluateCondition: (f, policyRule, errors, prevResult, link) => {
          const result = (f.lastName && f.firstName && f.lastName.length > 0 && f.firstName.length > 0);
          if (!result) { errors.push("First name and last name are mandatory."); }

          if (link === "AND") {
            return Promise.resolve({ result: (prevResult && result), link: policyRule.link });
          } else if (link === "OR") {
            return Promise.resolve({ result: (prevResult || result), link: policyRule.link });
          }

          return Promise.reject(`Invalid link parameter ${link}. Allowed values are 'AND' or 'OR'.`);
        }
      }
    });
```

The function `evaluateCondition` will receive the following parameters:

|Parameter |Description |
|----------|------------|
|`f` | The Fact as `Object`. |
|`policyRule` | The policy rule that is currently processed. |
|`errors`| An array of strings to push error messages into. |
|`prevResult`| The result of the previous rule, either `true` or `false`. |
|`link`| The logical link of the previous rule, either `AND` or `OR`. If no parameter is passed, please reject the promise. |

### Use the engine

To use the engine, pass the policy into the constructor and use the `checkFact` function to validate facts.

```javascript
  const p = {}; // either load the policy from JSON or create it manually by adding rules
  const eng = new RulesEngine(p);

  eng.checkFact(fact).then((check) => {
    // check is in format {result: true/false, link: undefined}
  }, (reason) => {
    // error handling
  });
```

See `spec.js` files in the test folder for more examples.

## Help and Issues

Please use GitHub issues if you need help or have issues using the library.
We welcome your feedback to continuously improve this library. :+1:

[Open an issue on GitHub](https://github.com/wmitio/lob-rulesengine/issues).

## License

This project is licensed under MIT. See [LICENSE](LICENSE) for details.

## Dependencies

- [bluebird](https://github.com/petkaantonov/bluebird/)
- [lodash](https://github.com/lodash/lodash)
- [query-string](https://github.com/sindresorhus/query-string)
- [request](https://github.com/request/request)
