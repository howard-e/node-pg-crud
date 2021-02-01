import isEmpty from 'lodash.isempty';

const isValidEntry = (value: number | string | boolean): boolean | any => value === null || value === false || value === 0 || value === '' || value;

const checkForValidValues = obj => Object.keys(obj).some(key => obj[key] !== undefined);

const buildWhereEntries = (query = '', searchFields: string[], filter: Record<string, any>, tableKey?: string, isFuzzySearch?: boolean): { whereQueryText: string, filterValues: any[] } => {
    let whereQueryText = '';

    let searchResult = '';
    let filterResult = '';
    const filterValues: any[] = [];

    if (query && searchFields.length) {
        searchResult = 'where (';
        searchFields.forEach((field, index) => {
            searchResult = `${searchResult} ${field} ${isFuzzySearch ? '%' : 'ilike'} '%${query}%'`;
            if (searchFields.length > 1 && index !== searchFields.length - 1) searchResult = `${searchResult} or`;
            else searchResult = `${searchResult})`;
        });
        whereQueryText = searchResult;
    }

    if (checkForValidValues(filter) && !isEmpty(filter)) {
        const entries: any[] = [];
        filterResult = whereQueryText ? 'and (' : 'where (';
        Object.keys(filter).forEach(key => {
            if (isValidEntry(filter[key])) {
                if (tableKey) entries.push({ key: `${tableKey}.${key}`, value: filter[key] });
                else entries.push({ key, value: filter[key] });
            }
        });

        entries.forEach((entry, index) => {
            const { key, value } = entry;

            // allowing for null values to be set, work around due to SQL injection preventions
            if (value === 'null') filterResult = `${filterResult} ${key} is null`;
            else {
                filterValues.push(value);
                filterResult = `${filterResult} ${key} = $${index + 1}`;
            }

            if (index !== entries.length - 1) filterResult = `${filterResult} and`;
            else filterResult = `${filterResult})`;
        });
        whereQueryText = `${searchResult} ${filterResult}`;
    }

    return { whereQueryText, filterValues };
};

const buildSortEntries = (sort: Record<string, string> = {}): string => {
    let sortQueryText = '';

    if (!isEmpty(sort)) {
        sortQueryText = 'order by';
        Object.keys(sort).forEach((key, index, arr) => {
            sortQueryText = `${sortQueryText} ${key} ${sort[key] === 'desc' ? 'desc' : ''}${index === arr.length - 1 ? '' : ', '}`;
        });
    }

    return sortQueryText;
};

const buildUpdateEntries = (obj: Record<string, any> = {}): { updateSetQueryText: string | null, updateValues: any[] } => {
    const entries: any[] = [];
    const updateValues: any[] = [];
    Object.keys(obj).forEach(key => {
        if (isValidEntry(obj[key])) entries.push({ key, value: obj[key] });
    });

    if (!entries.length) return { updateSetQueryText: null, updateValues: [] };

    const updateSetQueryText = `set ${entries.map((entry, index) => {
        updateValues.push(entry.value);
        // index + 2 because id is the $1 property in the update queries
        return `${entry.key} = $${index + 2}`;
    })}`;

    return { updateSetQueryText, updateValues };
};

const buildValuesEntries = (values: any[] = []): string => {
    let result = '';
    values.forEach((element, index) => {
        result += `$${index + 1}${index === values.length - 1 ? '' : ', '}`;
    });
    return result;
};

export {
    isValidEntry,
    buildUpdateEntries,
    buildWhereEntries,
    buildSortEntries,
    buildValuesEntries
};
