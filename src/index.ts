import { collection } from './lib/collection';
import { document } from './lib/document';
import { logger } from './lib/logger';
import { vendors } from './lib/vendors';

export default {
  api: {
    collection,
    document
  },
  logger,
  vendors
};
