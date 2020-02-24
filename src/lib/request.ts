import { APIGatewayEvent } from 'aws-lambda';
import { headerValue } from './event';

export class UnsupportedMediaTypeError extends Error {
  public name = 'UnsupportedMediaTypeError';
  constructor(public message: string) {
    super(message);
  }
}

export const bodyDeserializer = (
  event: APIGatewayEvent,
  consumes: string[]
) => {
  const contentType = headerValue(event, 'content-type');

  if (!consumes.includes(contentType)) {
    throw new UnsupportedMediaTypeError(
      `Unsupported Media type ${contentType}`
    );
  }

  return JSON.parse(event.body);
};
