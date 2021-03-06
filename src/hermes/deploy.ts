import {deploy} from '../util/deploy';

// setup api & constants
require('dotenv').config();

const API_CONFIG = {
  key: process.env.HEROKU_API_KEY,
  app: process.env.HERMES_APP_ID,
};

const TAR_FILENAME = 'hermes.tgz';
const SOURCE = './hermes-lib';

deploy(SOURCE, TAR_FILENAME, API_CONFIG.key, API_CONFIG.app);
