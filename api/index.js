const path = require('path');
// Load env from backend/.env for serverless context
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

const app = require('../backend/server');

module.exports = app;
