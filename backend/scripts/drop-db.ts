import 'dotenv/config';
import { sql } from 'drizzle-orm';
import { db } from '../lib/db';

async function dropAllTables() {
  try {
    console.log('🗑️  Dropping all tables...');
    
    // Get all table names
    const tables = await db.execute(sql`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public'
    `);
    
    // Drop each table
    for (const table of tables) {
      await db.execute(sql.raw(`DROP TABLE IF EXISTS "${table.tablename}" CASCADE`));
      console.log(`✅ Dropped table: ${table.tablename}`);
    }
    
    // Drop drizzle migrations table if exists
    await db.execute(sql`DROP TABLE IF EXISTS "__drizzle_migrations" CASCADE`);
    console.log('✅ Dropped migrations table');
    
    console.log('🎉 All tables dropped successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error dropping tables:', error);
    process.exit(1);
  }
}

dropAllTables();
