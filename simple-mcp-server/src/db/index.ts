import pg from "pg";

export const pool = new pg.Pool({
  connectionString: 'postgresql://carloshurtado:123456@localhost:5432/postgres?schema=public',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
