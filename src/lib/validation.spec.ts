import test from 'ava';
import async from 'async';
import * as Joi from '@hapi/joi';
import { validateRequest } from './validation';

test('it should validate event', async t => {
  const testCases = [
    {
      event: {},
      validators: {}
    },
    {
      event: { headers: { accept: 'application/json' } },
      validators: {}
    },
    {
      event: { body: {} },
      validators: {}
    },
    {
      event: {
        queryStringParameters: { id: '123' },
        pathParameters: { expand: true }
      },
      validators: {}
    },
    {
      event: { pathParameters: { id: '123' } },
      validators: { path: Joi.object({ id: Joi.number().required() }) }
    },
    {
      event: { queryStringParameters: { expand: 'true' } },
      validators: { query: Joi.object({ expand: Joi.string().required() }) }
    },
    {
      event: { headers: { authorication: 'Basic user:pass' } },
      validators: {
        headers: Joi.object({ authorication: Joi.string().required() })
      }
    },
    {
      event: { body: { text: 'New item', checked: true } },
      validators: {
        body: Joi.object({
          text: Joi.string().required(),
          checked: Joi.boolean().required()
        })
      }
    },
    {
      event: { queryStringParameters: {} },
      validators: { query: Joi.object({ expand: Joi.boolean() }) }
    }
  ];

  await async.each(testCases, async item => {
    await t.notThrowsAsync(async () => {
      await validateRequest(item.event, item.validators);
    });
  });
});

test('it should throw a validation error', async t => {
  const testCases = [
    {
      event: { pathParameters: { id: '123' } },
      validators: { path: Joi.object({ id: Joi.boolean().required() }) },
      message: '"path.id" must be a boolean'
    },
    {
      event: { queryStringParameters: {} },
      validators: { query: Joi.object({ id: Joi.string().required() }) },
      message: '"query.id" is required'
    },
    {
      event: { body: { checked: true } },
      validators: {
        body: Joi.object({
          text: Joi.string().required(),
          checked: Joi.boolean()
        })
      },
      message: '"body.text" is required'
    }
  ];

  await async.each(testCases, async item => {
    await t.throwsAsync(
      async () => {
        await validateRequest(item.event, item.validators);
      },
      { instanceOf: Error, message: item.message }
    );
  });
});
