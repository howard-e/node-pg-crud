import { Pool, Client } from 'pg';

export type PGPool = Pool | Client;

export type PostgresDatabaseQueryType = {
    search?: string;
    customSearch?: string;
    filter?: Record<string, any>;
}

export type PaginationOptionsType = {
    page?: number;
    limit?: number;
    sort?: Record<string, any>;
}

export type CRUDGetResponseType = {
    total: number;
    page: number;
    pageSize: number | string;
    results: number;
    pages: number;
    data: any[];
}
