import { Pool, Client } from 'pg';
import CRUDModel from './model';
import { buildUpdateEntries, buildWhereEntries, buildSortEntries, buildValuesEntries } from './utils/helpers';
class CRUDBuilder {
    readonly pool: Pool | Client;
    readonly name: string;
    readonly table: string;
    readonly defaultSelectQuery: string;
    readonly defaultSelectWhereQuery: string;
    readonly tableKey?: string;

    constructor(pool: Pool | Client, name: string, table: string, defaultSelectQuery: string, defaultSelectWhereQuery: string, tableKey?: string) {
        this.pool = pool;
        this.name = name;
        this.table = table;
        this.defaultSelectQuery = defaultSelectQuery;
        this.defaultSelectWhereQuery = defaultSelectWhereQuery;
        this.tableKey = tableKey;
    }

    build() {
        return new CRUDModel(this.pool, this.name, this.table, this.defaultSelectQuery, this.defaultSelectWhereQuery, this.tableKey)
    }
}

export {
    buildUpdateEntries,
    buildWhereEntries,
    buildSortEntries,
    buildValuesEntries
};

export default CRUDBuilder;
