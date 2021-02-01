import dotenv from 'dotenv';
import CRUDModel from './model';
import {PGPool} from './types';
import {buildUpdateEntries, buildWhereEntries, buildSortEntries, buildValuesEntries} from './utils/helpers';

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
    private isFuzzySearch = false;
    private fuzzyThreshold = 0.3;

    /**
     * @param {PGPool} pool - pool or client instance from 'pg' library
     * @param {string} name - name of CRUD Model instance (typically the name of the table)
     * @param {string} table - name of table in PostgreSQL database
     * @param {string} defaultSelectQuery - default query to be used when querying data when none specified
     * @param {string} defaultSelectWhereQuery - default filter to be used when querying data if none specified
     * @param {string} tableKey - optional key to set when aliasing main referenced table, eg. 'select * from users u' where 'u' is the table key
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
     * NB. Requires enabling trigrams on database instance. `create extension pg_trgm;`
     * @param fuzzyThreshold Accepting values between 0 and 1. Defaults to 0.3.
     */
    enableFuzzySearch = (fuzzyThreshold = 0.3): CRUDBuilder => {
        // todo: set threshold for entire db from here or allow flexibility per search inside model?

        this.isFuzzySearch = true;
        this.fuzzyThreshold = (fuzzyThreshold >= 0 || fuzzyThreshold <= 1) ? fuzzyThreshold : 0.3;
        return this;
    };

    /**
     * @returns {CRUDModel} - CRUD Instance of PostgreSQL database table
     */
    build = (): CRUDModel => new CRUDModel(this.pool, this.name, this.table, this.defaultSelectQuery, this.defaultSelectWhereQuery, this.tableKey, this.defaultLimit, this.isFuzzySearch, this.fuzzyThreshold);
}

export {
    buildUpdateEntries,
    buildWhereEntries,
    buildSortEntries,
    buildValuesEntries
};

export default CRUDBuilder;
