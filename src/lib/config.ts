import Joi from '@hapi/joi';
import { APIGatewayEvent } from 'aws-lambda';

interface ValidationOptions {
  body?: Joi.ObjectSchema;
  headers?: Joi.ObjectSchema;
  path?: Joi.ObjectSchema;
  query?: Joi.ObjectSchema;
}

interface ApiLink {
  href: string;
  type: string;
}

export interface WrapperConfig {
  consumes?: string[];
  decorator?: (
    result: any,
    links: { [name: string]: ApiLink },
    event: APIGatewayEvent
  ) => any;
  links?: { [name: string]: ApiLink };
  target: (
    pathParameters: { [name: string]: string },
    queryStringParameters: { [name: string]: string },
    headers: { [name: string]: string },
    body?: any
  ) => Promise<any>;
  validators?: ValidationOptions;
}
