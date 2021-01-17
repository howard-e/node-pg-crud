# node-pg-crud

[![Build Status](https://travis-ci.com/howard-e/node-pg-crud.svg?branch=main)](https://travis-ci.com/howard-e/node-pg-crud)
[![Dependency Status](https://david-dm.org/howard-e/node-pg-crud.svg?branch=main)](https://david-dm.org/howard-e/node-pg-crud?branch=main)

Lightweight easy-to-use PostgreSQL CRUD handlers + utilities built. [node-postgres](https://node-postgres.com) is required.

## Installation

```bash
$ npm install node-pg-crud
```

## Usage

```javascript
const CRUDBuilder = require('node-pg-crud')
```

### CRUDBuilder

The `CRUDBuilder` object exposes a builder method to create a PostgreSQL Model, `CRUDModel` to be used to call typical
CRUD Methods (`get`, `getById`, `getByQuery`, `insert`, `put`, `delete`).

#### CRUDBuilder.setLevel(limit: number | 'all')

Sets the default limit for the number of results when the `CRUDModel.get()` method is called.

#### CRUDBuilder.build()

Returns `CRUDModel` Type.

### CRUDModel

```javascript
const CRUDModel = new CRUDBuilder(
    POOL, // Pool or Client instance from 'pg' library
    MODEL_NAME, // Name of CRUDModel instance (typically the name of the table)
    TABLE_NAME, // Name of table in PostgreSQL database
    DEFAULT_SELECT_QUERY, // Default query to be used when querying data if no custom query is specified
    DEFAULT_SELECT_WHERE_QUERY, // Default filter to be used when querying data if no custom where clause is specified
    TABLE_KEY // Optional key to set when aliasing main referenced table, eg. 'select * from users u' where 'u' is the table key
).build()
```

<br>

#### CRUDModel.get(query: {search, customSearch, filter}, pagination: {page, limit, sort}, searchFields, selectQueryText)

Returns Promise for a dataset matching the query requested with the following result structure.

###### Example:

```javascript
{
    total, // total amount of results for specific query
    page, // current page
    pageSize, // max number of items to be returned in data; can be 'all' or a number
    results, // number of items returned in data
    pages, // amount of pages given query
    data: [ // results
        {id: ..., ...},
        {},
        ...
    ]
}
```

##### query.search: String

The search parameter(s).

##### query.customSearch: String

A custom search query which is passed directly to the database.

##### query.filter: Object

Search filter options to be combined with the other filter options, and the search query where applicable.

###### Example:

```javascript 
{ status: 'active', enabled: true }
```

##### pagination.page: Integer

The requested page.

##### pagination.sort: Object

The different attributes which can be used to sort the results.

###### Example:

```javascript 
{ id: 'asc', first_name: 'desc' }
```

##### searchFields: [String]

Field names used to define what the search value is used to search through.

##### selectQueryText: String

Used to define what is being queried and to also define the structure with which the data is returned for the result's
objects.

<br>

#### CRUDModel.getById(id, selectQueryText, whereQueryText)

Returns Promise for a single object returned from the database.

##### id: String | Integer

Object ID being referenced.

##### selectQueryText: String

Used to define what is being queried and to also define the structure with which the data is returned for the result's
objects.

##### whereQueryText: String

Used to define a custom `where` clause.

<br>

#### CRUDModel.getByQuery(queryData, selectQueryText, returnAll)

Returns Promise for a single or all matching objects from the table based on a constructed query.

##### queryData: [Any]

Used to define the keys and variables being used to query.

###### Example:

```javascript
[{key: 'name', value: nameVariable}, {status: true, value: statusVariable}]
```

##### selectQueryText: String

Used to define what is being queried and to also define the structure with which the data is returned for the result's
objects.

##### returnAll: Boolean

Used to define whether the data returned is a single option or multiple.

#### CRUDModel.insert(queryText, values)

Returns Promise for the object that was inserted.

##### queryText: String

Defines the structure with which the data is inserted.

##### values: [Any]

Defines the values for the object to be inserted.

<br>

#### CRUDModel.update(id, queryText, values)

Returns Promise for the updated object.

##### id: String | Integer

Object ID being referenced.

##### queryText: String

Defines the query text for the data being updated.

##### values: [Any]

Defines the values for the object to be updated.

<br>

#### CRUDModel.remove(id, queryText, values)

Returns Promise for the updated object.

##### id: String | Integer

Object ID being referenced.

##### queryText: String

Defines the query text for the data being removed.

##### values: [Any]

Defines the values for the object to be removed.

## Examples

### Model

```javascript
const CRUDBuilder = require('node-pg-crud').default
const { buildValuesEntries, buildUpdateEntries } = require('node-pg-crud')

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
    ]
    return CRUD.get(query, pagination, searchFields, DEFAULT_SELECT_QUERY)
}

const getById = id => CRUD.getById(id, DEFAULT_SELECT_QUERY, DEFAULT_SELECT_WHERE_QUERY)

const insert = ({ first_name, last_name, email }) => {
    const values = [first_name, last_name, email]
    const valuesText = buildValuesEntries(values)
    const queryText = `insert into ${TABLE_NAME} (first_name, last_name, email) VALUES (${valuesText}) returning id`

    return CRUD.insert(queryText, values)
}

const update = async (id, { first_name, last_name, email }) => {
    const updateParams = {
        first_name,
        last_name,
        email
    }

    const { updateSetQueryText, updateValues } = buildUpdateEntries(updateParams)
    if (!updateSetQueryText) throw Error({
        id: `${MODEL_NAME.toLowerCase()}.update.error.no.input`,
        message: `Failed to update ${MODEL_NAME}. No update values found.`,
    })

    const values = [id, ...updateValues]
    const queryText = `update ${TABLE_NAME} ${updateSetQueryText} where id = $1`

    return CRUD.update(id, queryText, values)
}

const remove = id => {
    const values = [id]
    const queryText = `delete from ${TABLE_NAME} where id = $1`

    return CRUD.remove(id, queryText, values)
}

module.exports = {
    get,
    getById,
    insert,
    update,
    remove
}
```

## TODO

- [x] Provide Usage Instructions
- [x] Provide Documentation
- [x] Provide Example Project
- [ ] Provide Example Project Documentation
- [ ] Provide "Why Use This?" Section
- [ ] Add Tests
