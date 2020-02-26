import { APIGatewayProxyResult } from 'aws-lambda';
import template from 'es6-template-strings';

export const bodyDecorator = (result: any, links, request) => {
  const isObject = typeof result === 'object' && result !== null;
  const isArray = isObject && Array.isArray(result);
  const keyLinks = Object.keys(links);
  const hasLinks = keyLinks.length > 0;

  if (isObject && !isArray && hasLinks) {
    result.links = [];
    keyLinks.forEach(key => {
      result.links.push({
        href: template(links[key].href, { item: result, request }),
        rel: key,
        type: links[key].type
      });
    });
  }

  if (isObject && isArray && hasLinks) {
    result.forEach(item => {
      item.links = [];
      keyLinks.forEach(key => {
        item.links.push({
          href: template(links[key].href, { item, request }),
          rel: key,
          type: links[key].type
        });
      });
    });
  }

  return result;
};

export const unsupportedMediaType = (
  message: string
): APIGatewayProxyResult => {
  return {
    body: JSON.stringify({ message }),
    headers: {
      'Content-Type': 'application/json'
    },
    statusCode: 415
  };
};

export const unsupportedMethod = (method: string): APIGatewayProxyResult => {
  return {
    body: JSON.stringify({ message: `Method Not Allowed: ${method}` }),
    headers: {
      'Content-Type': 'application/json'
    },
    statusCode: 405
  };
};

export const badRequest = (error): APIGatewayProxyResult => {
  return {
    body: JSON.stringify(error),
    headers: {
      'Content-Type': 'application/json'
    },
    statusCode: 400
  };
};

export const ok = (payload: any): APIGatewayProxyResult => {
  return {
    body: JSON.stringify(payload),
    headers: {
      'Content-Type': 'application/json'
    },
    statusCode: 200
  };
};

export const internalServerError = (error: any): APIGatewayProxyResult => {
  return {
    body: JSON.stringify({ message: error.message }),
    headers: {
      'Content-Type': 'application/json'
    },

    statusCode: 500
  };
};
