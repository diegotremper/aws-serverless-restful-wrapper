/* eslint-disable no-template-curly-in-string */
import test from 'ava';
import { document } from './document';
import * as Joi from '@hapi/joi';

test('it should return an event handler', t => {
  const handler = document({ target: async () => ({}) });
  t.truthy(handler);
});

test('it should handle event correctly', async t => {
  const targetResult = {};
  const handler = document({ target: async () => targetResult });
  t.truthy(handler);
  t.deepEqual(await handler({ httpMethod: 'GET', requestContext: {} }, {}), {
    body: JSON.stringify(targetResult),
    headers: {
      'Content-Type': 'application/json',
      'X-App-Trace-Id': null
    },
    statusCode: 200
  });
});

test('it should decorate response object with HATEOS links', async t => {
  const targetResult = { id: '123' };
  const decoratedReponse = {
    id: '123',
    links: [
      { href: '/todos/123', rel: 'self', type: 'GET' },
      { href: '/todos/123/views', rel: 'views', type: 'GET' }
    ]
  };
  const handler = document({
    target: async () => targetResult,
    links: {
      self: {
        type: 'GET',
        href: '${event.requestContext.path}'
      },
      views: {
        type: 'GET',
        href: '${event.requestContext.path}/views'
      }
    }
  });
  t.truthy(handler);
  t.deepEqual(
    await handler(
      { httpMethod: 'GET', requestContext: { path: '/todos/123' } },
      {}
    ),
    {
      body: JSON.stringify(decoratedReponse),
      headers: {
        'Content-Type': 'application/json',
        'X-App-Trace-Id': null
      },
      statusCode: 200
    }
  );
});

test('it should handle event body properly', async t => {
  const targetResult = {};
  const handler = document({ target: async () => targetResult });
  t.truthy(handler);
  t.deepEqual(
    await handler(
      {
        httpMethod: 'POST',
        requestContext: {},
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({})
      },
      {}
    ),
    {
      body: JSON.stringify(targetResult),
      headers: {
        'Content-Type': 'application/json',
        'X-App-Trace-Id': null
      },
      statusCode: 200
    }
  );
});

test('it should return an HTTP 415', async t => {
  const targetResult = {};
  const handler = document({
    target: async () => targetResult,
    consumes: ['text/json']
  });
  t.truthy(handler);
  t.deepEqual(
    await handler(
      {
        httpMethod: 'PUT',
        requestContext: {},
        headers: { 'content-type': 'application/json' },
        body: null
      },
      {}
    ),
    {
      body: JSON.stringify({
        message: 'Unsupported Media type application/json'
      }),
      headers: {
        'Content-Type': 'application/json',
        'X-App-Trace-Id': null
      },
      statusCode: 415
    }
  );
});

test('it should return an HTTP 400 (invalid body)', async t => {
  const targetResult = {};
  const handler = document({
    target: async () => targetResult,
    consumes: ['text/json']
  });
  t.truthy(handler);
  t.deepEqual(
    await handler(
      {
        httpMethod: 'PUT',
        requestContext: {},
        headers: { 'content-type': 'text/json' },
        body: '{invalid json'
      },
      {}
    ),
    {
      body: JSON.stringify({ message: 'Invalid request body', rootCause: {} }),
      headers: {
        'Content-Type': 'application/json',
        'X-App-Trace-Id': null
      },
      statusCode: 400
    }
  );
});

test('it should return an HTTP 400 (validation error)', async t => {
  const targetResult = {};
  const handler = document({
    target: async () => targetResult,
    consumes: ['text/json'],
    validators: {
      body: Joi.object({ text: Joi.string().required() }).unknown(true)
    }
  });
  t.truthy(handler);
  t.deepEqual(
    await handler(
      {
        httpMethod: 'PUT',
        requestContext: {},
        headers: { 'content-type': 'text/json' },
        body: JSON.stringify({ checked: true })
      },
      {}
    ),
    {
      body: JSON.stringify({
        message: 'Invalid request',
        rootCause: {
          details: [
            {
              message: '"body.text" is required',
              path: ['body', 'text'],
              type: 'any.required',
              context: { label: 'body.text', key: 'text' }
            }
          ]
        }
      }),
      headers: {
        'Content-Type': 'application/json',
        'X-App-Trace-Id': null
      },
      statusCode: 400
    }
  );
});

test('it should return an HTTP 500', async t => {
  const handler = document({
    target: async () => {
      throw Error('Unhandled application error');
    },
    consumes: ['text/json'],
    validators: {
      body: Joi.object({ text: Joi.string().required() }).unknown(true)
    }
  });
  t.truthy(handler);
  t.deepEqual(
    await handler(
      {
        httpMethod: 'PUT',
        requestContext: {},
        headers: { 'content-type': 'text/json' },
        body: JSON.stringify({ text: 'new item', checked: true })
      },
      {}
    ),
    {
      body: JSON.stringify({ message: 'Unhandled application error' }),
      headers: {
        'Content-Type': 'application/json',
        'X-App-Trace-Id': null
      },
      statusCode: 500
    }
  );
});
