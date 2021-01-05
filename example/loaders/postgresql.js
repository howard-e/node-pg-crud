/* eslint-disable @typescript-eslint/no-var-requires, no-undef */
const { Pool, Client } = require('pg')
const config = require('../config')

let connectionOptions = { connectionString: config.postgres.connectionString }

const pool = new Pool(connectionOptions)
const client = new Client(connectionOptions)

client.connect().then(() => console.info('[PostgreSQL] Connected'))

module.exports = {
    pool
}
