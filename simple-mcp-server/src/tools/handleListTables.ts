import { pool } from "../db/index.js";
import { z } from "zod";


const ListTablesSchema = z.object({
  schema: z.string().optional().default('public').describe('Schema name to list tables from'),
  includeViews: z.boolean().optional().default(false).describe('Include views in the results'),
  includeColumns: z.boolean().optional().default(false).describe('Include column information for each table')
});

export const handleListTables = async (args: any) => {
  const parsed = ListTablesSchema.parse(args || {});
  const client = await pool.connect();

  try {
    let tableTypes = ['BASE TABLE'];
    // if (parsed.includeViews) {
    //   tableTypes.push('VIEW');
    // }

    // Query para obtener las tablas
    const tablesQuery = `
      SELECT 
        table_name,
        table_type,
        table_schema
      FROM information_schema.tables 
      WHERE table_schema = $1 
        AND table_type = ANY($2)
      ORDER BY table_name;
    `;

    const tablesResult = await client.query(tablesQuery, [parsed.schema, tableTypes]);
    
    let tablesInfo = tablesResult.rows;

    // Si se solicita información de columnas, obtenerla para cada tabla
    if (parsed.includeColumns) {
      for (let table of tablesInfo) {
        const columnsQuery = `
          SELECT 
            column_name,
            data_type,
            is_nullable,
            column_default,
            character_maximum_length,
            numeric_precision,
            numeric_scale,
            ordinal_position
          FROM information_schema.columns 
          WHERE table_schema = $1 
            AND table_name = $2
          ORDER BY ordinal_position;
        `;

        const columnsResult = await client.query(columnsQuery, [parsed.schema, table.table_name]);
        table.columns = columnsResult.rows;
      }
    }

    // Query adicional para obtener información de índices y constraints
    const constraintsQuery = `
      SELECT 
        tc.table_name,
        tc.constraint_name,
        tc.constraint_type,
        kcu.column_name
      FROM information_schema.table_constraints tc
      LEFT JOIN information_schema.key_column_usage kcu 
        ON tc.constraint_name = kcu.constraint_name 
        AND tc.table_schema = kcu.table_schema
      WHERE tc.table_schema = $1
        AND tc.table_name = ANY($2)
      ORDER BY tc.table_name, tc.constraint_name;
    `;

    const tableNames = tablesInfo.map(t => t.table_name);
    const constraintsResult = await client.query(constraintsQuery, [parsed.schema, tableNames]);

    // Agrupar constraints por tabla
    const constraintsByTable: { [key: string]: any[] } = {};
    constraintsResult.rows.forEach(row => {
      if (!constraintsByTable[row.table_name]) {
        constraintsByTable[row.table_name] = [];
      }
      constraintsByTable[row.table_name].push({
        name: row.constraint_name,
        type: row.constraint_type,
        column: row.column_name
      });
    });

    // Agregar constraints a cada tabla
    tablesInfo.forEach(table => {
      table.constraints = constraintsByTable[table.table_name] || [];
    });

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            schema: parsed.schema,
            includeViews: parsed.includeViews,
            includeColumns: parsed.includeColumns,
            tableCount: tablesInfo.length,
            tables: tablesInfo
          }, null, 2)
        }
      ]
    };
  } finally {
    client.release();
  }
}