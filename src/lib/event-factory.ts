import { WrapperConfig } from './config';
import { requestHandler } from './request-handler';
import * as vendors from './vendors';

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
    config.cloudVendor =
      config.cloudVendor || vendors.autoDetect.apply(null, args);

    const { request, resolve, reject } = vendors.translate.apply(null, [
      config.cloudVendor,
      ...args
    ]);

    requestHandler(config, request)
      .then(resolve)
      .catch(reject);
  };
};
