const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'apec_database',
  user: 'postgres',
  password: 'password'
});

async function checkTorcy() {
  try {
    console.log('🔍 Vérification de Torcy dans la base de données...');
    
    // Vérifier Torcy exact
    const result1 = await pool.query('SELECT nom FROM cities WHERE nom = $1', ['Torcy']);
    console.log('Torcy exact:', result1.rows.length > 0 ? 'OUI' : 'NON');
    
    // Vérifier avec LIKE
    const result2 = await pool.query('SELECT nom FROM cities WHERE nom LIKE $1', ['%Torcy%']);
    console.log('Torcy avec LIKE:', result2.rows.length > 0 ? 'OUI' : 'NON');
    
    // Chercher des villes similaires
    const result3 = await pool.query('SELECT nom FROM cities WHERE nom LIKE $1 LIMIT 5', ['%tor%']);
    console.log('Villes contenant "tor":', result3.rows.map(r => r.nom));
    
    // Compter le total des villes
    const result4 = await pool.query('SELECT COUNT(*) as total FROM cities');
    console.log('Total des villes dans la base:', result4.rows[0].total);
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await pool.end();
  }
}

checkTorcy();