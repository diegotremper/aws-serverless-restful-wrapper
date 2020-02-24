import { APIGatewayProxyEvent } from 'aws-lambda';

export const headerValue = (event: APIGatewayProxyEvent, header): string => {
  const headerKey = Object.keys(event.headers).find(
    key => key.toLowerCase() === header
  );
  return event.headers[headerKey];
};

export const ensureProperties = (event: APIGatewayProxyEvent): void => {
  event.pathParameters = event.pathParameters || {};
  event.queryStringParameters = event.queryStringParameters || {};
  event.headers = event.headers || {};
  event.requestContext.path = event.requestContext.path || event.path; // sls offline backward compatibility
};
