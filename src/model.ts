import { Pool, Client } from 'pg';
import { buildSortEntries, buildWhereEntries } from './utils/helpers';
import { createError } from './utils/errors';
import { CRUDGetResponseType, PaginationOptionsType, PostgresDatabaseQueryType } from './types';

class CRUDModel {
    readonly pool: Pool | Client;
    readonly name: string;
    readonly table: string;
    readonly defaultSelectQuery: string;
    readonly defaultSelectWhereQuery: string;
    readonly nameLower: string;
    readonly tableKey?: string;

    constructor(pool: Pool | Client, name: string, table: string, defaultSelectQuery: string, defaultSelectWhereQuery: string, tableKey?: string) {
        this.pool = pool;
        this.name = name;
        this.table = table;
        this.defaultSelectQuery = defaultSelectQuery;
        this.defaultSelectWhereQuery = defaultSelectWhereQuery;
        this.nameLower = name.toLowerCase();
        this.tableKey = tableKey;
    }

    /**
     * Base CRUD Method used to return results from collections.
     * @param {object} query - The query object to provide different querying options for the get collections endpoint.
     * @param {string} [query.search] - The search parameter to be used when querying collection.
     * @param {string} [query.customSearch] - A custom search query which is passed directly to the database.
     * @param {object} [query.filter] - Search filter options to be ANDed with the other other filter options and the search query.
     * @param {object} pagination - The pagination object to provide different pagination options for the get collections endpoint.
     * @param {number} [pagination.page=0] - The requested page.
     * @param {limit} [pagination.limit=5] - The max results for the returned page.
     * @param {object} [pagination.sort={attribute: string}] - The different attributes which can be used to sort the results. eg. {id: 'asc', first_name: 'desc'}
     * @param {string[]} [searchFields] - Field names used to define what the query value is used to search through.
     * @param {string} selectQueryText - Used to define the structure with which the data is returned for the result's objects.
     * @returns {Promise<{total: number, page: number, pageSize: limit, results: number, pages: 1, data: []}>} - Promisified query result.
     */
    get(query: PostgresDatabaseQueryType = {}, pagination: PaginationOptionsType = {}, searchFields: string[] = [], selectQueryText = `* from ${this.table}`): Promise<CRUDGetResponseType> {
        return new Promise((resolve, reject) => {
            const { search, customSearch, filter = {} } = query;
            let { page = 0, limit = 5, sort } = pagination;
            if (page < 0) page = 0; // because Postgres cannot process an offset that is negative

            if (!sort) sort = { id: 'asc' };

            const { whereQueryText, filterValues } = buildWhereEntries(search, searchFields, filter, this.tableKey);
            const sortQueryText = buildSortEntries(sort);

            let showAllResults = false;
            if (limit < 0) showAllResults = true;

            // limit = limit < 0 ? 'all' : limit;
            const skip = limit < 0 ? 0 : page * limit;

            // used to combine custom query and machine built query given search param and search fields
            const whereClause = search && customSearch ? `${whereQueryText} ${customSearch?.replace('where', 'and')}` : customSearch || whereQueryText

            const queryText = `
            select
               ${selectQueryText}
               ${whereClause}
               ${sortQueryText}
               limit ${showAllResults ? 'all' : limit}
               offset ${skip};
            `;

            const countQueryText = `select count(*) from (select ${selectQueryText} ${customSearch || whereQueryText}) count`;

            this.pool.query(queryText, filterValues, async (error, result) => {
                if (error) return reject(error);

                const countResult = await this.pool.query(countQueryText, filterValues);

                const { rows = [] } = result;
                const total = Number(countResult.rows[0].count || 0);
                const pages = Math.ceil(total / limit) || 1;
                return resolve({
                    total, // total amount of results for specific query
                    page: page + 1, // current page
                    pageSize: showAllResults ? 'all' : limit, // max number of items to be returned in data
                    results: rows.length, // number of items actually returned in data
                    pages: pages < 1 ? 1 : pages, // amount of pages
                    data: rows // results
                });
            });
        });
    }

    /**
     * Base CRUD Method used to return a single object from the collections based on an id.
     * @param {string} id - The object id being referenced.
     * @param {string} selectQueryText - Used to define the structure with which the data is returned for the result's object.
     * @param {string} whereQueryText - Used to define how the single result is found. Defaults to using an id.
     * @returns {Promise<object>} - Promisified query result.
     */
    getById(id, selectQueryText = `id from ${this.table}`, whereQueryText = 'where id = $1 limit 1') {
        return new Promise((resolve, reject) => {
            const values = [id];
            const queryText = `
            select 
               ${selectQueryText}
               ${whereQueryText}
            `;

            this.pool.query(queryText, values, (error, result) => {
                if (error) return reject(error);

                const { rows = [] } = result;
                if (rows.length) return resolve(rows[0]);
                return reject(createError(`Failed to retrieve ${this.name}.`, `${this.nameLower}.fetch.error.empty.result`, {}));
            });
        });
    }

    /**
     * Base CRUD Method used to return a single object form the collections based on a query.
     * @param {any[]} queryData - Field to use to define the keys and variables being used to query for an object.
     * @param {string} selectQueryText - Used to define the structure with which the data is returned for the result's object.
     * @param {boolean} returnAll - Used to define whether or not the data returned is a single option or multiple.
     */
    getByQuery(queryData: any[] = [], selectQueryText = `id from ${this.table}`, returnAll = false) {
        return new Promise((resolve, reject) => {
            if (!queryData.length) return reject(createError(`Unable to query ${this.table}.`, `${this.nameLower}.fetch.by.query.empty.query.array`, {}));

            const values = queryData.map(obj => obj.value);
            const whereQueryText = `where ${queryData.map((obj, index) => `${obj.key} = $${index + 1} ${queryData.length - 1 === index ? 'limit 1' : 'and '}`)}`.replace(/,/g, '');

            const queryText = `
            select
                ${selectQueryText}
                ${whereQueryText}
            `;

            this.pool.query(queryText, values, (error, result) => {
                if (error) return reject(error);

                const { rows = [] } = result;
                if (rows.length) return resolve(returnAll ? rows : rows[0]);
                return reject(createError(`Failed to retrieve ${this.name}.`, `${this.nameLower}.fetch.by.query.error.empty.result`, {}));
            });
        });
    }

    /**
     * Base CRUD Method used to add a new object for a collection.
     * @param {string} queryText - Defines the structure with which the data is inserted.
     * @param {any[]} values - Defines the values for the object to be inserted.
     * @returns {Promise<getById>} - The {@link getById} Promisified result.
     */
    insert(queryText: string, values: any[]): Promise<Record<string, any>> {
        return new Promise((resolve, reject) => {
            if (!queryText) return reject(createError(`Missing ${this.name} insert query.`, `${this.nameLower}.insert.empty.query`));

            this.pool.query(queryText, values, (error, result) => {
                if (error) return reject(error);

                const { rows = [] } = result;
                if (rows.length) return resolve(this.getById(rows[0].id, this.defaultSelectQuery, this.defaultSelectWhereQuery));
                return reject(createError(`Failed to create ${this.name}.`, `${this.nameLower}.insert.error.empty.result`, {}));
            });
        });
    }

    /**
     * Base CRUD Method used to update an object from a collection by a given id.
     * @param {string} id - The object id being referenced.
     * @param {string} queryText - Defines the structure of the data being updated.
     * @param {any[]} values - Defines the values used to update the object.
     * @returns {Promise<getById>} - The {@link getById} Promisified result.
     */
    update(id, queryText, values) {
        return new Promise((resolve, reject) => {
            if (!queryText) return reject(createError(`Missing ${this.name} update query.`, `${this.nameLower}.update.empty.query`));

            this.pool.query(queryText, values, (error, result) => {
                if (error) return reject(error);

                const { rows, rowCount } = result;
                if (rowCount) return resolve(this.getById(id, this.defaultSelectQuery, this.defaultSelectWhereQuery));
                return reject(createError(`Failed to update ${this.name}. ${this.name} not found.`, `${this.nameLower}.update.error.id.not.found`, {}));
            });
        });
    }

    /**
     * Base CRUD Method used to remove an object from a collection by a given id.
     * @param {string} id - The object id being referenced.
     * @param {string} queryText - Defines the query to select the data to be removed.
     * @param {any[]} values - Defines the values used to update the object.
     * @returns {Promise<>} - Empty Promise result if successful.
     */
    remove(id, queryText = `delete from ${this.table} where id = $1`, values) {
        return new Promise((resolve, reject) => {
            this.pool.query(queryText, values, (error, result) => {
                if (error) return reject(error);
                // can check result.rowCount for confirmation of deletion but not really needed
                resolve(true);
            });
        });
    }
}

export default CRUDModel;
