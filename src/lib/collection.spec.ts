/* eslint-disable no-template-curly-in-string */
import test from 'ava';
import { collection } from './collection';

test('it should return an event handler', t => {
  const handler = collection({ target: async () => ({}) });
  t.truthy(handler);
});

test('it fail with 415', async t => {
  const targetResult = [];
  const handler = collection({ target: async () => targetResult });
  t.truthy(handler);
  t.deepEqual(await handler({ httpMethod: 'POST', requestContext: {} }, {}), {
    body: JSON.stringify({
      message: 'Method Not Allowed: POST'
    }),
    headers: {
      'Content-Type': 'application/json',
      'X-App-Trace-Id': null
    },
    statusCode: 405
  });
});

test('it should handle event correctly', async t => {
  const targetResult = [];
  const handler = collection({ target: async () => targetResult });
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
  const targetResult = [{ id: '123', text: 'test' }];
  const decoratedReponse = [
    {
      id: '123',
      text: 'test',
      links: [
        { href: '/todos/123', rel: 'self', type: 'GET' },
        { href: '/todos/123/views', rel: 'views', type: 'GET' }
      ]
    }
  ];
  const handler = collection({
    target: async () => targetResult,
    links: {
      self: {
        type: 'GET',
        href: '${event.requestContext.path}/${item.id}'
      },
      views: {
        type: 'GET',
        href: '${event.requestContext.path}/${item.id}/views'
      }
    }
  });
  t.truthy(handler);
  t.deepEqual(
    await handler(
      { httpMethod: 'GET', requestContext: { path: '/todos' } },
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
