import postgres from 'postgres';
import dotenv from 'dotenv';
import { writeFileSync } from 'fs';

dotenv.config({ path: '.env.local' });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('DATABASE_URL is not set in .env.local');
  process.exit(1);
}

const sql = postgres(connectionString);

async function main() {
  try {
    console.log('🔍 Fetching database schema...');
    
    const columns = await sql`
      SELECT 
        table_name, 
        column_name, 
        data_type, 
        is_nullable,
        column_default,
        character_maximum_length
      FROM information_schema.columns
      WHERE table_schema = 'public'
      ORDER BY table_name, ordinal_position;
    `;

    if (columns.length === 0) {
      console.log('No tables found in public schema.');
      return;
    }

    let md = '# QRise Database Schema\n\n';
    md += `*Generated at: ${new Date().toLocaleString()}*\n\n`;

    const grouped = columns.reduce((acc, row) => {
      if (!acc[row.table_name]) acc[row.table_name] = [];
      acc[row.table_name].push(row);
      return acc;
    }, {} as Record<string, Record<string, unknown>[]>);

    for (const [tableName, cols] of Object.entries(grouped)) {
      md += `### \`${tableName}\`\n\n`;
      md += '| Column | Type | Nullable | Default |\n';
      md += '| :--- | :--- | :--- | :--- |\n';
      
      cols.forEach((col: Record<string, unknown>) => {
        let type = col.data_type as string;
        if (col.character_maximum_length) {
          type += `(${col.character_maximum_length})`;
        }
        md += `| \`${col.column_name}\` | \`${type}\` | ${col.is_nullable} | \`${col.column_default || '-'}\` |\n`;
      });
      md += '\n';
    }

    writeFileSync('DATABASE_SCHEMA.md', md);
    console.log('✅ DATABASE_SCHEMA.md created successfully.');
  } catch (err) {
    console.error('❌ Error:', err);
  } finally {
    await sql.end();
  }
}

main();
