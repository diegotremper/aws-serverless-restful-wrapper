/* eslint-disable no-console */
import { APIGatewayEvent } from 'aws-lambda';
import { WrapperConfig } from './config';
import { requestHandler } from './request-handler';

export const eventHandlerFactory = (
  config: WrapperConfig,
  supportedMethods: string[]
): Function => {
  if (!config.target || typeof config.target !== 'function') {
    throw new Error('Invalid event configuration (target not found)');
  }

  config.validators = config.validators || {};
  config.links = config.links || {};
  config.consumes = config.consumes || ['application/json'];
  config.supportedMethods = supportedMethods;

  return (...args: any[]) => {
    const isGoogle = args[0].headers && args[0].headers['x-cloud-trace-context'];
    const isAws = !isGoogle;

    let request;
    let resolve;
    let reject;

    if (isAws) {
      const event: APIGatewayEvent = args[0];
      const awsEventCallBack: Function = args[2];

      // normalize event
      event.pathParameters = event.pathParameters || {};
      event.queryStringParameters = event.queryStringParameters || {};
      event.headers = event.headers || {};

      // request normalization
      request = {
        body: event.body,
        headers: event.headers,
        httpMethod: event.httpMethod,
        path: event.requestContext.path || event.path,
        pathParameters: event.pathParameters,
        queryParameters: event.queryStringParameters
      };

      resolve = result => {
        awsEventCallBack(null, result);
      };

      reject = error => {
        console.log(error);
        awsEventCallBack(error);
      };
    }

    if (isGoogle) {
      const req = args[0];
      const resp = args[1];

      // request normalization
      request = {
        body: req.rawBody,
        headers: req.headers,
        httpMethod: req.method,
        path: req.originalUrl,
        pathParameters: req.params,
        queryParameters: req.query
      };

      resolve = result => {
        resp.set(result.headers);
        resp.status(result.statusCode).send(result.body);
      };

      reject = error => {
        console.log(error);
        resp.status(500).send('Internal Server error');
      };
    }

    requestHandler(config, request)
      .then(resolve)
      .catch(reject);
  };
};
