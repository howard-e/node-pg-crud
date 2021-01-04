import CRUDModel from './model';
import { PGPool } from './types';
import { buildUpdateEntries, buildWhereEntries, buildSortEntries, buildValuesEntries } from './utils/helpers';

/**
 * Builder to create CRUD instances for PostgreSQL database tables
 */
class CRUDBuilder {
    readonly pool: PGPool;
    readonly name: string;
    readonly table: string;
    readonly defaultSelectQuery: string;
    readonly defaultSelectWhereQuery: string;
    readonly tableKey?: string;

    /**
     * @param pool {PGPool} pool or client instance from 'pg' library
     * @param name {string} name of CRUD Model instance (typically the name of the table)
     * @param table {string} name of table in PostgreSQL database
     * @param defaultSelectQuery {string} default query to be used when querying data when none specified
     * @param defaultSelectWhereQuery {string} default filter to be used when querying data if none specified
     * @param tableKey {string} TODO
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
     * @returns CRUDModel CRUD Instance of PostgreSQL database table
     */
    build = (): CRUDModel => new CRUDModel(this.pool, this.name, this.table, this.defaultSelectQuery, this.defaultSelectWhereQuery, this.tableKey);
}

export {
    buildUpdateEntries,
    buildWhereEntries,
    buildSortEntries,
    buildValuesEntries
};

export default CRUDBuilder;
