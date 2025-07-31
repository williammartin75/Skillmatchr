// Script de test des performances de l'algorithme de matching
const https = require('https');
const http = require('http');

const BASE_URL = 'http://localhost:3006';

// Fonction pour faire une requête HTTP
function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    
    client.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve(jsonData);
        } catch (error) {
          reject(error);
        }
      });
    }).on('error', (error) => {
      reject(error);
    });
  });
}

// Test des performances
async function testPerformance() {
  console.log('🚀 Test des performances de l\'algorithme de matching');
  console.log('=' .repeat(60));
  
  try {
    // Test 1: Chargement sans CV (pas de matching)
    console.log('\n📊 Test 1: Chargement sans CV (pas de matching)');
    const startTime1 = Date.now();
    const response1 = await makeRequest(`${BASE_URL}/api/jobs?page=1&limit=50&hasCV=false`);
    const endTime1 = Date.now();
    const duration1 = endTime1 - startTime1;
    
    console.log(`⏱️ Temps de réponse: ${duration1}ms`);
    console.log(`📈 Jobs retournés: ${response1.jobs?.length || 0}`);
    console.log(`📊 Total jobs disponibles: ${response1.pagination?.total || 0}`);
    
    // Test 2: Chargement avec CV (matching activé)
    console.log('\n📊 Test 2: Chargement avec CV (matching activé)');
    const startTime2 = Date.now();
    const response2 = await makeRequest(`${BASE_URL}/api/jobs?page=1&limit=50&hasCV=true`);
    const endTime2 = Date.now();
    const duration2 = endTime2 - startTime2;
    
    console.log(`⏱️ Temps de réponse: ${duration2}ms`);
    console.log(`📈 Jobs retournés: ${response2.jobs?.length || 0}`);
    console.log(`📊 Total jobs disponibles: ${response2.pagination?.total || 0}`);
    
    // Test 3: Chargement de tous les jobs avec matching
    console.log('\n📊 Test 3: Chargement de tous les jobs avec matching');
    const startTime3 = Date.now();
    const response3 = await makeRequest(`${BASE_URL}/api/jobs?page=1&limit=1000&hasCV=true`);
    const endTime3 = Date.now();
    const duration3 = endTime3 - startTime3;
    
    console.log(`⏱️ Temps de réponse: ${duration3}ms`);
    console.log(`📈 Jobs retournés: ${response3.jobs?.length || 0}`);
    console.log(`📊 Total jobs disponibles: ${response3.pagination?.total || 0}`);
    
    // Calcul des performances
    const totalJobs = response3.pagination?.total || 1000;
    const matchingJobs = response3.jobs?.length || 0;
    const jobsPerSecond = (totalJobs / (duration3 / 1000)).toFixed(0);
    
    console.log('\n📈 Résumé des performances:');
    console.log('=' .repeat(60));
    console.log(`🔢 Total jobs dans la base: ${totalJobs}`);
    console.log(`⚡ Temps de matching (1000 jobs): ${duration3}ms`);
    console.log(`🚀 Performance: ${jobsPerSecond} jobs/seconde`);
    console.log(`📊 Overhead du matching: ${duration2 - duration1}ms`);
    
    // Afficher les meilleurs matches
    if (response3.jobs && response3.jobs.length > 0) {
      console.log('\n🏆 Top 5 des meilleurs matches:');
      response3.jobs.slice(0, 5).forEach((job, index) => {
        console.log(`${index + 1}. ${job.title} chez ${job.company} - ${job.matchPercentage}%`);
      });
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
  }
}

// Lancer le test
testPerformance(); 