const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

// Test de l'API d'upload de CV
async function testAPIUpload() {
  try {
    const cvPath = path.join(__dirname, 'cv-lorence-antoine.pdf');
    
    if (!fs.existsSync(cvPath)) {
      console.log('❌ Fichier CV non trouvé:', cvPath);
      return;
    }
    
    console.log('📄 Test de l\'API d\'upload de CV:', cvPath);
    
    // Créer un FormData
    const formData = new FormData();
    const fileBuffer = fs.readFileSync(cvPath);
    
    // Ajouter le fichier au FormData
    formData.append('cv', fileBuffer, {
      filename: 'cv-lorence-antoine.pdf',
      contentType: 'application/pdf'
    });
    
    console.log('🔄 Envoi de la requête à l\'API...');
    
    // Faire l'appel à l'API
    const response = await fetch('http://localhost:3000/api/cv-upload', {
      method: 'POST',
      body: formData
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Réponse de l\'API reçue');
      
      console.log('\n📋 Résultat de l\'extraction:');
      console.log('Succès:', result.success);
      console.log('Nom de fichier:', result.fileName);
      
      if (result.analysis && result.analysis.personalInfo) {
        const personalInfo = result.analysis.personalInfo;
        console.log('\n👤 Informations personnelles détectées:');
        console.log('Prénom:', personalInfo.firstName || '❌ Non détecté');
        console.log('Nom:', personalInfo.lastName || '❌ Non détecté');
        console.log('Email:', personalInfo.email || '❌ Non détecté');
        console.log('Téléphone:', personalInfo.phone || '❌ Non détecté');
        
        if (personalInfo.firstName && personalInfo.lastName && personalInfo.email) {
          console.log('\n🎉 SUCCÈS: Toutes les informations principales détectées!');
          console.log('✅ Le formulaire d\'inscription sera pré-rempli avec:');
          console.log(`   - Prénom: ${personalInfo.firstName}`);
          console.log(`   - Nom: ${personalInfo.lastName}`);
          console.log(`   - Email: ${personalInfo.email}`);
          if (personalInfo.phone) {
            console.log(`   - Téléphone: ${personalInfo.phone}`);
          }
        } else {
          console.log('\n⚠️  ATTENTION: Certaines informations manquent');
        }
      } else {
        console.log('❌ Aucune information personnelle dans la réponse');
      }
      
      // Afficher les logs de debug si disponibles
      if (result.extractedText) {
        console.log('\n📝 Premiers 200 caractères du texte extrait:');
        console.log(result.extractedText.substring(0, 200) + '...');
      }
      
    } else {
      console.error('❌ Erreur API:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('Détails:', errorText);
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
  }
}

// Exécuter le test
testAPIUpload(); 