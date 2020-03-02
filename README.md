# aws-serverless-restful-wrapper

---
**NOTE**
This package is no longer maintained and was moved to [@cloudifyjs/restful](https://www.npmjs.com/package/@cloudifyjs/restful).
---

An API Gateway event wrapper for AWS Lambda functions for REST APIs

[![CircleCI](https://circleci.com/gh/diegotremper/aws-serverless-restful-wrapper.svg?style=svg)](https://circleci.com/gh/diegotremper/aws-serverless-restful-wrapper)
![npm](https://img.shields.io/npm/v/aws-serverless-restful-wrapper)
![npm](https://img.shields.io/npm/dw/aws-serverless-restful-wrapper)
[![codecov](https://codecov.io/gh/diegotremper/aws-serverless-restful-wrapper/branch/master/graph/badge.svg)](https://codecov.io/gh/diegotremper/aws-serverless-restful-wrapper)
[![dependencies Status](https://david-dm.org/diegotremper/aws-serverless-restful-wrapper/status.svg)](https://david-dm.org/diegotremper/aws-serverless-restful-wrapper)
[![devDependencies Status](https://david-dm.org/diegotremper/aws-serverless-restful-wrapper/dev-status.svg)](https://david-dm.org/diegotremper/aws-serverless-restful-wrapper?type=dev)
[![Known Vulnerabilities](https://snyk.io/test/github/diegotremper/aws-serverless-restful-wrapper/badge.svg?targetFile=package.json)](https://snyk.io/test/github/diegotremper/aws-serverless-restful-wrapper?targetFile=package.json) [![Greenkeeper badge](https://badges.greenkeeper.io/diegotremper/aws-serverless-restful-wrapper.svg)](https://greenkeeper.io/)

## Install

```$ npm install aws-serverless-restful-wrapper```

## Features

* Support request validation with [@hapijs/joi](https://github.com/hapijs/joi)
* Support [RESTful](https://restfulapi.net/) principle
* Support [HATEOAS](https://restfulapi.net/hateoas/) principle

## Usage

### Fetch a single document

```GET /todos/{id}```

```javascript
const restful = require('aws-serverless-restful-wrapper')

module.exports.get = restful.document({
  target: async (path, query, headers) => {
    console.log('Returning todo')
    return {
      id: '123',
      text: 'My task',
      checked: true
    }
  }
})
```

### API Gateway Response:
```json
HTTP 200
Content-Type: 'application/json'

{
  "id": "123",
  "text": "My task",
  "checked": true
}
```

### Fetch a collection

```javascript
const restful = require('aws-serverless-restful-wrapper')

module.exports.get = restful.collection({
  target: async (path, query, headers) => {
    console.log('Returning todos')
    return [
      {
        id: '1',
        text: 'My task 1',
        checked: true
      },
      {
        id: '2',
        text: 'My task 2',
        checked: true
      }
    ]
  }
})
```

### API Gateway Response:

```json
HTTP 200
Content-Type: 'application/json'

[
  {
    "id": "1",
    "text": "My task 1",
    "checked": true
  },
  {
    "id": "2",
    "text": "My task 2",
    "checked": true
  }
]
```

### Using Joi validation

```javascript
const Joi = require('@hapi/joi')
const restful = require('aws-serverless-restful-wrapper')

module.exports.get = restful.document({
  validators: {
    path: Joi.object({
      id: Joi.string().required()
    })
  },
  target: async (path, query, headers) => {
    console.log('Returning todo')
    return {
      text: 'My task',
      checked: true
    }
  }
})
```

## Contributing

* Write docs
* Suggest a feature
* Submit PRs
  * Logging
  * Support for XML based REST
* [Write exemples](https://github.com/diegotremper/aws-serverless-restful-wrapper-examples)

## License

This source code is licensed under the MIT license found in
the [LICENSE.txt](https://github.com/diegotremper/aws-serverless-restful-wrapper/blob/master/LICENSE) file.
