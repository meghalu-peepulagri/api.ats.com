import { and, asc, count, desc, eq, inArray } from "drizzle-orm";
import db from "../../database/configuration.js";
import { executeQuery, prepareInQueryCondition, prepareOrderByQueryConditions, prepareSelectColumnsForQuery, prepareWhereQueryConditions } from "../../utils/dbUtils.js";
async function getRecordById(table, id, columnsToSelect) {
    const columnsRequired = prepareSelectColumnsForQuery(table, columnsToSelect);
    const result = columnsRequired
        ? await db.select(columnsRequired).from(table).where(eq(table.id, id))
        : await db.select().from(table).where(eq(table.id, id));
    if (result.length === 0) {
        return null;
    }
    if (columnsRequired) {
        return result[0];
        // return result[0] as SelectedKeys<R, C>
        // return result[0] as Record<C, any>
    }
    return result[0];
}
async function getRecordsConditionally(table, whereQueryData, columnsToSelect, orderByQueryData, inQueryData) {
    const columnsRequired = prepareSelectColumnsForQuery(table, columnsToSelect);
    const whereConditions = prepareWhereQueryConditions(table, whereQueryData);
    const inQueryCondition = prepareInQueryCondition(table, inQueryData);
    const orderByConditions = prepareOrderByQueryConditions(table, orderByQueryData);
    const whereQuery = whereConditions ? and(...whereConditions) : null;
    const results = await executeQuery(table, whereQuery, columnsRequired, orderByConditions, inQueryCondition);
    if (!results || results.length === 0) {
        return null;
    }
    return results;
}
async function getPaginatedRecordsConditionally(table, page, pageSize, orderByQueryData, whereQueryData, columnsToSelect, inQueryData) {
    let countQuery = db.select({ total: count(table.id) }).from(table).$dynamic();
    if (whereQueryData) {
        const whereConditions = prepareWhereQueryConditions(table, whereQueryData);
        if (whereConditions) {
            countQuery = countQuery.where(and(...whereConditions));
        }
    }
    if (inQueryData && inQueryData.values.length > 0) {
        const inQueryCondition = prepareInQueryCondition(table, inQueryData);
        if (inQueryCondition) {
            countQuery = countQuery.where(inQueryCondition);
        }
    }
    const recordsCount = await countQuery;
    const total_records = recordsCount[0]?.total || 0;
    const total_pages = Math.ceil(total_records / pageSize) || 1;
    const pagination_info = {
        total_records,
        total_pages,
        page_size: pageSize,
        current_page: page > total_pages ? total_pages : page,
        next_page: page >= total_pages ? null : page + 1,
        prev_page: page <= 1 ? null : page - 1,
    };
    if (total_records === 0) {
        return {
            pagination_info,
            records: [],
        };
    }
    const columnsRequired = prepareSelectColumnsForQuery(table, columnsToSelect);
    const whereConditions = prepareWhereQueryConditions(table, whereQueryData);
    const orderByConditions = prepareOrderByQueryConditions(table, orderByQueryData);
    const inQueryCondition = prepareInQueryCondition(table, inQueryData);
    const whereQuery = whereConditions ? and(...whereConditions) : null;
    const paginationData = { page, pageSize };
    const results = await executeQuery(table, whereQuery, columnsRequired, orderByConditions, inQueryCondition, paginationData);
    if (!results || results.length === 0) {
        return null;
    }
    return {
        pagination_info,
        records: results,
    };
}
async function getMultipleRecordsByAColumnValue(table, column, value, columnsToSelect, orderByQueryData, inQueryData) {
    const whereQueryData = {
        columns: [column],
        values: [value],
    };
    const results = await getRecordsConditionally(table, whereQueryData, columnsToSelect, orderByQueryData, inQueryData);
    if (!results) {
        return null;
    }
    return results;
}
async function getMultipleRecordsByMultipleColumnValues(table, columns, values, operator, columnsToSelect, orderByQueryData, inQueryData) {
    const whereQueryData = {
        columns,
        values,
        operators: operator,
    };
    const results = await getRecordsConditionally(table, whereQueryData, columnsToSelect, orderByQueryData, inQueryData);
    if (!results) {
        return null;
    }
    return results;
}
async function getSingleRecordByAColumnValue(table, column, value, operator, columnsToSelect, orderByQueryData, inQueryData) {
    const whereQueryData = {
        columns: [column],
        values: [value],
        operators: operator,
    };
    const results = await getRecordsConditionally(table, whereQueryData, columnsToSelect, orderByQueryData, inQueryData);
    if (!results) {
        return null;
    }
    return results[0];
}
async function getSingleRecordByMultipleColumnValues(table, columns, values, operator, columnsToSelect, orderByQueryData, inQueryData) {
    const whereQueryData = {
        columns,
        values,
        operators: operator,
    };
    const results = await getRecordsConditionally(table, whereQueryData, columnsToSelect, orderByQueryData, inQueryData);
    if (!results) {
        return null;
    }
    return results[0];
}
async function saveSingleRecord(table, record, trx) {
    const query = trx ? trx.insert(table).values(record).returning() : db.insert(table).values(record).returning();
    const recordSaved = await query;
    return recordSaved[0];
}
async function saveRecords(table, records, trx) {
    const query = trx ? trx.insert(table).values(records).returning() : db.insert(table).values(records).returning();
    const recordsSaved = await query;
    return recordsSaved;
}
async function updateRecordById(table, id, record) {
    const dataWithTimeStamps = { ...record };
    const recordUpdated = await db
        .update(table)
        .set(dataWithTimeStamps)
        .where(eq(table.id, id))
        .returning();
    return recordUpdated[0];
}
async function updateRecordByIdWithTrx(table, id, record, trx) {
    const dataWithTimeStamps = { ...record };
    const queryBuilder = trx || db;
    const [updatedRecord] = await queryBuilder
        .update(table)
        .set(dataWithTimeStamps)
        .where(eq(table.id, id))
        .returning();
    return updatedRecord;
}
async function deleteRecordById(table, id) {
    const deletedRecord = await db.delete(table).where(eq(table.id, id)).returning();
    return deletedRecord[0];
}
async function softDeleteRecordById(table, id, record) {
    return await db
        .update(table)
        .set(record)
        .where(eq(table.id, id))
        .returning();
}
async function updateMultipleRecords(table, ids, record) {
    const updatedRecords = await db.update(table)
        .set(record)
        .where(inArray(table.id, ids))
        .returning();
    return updatedRecords.length;
}
async function updateMultipleRecordsWithTrx(table, ids, record, trx) {
    return await db.transaction(async (tx) => {
        const updatedRecords = await tx
            .update(table)
            .set(record)
            .where(inArray(table.id, ids))
            .returning();
        return updatedRecords.length;
    });
}
async function exportData(table, projection, filters) {
    const intialQuery = db.select(projection).from(table);
    let finalQuery;
    if (filters && filters.length > 0) {
        finalQuery = intialQuery.where(and(...filters));
    }
    const result = await finalQuery;
    return result;
}
async function getPaginatedRecords(table, skip, limit, filters, sorting, projection) {
    let intialQuery = db.select(projection).from(table);
    if (filters && filters.length > 0) {
        intialQuery = intialQuery.where(and(...filters));
    }
    if (sorting) {
        const columnExpression = table[sorting.sort_by];
        if (sorting.sort_type === "asc") {
            intialQuery = intialQuery.orderBy(asc(columnExpression));
        }
        else {
            intialQuery = intialQuery.orderBy(desc(columnExpression));
        }
    }
    else {
        intialQuery = intialQuery.orderBy(desc(table.id));
    }
    const result = await intialQuery.limit(limit).offset(skip);
    return result;
}
async function getRecordsCount(table, filters) {
    const intialQuery = db.select({ total: count() }).from(table);
    let finalQuery;
    if (filters && filters.length > 0) {
        finalQuery = intialQuery.where(and(...filters));
    }
    else {
        finalQuery = intialQuery;
    }
    const result = await finalQuery;
    return result[0].total;
}
export { deleteRecordById, exportData, getMultipleRecordsByAColumnValue, getMultipleRecordsByMultipleColumnValues, getPaginatedRecords, getPaginatedRecordsConditionally, getRecordById, getRecordsConditionally, getRecordsCount, getSingleRecordByAColumnValue, getSingleRecordByMultipleColumnValues, saveRecords, saveSingleRecord, softDeleteRecordById, updateMultipleRecords, updateMultipleRecordsWithTrx, updateRecordById, updateRecordByIdWithTrx, };
