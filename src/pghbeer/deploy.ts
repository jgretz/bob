import {deploy} from '../util/deploy';

// setup api & constants
require('dotenv').config();

const API_CONFIG = {
  key: process.env.HEROKU_API_KEY,
  app: process.env.PGHBEER_APP_ID,
};

const TAR_FILENAME = 'pghbeer.tgz';
const SOURCE = './pghbeer-lib';

deploy(SOURCE, TAR_FILENAME, API_CONFIG.key, API_CONFIG.app);
