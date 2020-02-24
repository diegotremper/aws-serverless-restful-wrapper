/* eslint-disable no-underscore-dangle */
import * as Joi from '@hapi/joi';

export const validateRequest = async (event, validators) => {
  // if we have configured validatos, ensure that will
  // consider if event doesn`t provide any property
  // and avoid that additional properties on headers, query
  // and path fails the validations
  if (validators.headers)
    validators.headers = validators.headers.required().unknown(true);
  if (validators.query)
    validators.query = validators.query.required().unknown(true);
  if (validators.path)
    validators.path = validators.path.required().unknown(true);
  if (validators.body) validators.body = validators.body.required();

  // at this point create a single request objec
  // to perform only one validation with all properties
  // aggregated in a single object
  const request = {};
  [
    { evtProp: 'body', requestProp: 'body' },
    { evtProp: 'headers', requestProp: 'headers' },
    { evtProp: 'pathParameters', requestProp: 'path' },
    { evtProp: 'queryStringParameters', requestProp: 'query' }
  ].forEach(item => {
    if (event[item.evtProp]) {
      request[item.requestProp] = event[item.evtProp];
    }
  });

  try {
    await Joi.object(validators)
      .unknown(true)
      .validateAsync(request);
  } catch (error) {
    // remove original values to avoid server information leaks
    delete error._original;
    throw error;
  }
};
