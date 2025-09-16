import { readFileSync } from 'fs';
import { join } from 'path';
import { pool } from './connection';

async function migrate() {
  try {
    console.log('Starting database migration...');
    
    const schemaSQL = readFileSync(join(__dirname, 'schema.sql'), 'utf8');
    
    await pool.query(schemaSQL);
    
    console.log('Database migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  migrate();
}

export { migrate };
