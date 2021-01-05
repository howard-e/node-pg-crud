import dotenv from 'dotenv';
import CRUDModel from './model';
import { PGPool } from './types';
import { buildUpdateEntries, buildWhereEntries, buildSortEntries, buildValuesEntries } from './utils/helpers';

dotenv.config();

/**
 * Builder to create CRUD instances for PostgreSQL database tables
 */
class CRUDBuilder {
    private readonly pool: PGPool;
    private readonly name: string;
    private readonly table: string;
    private readonly defaultSelectQuery: string;
    private readonly defaultSelectWhereQuery: string;
    private readonly tableKey?: string;

    private defaultLimit: number | 'all' | undefined;

    /**
     * @param {PGPool} pool - pool or client instance from 'pg' library
     * @param {string} name - name of CRUD Model instance (typically the name of the table)
     * @param {string} table - name of table in PostgreSQL database
     * @param {string} defaultSelectQuery - default query to be used when querying data when none specified
     * @param {string} defaultSelectWhereQuery - default filter to be used when querying data if none specified
     * @param {string} tableKey - optional key to set when aliasing main table, eg. 'select * from users u' where 'u' is the table key
     */
    constructor(pool: PGPool, name: string, table: string, defaultSelectQuery: string, defaultSelectWhereQuery: string, tableKey?: string) {
        this.pool = pool;
        this.name = name;
        this.table = table;
        this.defaultSelectQuery = defaultSelectQuery;
        this.defaultSelectWhereQuery = defaultSelectWhereQuery;
        this.tableKey = tableKey;
    }

    /**
     * @param {number | 'all'} limit - the default limit to be used when query for data list (if override not specified); 5 otherwise
     * @returns CRUDBuilder
     */
    setLimit = (limit: number | 'all'): CRUDBuilder => {
        this.defaultLimit = limit;
        return this;
    };

    /**
     * @returns {CRUDModel} - CRUD Instance of PostgreSQL database table
     */
    build = (): CRUDModel => new CRUDModel(this.pool, this.name, this.table, this.defaultSelectQuery, this.defaultSelectWhereQuery, this.tableKey, this.defaultLimit);
}

export {
    buildUpdateEntries,
    buildWhereEntries,
    buildSortEntries,
    buildValuesEntries
};

export default CRUDBuilder;
