import { pool } from "../db/index.js";
import { z } from "zod";

const QueryToolSchema = z.object({
  query: z.string().describe('SQL query to execute'),
  params: z.array(z.any()).optional().describe('Parameters for the SQL query')
});

export const handleQuery = async (args: any) => {
  const parsed = QueryToolSchema.parse(args);
  const client = await pool.connect();

  try {
    // Validar que sea una query SELECT
    const trimmedQuery = parsed.query.trim().toLowerCase();
    if (!trimmedQuery.startsWith('select')) {
      throw new Error('Only SELECT queries are allowed in query tool');
    }

    const result = await client.query(parsed.query, parsed.params || []);
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            rowCount: result.rowCount,
            rows: result.rows,
            fields: result.fields?.map(f => ({
              name: f.name,
              dataTypeID: f.dataTypeID
            }))
          }, null, 2)
        }
      ]
    };
  } finally {
    client.release();
  }
}