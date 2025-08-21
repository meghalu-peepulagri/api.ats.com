import { eq, getTableName, inArray, isNull, ne, sql } from "drizzle-orm";
import db from "../database/configuration.js";
function prepareSelectColumnsForQuery(table, columnsToSelect) {
    if (!columnsToSelect) {
        return null;
    }
    if (columnsToSelect.length === 0) {
        return {};
    }
    const columnsForQuery = {};
    // loop through columns and prepare the select query object
    columnsToSelect.map((column) => {
        columnsForQuery[column] = sql.raw(`${getTableName(table)}.${column}`);
        return undefined;
    });
    return columnsForQuery;
}
function prepareWhereQueryConditions(table, whereQueryData) {
    if (whereQueryData && Object.keys(whereQueryData).length > 0 && whereQueryData.columns.length > 0) {
        const { columns, values, operators } = whereQueryData;
        const whereQueries = [];
        for (let i = 0; i < columns.length; i++) {
            const columnName = columns[i];
            const value = values[i];
            const operator = operators?.[i];
            const columnInfo = sql.raw(`${getTableName(table)}.${columnName}`);
            if (operator === "isNull") {
                whereQueries.push(isNull(sql.raw(`${getTableName(table)}.${columnName}`)));
                continue;
            }
            if (operator === "LOWER") {
                whereQueries.push(sql `LOWER(${columnInfo}) = ${value}`);
            }
            else if (typeof value === "string" && value.includes("%")) {
                whereQueries.push(sql `${columnInfo} ILIKE ${value}`);
            }
            else if (typeof value === "object" && value !== null) {
                const rangeValue = value;
                if (rangeValue.gte && rangeValue.lte) {
                    whereQueries.push(sql `${columnInfo} BETWEEN ${rangeValue.gte} AND ${rangeValue.lte}`);
                }
                else if (rangeValue.gte) {
                    whereQueries.push(sql `${columnInfo} >= ${rangeValue.gte}`);
                }
                else if (rangeValue.lte) {
                    whereQueries.push(sql `${columnInfo} <= ${rangeValue.lte}`);
                }
            }
            else {
                if (operator === "ne") {
                    whereQueries.push(ne(columnInfo, value));
                }
                else {
                    whereQueries.push(eq(columnInfo, value));
                }
            }
        }
        return whereQueries;
    }
    return null;
}
function prepareOrderByQueryConditions(table, orderByQueryData) {
    const orderByQueries = [];
    // Default to "id DESC" if no valid orderByQueryData is provided
    if (!orderByQueryData || !orderByQueryData.columns || orderByQueryData.columns.length === 0) {
        const orderByQuery = sql.raw(`${getTableName(table)}.id DESC`);
        orderByQueries.push(orderByQuery);
        return orderByQueries;
    }
    const { columns, values } = orderByQueryData;
    for (let i = 0; i < columns.length; i++) {
        const column = columns[i];
        const order = values[i]?.toUpperCase(); // Normalize to uppercase
        // Validate order: only "ASC" or "DESC" are allowed
        const validOrder = order === "ASC" || order === "DESC" ? order : "ASC"; // Default to ASC if invalid
        const orderByQuery = sql.raw(`${getTableName(table)}.${column} ${validOrder}`);
        orderByQueries.push(orderByQuery);
    }
    return orderByQueries;
}
function prepareInQueryCondition(table, inQueryData) {
    if (inQueryData && Object.keys(inQueryData).length > 0 && inQueryData.values.length > 0) {
        const columnInfo = sql.raw(`${getTableName(table)}.${inQueryData.key}`);
        const inQuery = inArray(columnInfo, inQueryData.values);
        return inQuery;
    }
    return null;
}
async function executeQuery(table, whereQuery, columnsRequired, orderByConditions, inQueryCondition, paginationData) {
    let dQuery = columnsRequired
        ? db.select(columnsRequired).from(table).$dynamic()
        : db.select().from(table).$dynamic();
    if (whereQuery) {
        dQuery = dQuery.where(whereQuery);
    }
    if (inQueryCondition) {
        dQuery = dQuery.where(inQueryCondition);
    }
    dQuery = dQuery.orderBy(...orderByConditions);
    if (paginationData) {
        const { page, pageSize } = paginationData;
        dQuery = dQuery.limit(pageSize).offset((page - 1) * pageSize);
    }
    const results = await dQuery;
    if (columnsRequired) {
        return results;
    }
    return results;
}
export { executeQuery, prepareInQueryCondition, prepareOrderByQueryConditions, prepareSelectColumnsForQuery, prepareWhereQueryConditions, };
