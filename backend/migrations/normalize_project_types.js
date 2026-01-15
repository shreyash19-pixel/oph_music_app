/**
 * Migration script to normalize project_type values in songs_register table
 * Converts:
 * - "new project" -> "New Project"
 * - "hybrid project" -> "Hybrid Project" (for regular songs) or keep "Hybrid Project" (for hybrid songs)
 * - "paid in advance" -> "Paid in Advance"
 */

// Load environment variables first
require("dotenv").config();

const db = require('../DB/connect');

async function normalizeProjectTypes() {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();
    
    console.log('Starting project_type normalization...');
    
    // First, let's see what values we have
    const [currentValues] = await connection.execute(
      `SELECT DISTINCT project_type, COUNT(*) as count 
       FROM songs_register 
       GROUP BY project_type 
       ORDER BY count DESC`
    );
    console.log('\n📊 Current project_type values in database:');
    currentValues.forEach(row => {
      console.log(`  - "${row.project_type}": ${row.count} records`);
    });
    
    // Normalize "new project" to "New Project" (using TRIM to handle any whitespace)
    // Remove the != condition as it might prevent updates due to case-insensitive comparison
    const [result1] = await connection.execute(
      `UPDATE songs_register 
       SET project_type = 'New Project' 
       WHERE LOWER(TRIM(project_type)) = 'new project'`
    );
    console.log(`\n✅ Updated ${result1.affectedRows} records: "new project" -> "New Project"`);
    
    // Normalize "hybrid project" to "Hybrid Project"
    const [result2] = await connection.execute(
      `UPDATE songs_register 
       SET project_type = 'Hybrid Project' 
       WHERE LOWER(TRIM(project_type)) = 'hybrid project'`
    );
    console.log(`✅ Updated ${result2.affectedRows} records: "hybrid project" -> "Hybrid Project"`);
    
    // Normalize "paid in advance" to "Paid in Advance"
    const [result3] = await connection.execute(
      `UPDATE songs_register 
       SET project_type = 'Paid in Advance' 
       WHERE LOWER(TRIM(project_type)) = 'paid in advance'`
    );
    console.log(`✅ Updated ${result3.affectedRows} records: "paid in advance" -> "Paid in Advance"`);
    
    // Also handle "Hybrid" (without "Project") - normalize to "Hybrid Project"
    const [result4] = await connection.execute(
      `UPDATE songs_register 
       SET project_type = 'Hybrid Project' 
       WHERE TRIM(project_type) = 'Hybrid'`
    );
    console.log(`✅ Updated ${result4.affectedRows} records: "Hybrid" -> "Hybrid Project"`);
    
    await connection.commit();
    
    console.log('✅ Project type normalization completed successfully!');
    
    // Show summary
    const [summary] = await connection.execute(
      `SELECT project_type, COUNT(*) as count 
       FROM songs_register 
       GROUP BY project_type 
       ORDER BY count DESC`
    );
    
    console.log('\n📊 Current project_type distribution:');
    summary.forEach(row => {
      console.log(`  - ${row.project_type}: ${row.count} records`);
    });
    
  } catch (error) {
    await connection.rollback();
    console.error('❌ Error normalizing project types:', error);
    throw error;
  } finally {
    connection.release();
  }
}

// Run the migration
if (require.main === module) {
  normalizeProjectTypes()
    .then(() => {
      console.log('Migration completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

module.exports = normalizeProjectTypes;

