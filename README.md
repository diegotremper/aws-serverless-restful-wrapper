# aws-serverless-restful-wrapper

## Install

```$ npm install aws-serverless-restful-wrapper```

## Usage

### Fetch a single resource

```GET /todos/{id}```

```javascript
const restful = require('aws-serverless-restful-wrapper')

module.exports.get = restful.resource({
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

module.exports.get = restful.resource({
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

