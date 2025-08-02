// src/config/es.js
require('dotenv').config();
const { Client } = require('@elastic/elasticsearch');

const ES_URL   = process.env.ES_URL;
const ES_INDEX = process.env.ES_INDEX;

const esClient = new Client({ node: ES_URL });

module.exports = { esClient, ES_INDEX };
