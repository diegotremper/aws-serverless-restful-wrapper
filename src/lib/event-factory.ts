/* eslint-disable no-console */
import { APIGatewayEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import {
  internalServerError,
  ok,
  badRequest,
  unsupportedMediaType,
  unsupportedMethod,
  bodyDecorator
} from './response';
import { WrapperConfig } from './config';
import { validateRequest } from './validation';
import { bodyDeserializer, UnsupportedMediaTypeError } from './request';
import { ensureProperties } from './event';

export const eventHandlerFactory = (
  config: WrapperConfig,
  supportedMethods: string[]
): Function => {
  if (!config.target || typeof config.target !== 'function') {
    throw new Error('Invalid event configuration (target not found)');
  }

  const validators = config.validators || {};
  const decorator = config.decorator || bodyDecorator;
  const links = config.links || {};
  const fn = config.target;
  const consumes = config.consumes || ['application/json'];

  return async (
    event: APIGatewayEvent,
    context: Context
  ): Promise<APIGatewayProxyResult> => {
    // normalize event
    ensureProperties(event);

    if (!supportedMethods.includes(event.httpMethod)) {
      return unsupportedMethod(event.httpMethod, context);
    }

    // deserialize request body
    if (['POST', 'PUT', 'PATCH'].includes(event.httpMethod)) {
      try {
        event.body = bodyDeserializer(event, consumes);
      } catch (error) {
        if (error instanceof UnsupportedMediaTypeError) {
          return unsupportedMediaType(error.message, context);
        } else {
          return badRequest(
            { message: 'Invalid request body', rootCause: error },
            context
          );
        }
      }
    }

    // run request validators
    try {
      await validateRequest(event, validators);
    } catch (error) {
      return badRequest(
        { message: 'Invalid request', rootCause: error },
        context
      );
    }

    // call target event
    let funcResult;
    try {
      funcResult = await fn(
        event.pathParameters,
        event.queryStringParameters,
        event.headers,
        event.body
      );
    } catch (error) {
      console.error('Unexpected error while running', event, error);
      return internalServerError(error, context);
    }

    funcResult = decorator(funcResult, links, event);

    return ok(funcResult, context);
  };
};
