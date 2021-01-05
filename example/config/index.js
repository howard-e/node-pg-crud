/* eslint-disable @typescript-eslint/no-var-requires, no-undef */
const dotenv = require('dotenv')
dotenv.config();

const postgres = { connectionString: process.env.POSTGRES_CONNECTION_STRING }

module.exports = {
    postgres
}
