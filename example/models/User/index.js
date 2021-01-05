/* eslint-disable @typescript-eslint/no-var-requires, no-undef */
const CRUDBuilder = require('node-pg-crud').default
const TABLES = require('../tables')
const { pool } = require('../../loaders/postgresql')

const MODEL_NAME = 'User'
const TABLE_NAME = TABLES.USERS
const TABLE_KEY = 'u'

const DEFAULT_SELECT_QUERY = `
${TABLE_KEY}.id,
${TABLE_KEY}.first_name,
${TABLE_KEY}.last_name,
${TABLE_KEY}.email
from ${TABLE_NAME} ${TABLE_KEY}
`
const DEFAULT_SELECT_WHERE_QUERY = `where ${TABLE_KEY}.id = $1 limit 1`

// create instance of PG CRUD Model
const CRUD = new CRUDBuilder(pool, MODEL_NAME, TABLE_NAME, DEFAULT_SELECT_QUERY, DEFAULT_SELECT_WHERE_QUERY, TABLE_KEY).build()

const get = (query = {}, pagination = {}) => {
    // use search & filter to create WHERE clause; search to do a text search across multiple columns, filter expects a where clause on a particular column
    const searchFields = [ // single and concatenated columns to search through with search parameter
        `${TABLE_KEY}.first_name || ' ' || ${TABLE_KEY}.last_name`,
        `${TABLE_KEY}.email`
    ];
    return CRUD.get(query, pagination, searchFields, DEFAULT_SELECT_QUERY)
}

module.exports = {
    get
}
