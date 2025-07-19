import { pool } from "../db/index.js";
import { z } from "zod";

const WriteToolSchema = z.object({
  table: z.string().describe('Table name to write to'),
  operation: z.enum(['insert', 'update', 'delete']).describe('Type of write operation'),
  data: z.record(z.any()).optional().describe('Data for insert/update operations'),
  where: z.record(z.any()).optional().describe('WHERE conditions for update/delete'),
  returning: z.array(z.string()).optional().describe('Columns to return after operation')
});


const buildInsertQuery = (table: string, data: Record<string, any>, returning?: string[]): string  => {
  const columns = Object.keys(data);
  const placeholders = columns.map((_, index) => `$${index + 1}`);
  
  let query = `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders.join(', ')})`;
  
  if (returning && returning.length > 0) {
    query += ` RETURNING ${returning.join(', ')}`;
  }
  
  return query;
}

const buildUpdateQuery = (
  table: string, 
  data: Record<string, any>, 
  where: Record<string, any>,
  returning?: string[]
): { query: string; params: any[] } => {
  const setColumns = Object.keys(data);
  const whereColumns = Object.keys(where);
  
  const setClause = setColumns.map((col, index) => `${col} = $${index + 1}`).join(', ');
  const whereClause = whereColumns.map((col, index) => 
    `${col} = $${setColumns.length + index + 1}`
  ).join(' AND ');
  
  let query = `UPDATE ${table} SET ${setClause} WHERE ${whereClause}`;
  
  if (returning && returning.length > 0) {
    query += ` RETURNING ${returning.join(', ')}`;
  }
  
  const params = [...Object.values(data), ...Object.values(where)];
  
  return { query, params };
}

const buildDeleteQuery = (
  table: string, 
  where: Record<string, any>,
  returning?: string[]
): { query: string; params: any[] } => {
  const whereColumns = Object.keys(where);
  const whereClause = whereColumns.map((col, index) => `${col} = $${index + 1}`).join(' AND ');
  
  let query = `DELETE FROM ${table} WHERE ${whereClause}`;
  
  if (returning && returning.length > 0) {
    query += ` RETURNING ${returning.join(', ')}`;
  }
  
  const params = Object.values(where);
  
  return { query, params };
}

export const handleWrite = async (args: any) => {
  const parsed = WriteToolSchema.parse(args);
  const client = await pool.connect();

  try {
    let query: string;
    let params: any[] = [];

    switch (parsed.operation) {
      case 'insert':
        if (!parsed.data) {
          throw new Error('Data is required for insert operation');
        }
        query = buildInsertQuery(parsed.table, parsed.data, parsed.returning);
        params = Object.values(parsed.data);
        break;

      case 'update':
        if (!parsed.data || !parsed.where) {
          throw new Error('Data and where conditions are required for update operation');
        }
        const updateResult = buildUpdateQuery(parsed.table, parsed.data, parsed.where, parsed.returning);
        query = updateResult.query;
        params = updateResult.params;
        break;

      case 'delete':
        if (!parsed.where) {
          throw new Error('Where conditions are required for delete operation');
        }
        const deleteResult = buildDeleteQuery(parsed.table, parsed.where, parsed.returning);
        query = deleteResult.query;
        params = deleteResult.params;
        break;

      default:
        throw new Error(`Unsupported operation: ${parsed.operation}`);
    }

    const result = await client.query(query, params);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            operation: parsed.operation,
            rowCount: result.rowCount,
            rows: result.rows
          }, null, 2)
        }
      ]
    };
  } finally {
    client.release();
  }
}