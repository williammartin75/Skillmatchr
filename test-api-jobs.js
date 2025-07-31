const https = require('https');
const http = require('http');

console.log('🧪 Test de l\'API des jobs...');

function testAPI() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/jobs?limit=6',
      method: 'GET'
    };

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          console.log('✅ API Response:');
          console.log(`   - Jobs retournés: ${response.jobs.length}`);
          console.log(`   - Total déclaré: ${response.pagination.total}`);
          console.log(`   - Pages totales: ${response.pagination.totalPages}`);
          console.log(`   - Page actuelle: ${response.pagination.currentPage}`);
          
          if (response.jobs.length > 0) {
            console.log('\n📋 Premier job:');
            const firstJob = response.jobs[0];
            console.log(`   - Titre: ${firstJob.title}`);
            console.log(`   - Entreprise: ${firstJob.company}`);
            console.log(`   - Localisation: ${firstJob.location}`);
            console.log(`   - Source: ${firstJob.source}`);
          }
          
          resolve(response);
        } catch (error) {
          console.error('❌ Erreur parsing JSON:', error.message);
          console.error('Contenu reçu:', data.substring(0, 500));
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Erreur requête:', error.message);
      reject(error);
    });

    req.end();
  });
}

testAPI().catch(console.error);