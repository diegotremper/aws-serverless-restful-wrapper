/* eslint-disable no-console */

const translateAws = (...args: any[]) => {
  const event = args[0];
  const awsEventCallBack = args[2];

  // normalize event
  event.pathParameters = event.pathParameters || {};
  event.queryStringParameters = event.queryStringParameters || {};
  event.headers = event.headers || {};
  event.requestContext = event.requestContext || {};

  // request normalization
  return {
    request: {
      body: event.body,
      headers: event.headers,
      httpMethod: event.httpMethod,
      path: event.requestContext.path || event.path,
      pathParameters: event.pathParameters,
      queryParameters: event.queryStringParameters
    },

    resolve: result => {
      awsEventCallBack(null, result);
    },

    reject: error => {
      console.log(error);
      awsEventCallBack(error);
    }
  };
};

const translateGoogle = (...args: any[]) => {
  const req = args[0];
  const resp = args[1];

  // request normalization
  return {
    request: {
      body: req.rawBody,
      headers: req.headers,
      httpMethod: req.method,
      path: req.originalUrl,
      pathParameters: req.params,
      queryParameters: req.query
    },

    resolve: result => {
      resp.set(result.headers);
      resp.status(result.statusCode);
      resp.send(result.body);
    },

    reject: error => {
      console.log(error);
      resp.status(500);
      resp.send('Internal Server error');
    }
  };
};

const VENDOR_MAPPING = {
  google: translateGoogle,
  aws: translateAws
};

export const autoDetect = (...args: any[]) => {
  const isGoogle =
    args[0] && args[0].headers && args[0].headers['x-cloud-trace-context'];

  return isGoogle ? 'google' : 'aws';
};

export const translate = (vendor: string, ...args: any[]) => {
  return VENDOR_MAPPING[vendor].apply(null, args);
};
