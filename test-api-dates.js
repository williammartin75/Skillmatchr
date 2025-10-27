const http = require('http');

console.log('🔍 Test de l\'API /api/jobs pour vérifier les dates...\n');

// Faire une requête à l'API
const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/jobs?limit=20',
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
      
      if (response.jobs && response.jobs.length > 0) {
        console.log(`📊 ${response.jobs.length} jobs reçus de l'API\n`);
        
        let countNonSpecified = 0;
        const jobsWithoutDate = [];
        
        response.jobs.forEach((job) => {
          if (job.postedDate === 'Date non spécifiée') {
            countNonSpecified++;
            jobsWithoutDate.push({
              id: job.id,
              title: job.title,
              company: job.company,
              source: job.source
            });
          }
        });
        
        console.log(`❌ Jobs avec "Date non spécifiée": ${countNonSpecified}/${response.jobs.length}\n`);
        
        if (countNonSpecified > 0) {
          console.log('📋 Liste des jobs sans date:');
          jobsWithoutDate.forEach((job, index) => {
            console.log(`${index + 1}. ID ${job.id}: "${job.title}" chez ${job.company} (${job.source})`);
          });
          
          console.log('\n🔧 SOLUTION IMMÉDIATE:');
          console.log('1. Exécutez cette commande SQL:');
          console.log('   psql -h localhost -U postgres -d jobs_database -c "');
          console.log('   UPDATE jobs SET');
          console.log('   published_at = COALESCE(published_at, created_at, posted_date, updated_at, CURRENT_TIMESTAMP),');
          console.log('   created_at = COALESCE(created_at, published_at, posted_date, updated_at, CURRENT_TIMESTAMP),');
          console.log('   posted_date = COALESCE(posted_date, published_at, created_at, updated_at, CURRENT_TIMESTAMP)');
          console.log('   WHERE published_at IS NULL;');
          console.log('   "');
          console.log('\n2. Redémarrez le serveur Next.js');
          console.log('3. Videz le cache du navigateur (Ctrl+F5)');
        } else {
          console.log('✅ Aucun job avec "Date non spécifiée" trouvé!');
          console.log('\nSi vous voyez encore des dates non spécifiées dans le navigateur:');
          console.log('1. Videz le cache du navigateur (Ctrl+F5)');
          console.log('2. Redémarrez le serveur Next.js');
        }
        
        // Afficher quelques exemples de dates formatées
        console.log('\n📅 Exemples de dates formatées:');
        response.jobs.slice(0, 5).forEach((job) => {
          console.log(`- ${job.title}: ${job.postedDate}`);
        });
        
      } else {
        console.log('❌ Aucun job reçu de l\'API');
      }
    } catch (error) {
      console.error('❌ Erreur parsing JSON:', error.message);
      console.log('Réponse brute:', data.substring(0, 200));
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Erreur appel API:', error.message);
  console.log('\n⚠️  Assurez-vous que le serveur Next.js est démarré sur http://localhost:3000');
});

req.end();