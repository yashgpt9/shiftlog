import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/postgres', {
  ssl: process.env.NODE_ENV === 'production' ? 'require' : false,
});

export default sql;
