import { and, asc, count, desc, eq, inArray } from "drizzle-orm";

import type { PaginationInfo } from "../../types/appTypes.js";
import type { DBNewRecord, DBNewRecords, DBTable, DBTableRow, InQueryData, OrderByQueryData, UpdateRecordData, WhereQueryData } from "../../types/dbTypes.js";

import db from "../../database/configuration.js";
import { executeQuery, prepareInQueryCondition, prepareOrderByQueryConditions, prepareSelectColumnsForQuery, prepareWhereQueryConditions } from "../../utils/dbUtils.js";

async function getRecordById<R extends DBTableRow, C extends keyof R = keyof R>(table: DBTable, id: number, columnsToSelect?: any): Promise<R | Pick<R, C> | null> {
  const columnsRequired = prepareSelectColumnsForQuery(table, columnsToSelect);
  const result = columnsRequired
    ? await db.select(columnsRequired).from(table).where(eq(table.id, id))
    : await db.select().from(table).where(eq(table.id, id));
  if (result.length === 0) {
    return null;
  }
  if (columnsRequired) {
    return result[0] as Pick<R, C>;
    // return result[0] as SelectedKeys<R, C>
    // return result[0] as Record<C, any>
  }
  return result[0] as R;
}

async function getRecordsConditionally<R extends DBTableRow, C extends keyof R = keyof R>(table: DBTable, whereQueryData?: WhereQueryData<R>, columnsToSelect?: any, orderByQueryData?: OrderByQueryData<R>, inQueryData?: InQueryData<R>) {
  const columnsRequired = prepareSelectColumnsForQuery(table, columnsToSelect);
  const whereConditions = prepareWhereQueryConditions(table, whereQueryData);
  const inQueryCondition = prepareInQueryCondition(table, inQueryData);
  const orderByConditions = prepareOrderByQueryConditions(table, orderByQueryData);

  const whereQuery = whereConditions ? and(...whereConditions) : null;

  const results = await executeQuery<R, C>(table, whereQuery, columnsRequired, orderByConditions, inQueryCondition);

  if (!results || results.length === 0) {
    return null;
  }

  return results;
}

async function getPaginatedRecordsConditionally<R extends DBTableRow, C extends keyof R = keyof R>(table: DBTable, page: number, pageSize: number, orderByQueryData?: OrderByQueryData<R>, whereQueryData?: WhereQueryData<R>, columnsToSelect?: any, inQueryData?: InQueryData<R>) {
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

  const pagination_info: PaginationInfo = {
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
  const results = await executeQuery<R, C>(table, whereQuery, columnsRequired, orderByConditions, inQueryCondition, paginationData);

  if (!results || results.length === 0) {
    return null;
  }

  return {
    pagination_info,
    records: results,
  };
}

async function getMultipleRecordsByAColumnValue<R extends DBTableRow, C extends keyof R = keyof R>(table: DBTable, column: C, value: any, columnsToSelect?: any, orderByQueryData?: OrderByQueryData<R>, inQueryData?: InQueryData<R>) {
  const whereQueryData: WhereQueryData<R> = {
    columns: [column],
    values: [value],
  };

  const results = await getRecordsConditionally<R, C>(table, whereQueryData, columnsToSelect, orderByQueryData, inQueryData);

  if (!results) {
    return null;
  }
  return results;
}

async function getMultipleRecordsByMultipleColumnValues<R extends DBTableRow, C extends keyof R = keyof R>(table: DBTable, columns: C[], values: any[], operator?: any[], columnsToSelect?: any, orderByQueryData?: OrderByQueryData<R>, inQueryData?: InQueryData<R>) {
  const whereQueryData: WhereQueryData<R> = {
    columns,
    values,
    operators: operator,
  };

  const results = await getRecordsConditionally<R, C>(table, whereQueryData, columnsToSelect, orderByQueryData, inQueryData);

  if (!results) {
    return null;
  }
  return results;
}

async function getSingleRecordByAColumnValue<R extends DBTableRow, C extends keyof R = keyof R>(table: DBTable, column: C, value: any, operator?: any, columnsToSelect?: any, orderByQueryData?: OrderByQueryData<R>, inQueryData?: InQueryData<R>) {
  const whereQueryData: WhereQueryData<R> = {
    columns: [column],
    values: [value],
    operators: operator,

  };

  const results = await getRecordsConditionally<R, C>(table, whereQueryData, columnsToSelect, orderByQueryData, inQueryData);

  if (!results) {
    return null;
  }
  return results[0];
}

async function getSingleRecordByMultipleColumnValues<R extends DBTableRow, C extends keyof R = keyof R>(table: DBTable, columns: C[], values: any[], operator?: any[], columnsToSelect?: any, orderByQueryData?: OrderByQueryData<R>, inQueryData?: InQueryData<R>) {
  const whereQueryData: WhereQueryData<R> = {
    columns,
    values,
    operators: operator,
  };

  const results = await getRecordsConditionally<R, C>(table, whereQueryData, columnsToSelect, orderByQueryData, inQueryData);
  if (!results) {
    return null;
  }
  return results[0];
}

async function saveSingleRecord<R extends DBTableRow>(table: DBTable, record: DBNewRecord, trx?: any) {
  const query = trx ? trx.insert(table).values(record).returning() : db.insert(table).values(record as any).returning();
  const recordSaved = await query;
  return recordSaved[0] as R;
}

async function saveRecords<R extends DBTableRow>(table: DBTable, records: DBNewRecords, trx?: any) {
  const query = trx ? trx.insert(table).values(records).returning() : db.insert(table).values(records as any).returning();
  const recordsSaved = await query;
  return recordsSaved as R[];
}

async function updateRecordById<R extends DBTableRow>(table: DBTable, id: number, record: UpdateRecordData<R>) {
  const dataWithTimeStamps = { ...record };

  const recordUpdated = await db
    .update(table)
    .set(dataWithTimeStamps)
    .where(eq(table.id, id))
    .returning();
  return recordUpdated[0] as R;
}

async function updateRecordByIdWithTrx<R extends DBTableRow>(table: DBTable, id: number, record: UpdateRecordData<R>, trx?: any) {
  const dataWithTimeStamps = { ...record };

  const queryBuilder = trx || db;

  const [updatedRecord] = await queryBuilder
    .update(table)
    .set(dataWithTimeStamps)
    .where(eq(table.id, id))
    .returning();

  return updatedRecord as R;
}

async function deleteRecordById<R extends DBTableRow>(table: DBTable, id: number) {
  const deletedRecord = await db.delete(table).where(eq(table.id, id)).returning();
  return deletedRecord[0] as R;
}

async function softDeleteRecordById<R extends DBTableRow>(table: DBTable, id: number, record: UpdateRecordData<R>) {
  return await db
    .update(table)
    .set(record)
    .where(eq(table.id, id))
    .returning();
}

async function updateMultipleRecords<R extends DBTableRow>(table: DBTable, ids: number[], record: Partial<R>): Promise<number> {
  const updatedRecords = await db.update(table)
    .set(record)
    .where(inArray(table.id, ids))
    .returning();

  return updatedRecords.length;
}

async function updateMultipleRecordsWithTrx<R extends DBTableRow>(table: DBTable, ids: number[], record: Partial<R>, trx?: any) {
  return await db.transaction(async (tx) => {
    const updatedRecords = await tx
      .update(table)
      .set(record)
      .where(inArray(table.id, ids))
      .returning();

    return updatedRecords.length;
  });
}

async function exportData(table: DBTable, projection?: any, filters?: any) {
  const intialQuery = db.select(projection).from(table);
  let finalQuery;
  if (filters && filters.length > 0) {
    finalQuery = intialQuery.where(and(...filters));
  }
  const result = await finalQuery;
  return result;
}

async function getPaginatedRecords(table: DBTable, skip: number, limit: number, filters?: any, sorting?: any, projection?: any) {
  let intialQuery: any = db.select(projection).from(table);
  if (filters && filters.length > 0) {
    intialQuery = intialQuery.where(and(...filters));
  }
  if (sorting) {
    const columnExpression = (table as any)[sorting.sort_by];
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

async function getRecordsCount(table: DBTable, filters?: any) {
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

export {
  deleteRecordById,
  exportData,
  getMultipleRecordsByAColumnValue,
  getMultipleRecordsByMultipleColumnValues,
  getPaginatedRecords,
  getPaginatedRecordsConditionally,
  getRecordById,
  getRecordsConditionally,
  getRecordsCount,
  getSingleRecordByAColumnValue,
  getSingleRecordByMultipleColumnValues,
  saveRecords,
  saveSingleRecord,
  softDeleteRecordById,
  updateMultipleRecords,
  updateMultipleRecordsWithTrx,
  updateRecordById,
  updateRecordByIdWithTrx,
};
