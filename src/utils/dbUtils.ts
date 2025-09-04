import type { SQL } from "drizzle-orm";

import { eq, getTableName, inArray, isNull, ne, sql } from "drizzle-orm";

import type { DBTable, DBTableRow, InQueryData, OrderByQueryData, WhereQueryData } from "../types/dbTypes.js";

import db from "../database/configuration.js";

function prepareSelectColumnsForQuery(table: DBTable, columnsToSelect?: any) {
  if (!columnsToSelect) {
    return null;
  }

  if (columnsToSelect.length === 0) {
    return {};
  }

  const columnsForQuery: Record<string, SQL> = {};
  // loop through columns and prepare the select query object
  columnsToSelect.map((column: string) => {
    columnsForQuery[column as string] = sql.raw(`${getTableName(table)}.${column as string}`);
    return undefined;
  });
  return columnsForQuery;
}

function prepareWhereQueryConditions<R extends DBTableRow>(table: DBTable, whereQueryData?: WhereQueryData<R>) {
  if (whereQueryData && Object.keys(whereQueryData).length > 0 && whereQueryData.columns.length > 0) {
    const { columns, values, operators } = whereQueryData;
    const whereQueries: SQL[] = [];
    for (let i = 0; i < columns.length; i++) {
      const columnName = columns[i] as string;
      const value = values[i];
      const operator = operators?.[i];
      const columnInfo = sql.raw(`${getTableName(table)}.${columnName}`);

      if (operator === "isNull") {
        whereQueries.push(isNull(sql.raw(`${getTableName(table)}.${columnName}`)));
        continue;
      }

      if (operator === "LOWER") {
        whereQueries.push(sql`LOWER(${columnInfo}) = ${value}`);
      }
      else if (typeof value === "string" && value.includes("%")) {
        whereQueries.push(sql`${columnInfo} ILIKE ${value}`);
      }
      else if (typeof value === "object" && value !== null) {
        const rangeValue = value as { gte?: Date | string; lte?: Date | string };
        if (rangeValue.gte && rangeValue.lte) {
          whereQueries.push(sql`${columnInfo} BETWEEN ${rangeValue.gte} AND ${rangeValue.lte}`);
        }
        else if (rangeValue.gte) {
          whereQueries.push(sql`${columnInfo} >= ${rangeValue.gte}`);
        }
        else if (rangeValue.lte) {
          whereQueries.push(sql`${columnInfo} <= ${rangeValue.lte}`);
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

function prepareOrderByQueryConditions<R extends DBTableRow>(table: DBTable, orderByQueryData?: OrderByQueryData<R>) {
  const orderByQueries: SQL[] = [];

  // Default to "id DESC" if no valid orderByQueryData is provided
  if (!orderByQueryData || !orderByQueryData.columns || orderByQueryData.columns.length === 0) {
    const orderByQuery = sql.raw(`${getTableName(table)}.id DESC`);
    orderByQueries.push(orderByQuery);
    return orderByQueries;
  }

  const { columns, values } = orderByQueryData;

  for (let i = 0; i < columns.length; i++) {
    const column = columns[i] as string;
    const order = (values[i] as string)?.toUpperCase(); // Normalize to uppercase

    // Validate order: only "ASC" or "DESC" are allowed
    const validOrder = order === "ASC" || order === "DESC" ? order : "ASC"; // Default to ASC if invalid
    const orderByQuery = sql.raw(`${getTableName(table)}.${column} ${validOrder}`);
    orderByQueries.push(orderByQuery);
  }

  return orderByQueries;
}

function prepareInQueryCondition<R extends DBTableRow>(table: DBTable, inQueryData?: InQueryData<R>) {
  if (inQueryData && Object.keys(inQueryData).length > 0 && inQueryData.values.length > 0) {
    const columnInfo = sql.raw(`${getTableName(table)}.${inQueryData.key as string}`);
    const inQuery = inArray(columnInfo, inQueryData.values);
    return inQuery;
  }
  return null;
}

async function executeQuery<R extends DBTableRow, C extends keyof R = keyof R>(table: DBTable, whereQuery: SQL | undefined | null, columnsRequired: Record<string, SQL> | null, orderByConditions: SQL[], inQueryCondition: SQL | null, paginationData?: { page: number; pageSize: number }) {
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
    return results as Pick<R, C>[];
  }
  return results as R[];
}

export {
  executeQuery,
  prepareInQueryCondition,
  prepareOrderByQueryConditions,
  prepareSelectColumnsForQuery,
  prepareWhereQueryConditions,
};
