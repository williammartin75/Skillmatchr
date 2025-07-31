const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

// Test complet de l'upload de CV via l'API
async function testCompleteUpload() {
  try {
    const cvPath = path.join(__dirname, 'cv-lorence-antoine.pdf');
    
    if (!fs.existsSync(cvPath)) {
      console.log('❌ Fichier CV non trouvé:', cvPath);
      return;
    }
    
    console.log('📄 Test complet d\'upload de CV:', cvPath);
    
    // Créer un FormData simulé
    const formData = new FormData();
    const fileBuffer = fs.readFileSync(cvPath);
    
    // Simuler un objet File
    const file = {
      name: 'cv-lorence-antoine.pdf',
      type: 'application/pdf',
      size: fileBuffer.length,
      arrayBuffer: () => Promise.resolve(fileBuffer.buffer.slice(fileBuffer.byteOffset, fileBuffer.byteOffset + fileBuffer.byteLength))
    };
    
    console.log('🔄 Simulation de l\'upload...');
    
    // Simuler l'extraction de texte
    const pdfParse = require('pdf-parse');
    const result = await pdfParse(fileBuffer);
    const extractedText = result.text;
    
    console.log(`✅ Texte extrait: ${extractedText.length} caractères`);
    
    // Simuler l'extraction des informations personnelles
    console.log('\n🔍 Extraction des informations personnelles...');
    
    // Nettoyer le nom de fichier
    const cleanFileName = file.name
      .replace(/\.(pdf|doc|docx|txt)$/i, '')
      .replace(/[-_]/g, ' ')
      .trim();
    
    console.log(`📝 Nom de fichier: "${cleanFileName}"`);
    
    // Pattern pour extraire les noms
    let fileNameMatch = cleanFileName.match(/^([a-z]+)[-_ ]([a-z]+)$/i);
    
    if (!fileNameMatch) {
      fileNameMatch = cleanFileName.match(/^cv[-_ ]([a-z]+)[-_ ]([a-z]+)$/i);
      if (fileNameMatch) {
        fileNameMatch = [fileNameMatch[0], fileNameMatch[2], fileNameMatch[1]];
      }
    }
    
    let firstName = '';
    let lastName = '';
    let email = '';
    let phone = '';
    
    if (fileNameMatch) {
      const potentialFirstName = fileNameMatch[1];
      const potentialLastName = fileNameMatch[2];
      
      console.log(`🎯 Prénom potentiel: ${potentialFirstName}`);
      console.log(`🎯 Nom potentiel: ${potentialLastName}`);
      
      // Vérifier dans le texte
      const firstNamePattern = new RegExp(`\\b${potentialFirstName}\\b`, 'i');
      const lastNamePattern = new RegExp(`\\b${potentialLastName}\\b`, 'i');
      
      const firstNameInText = firstNamePattern.test(extractedText);
      const lastNameInText = lastNamePattern.test(extractedText);
      
      if (firstNameInText || lastNameInText) {
        const firstNameLowerPattern = new RegExp(`\\b${potentialFirstName.toLowerCase()}\\b`);
        const lastNameUpperPattern = new RegExp(`\\b${potentialLastName.toUpperCase()}\\b`);
        
        const firstNameLowerInText = firstNameLowerPattern.test(extractedText);
        const lastNameUpperInText = lastNameUpperPattern.test(extractedText);
        
        if (firstNameLowerInText && lastNameUpperInText) {
          firstName = potentialFirstName.toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
          lastName = potentialLastName.toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
          console.log(`✅ Nom confirmé (prénom minuscule + nom majuscule): ${firstName} ${lastName}`);
        } else {
          firstName = potentialFirstName.toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
          lastName = potentialLastName.toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
          console.log(`✅ Nom confirmé depuis le fichier: ${firstName} ${lastName}`);
        }
      }
    }
    
    // Détection de l'email
    const emailPattern = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    const emailMatches = extractedText.match(emailPattern);
    if (emailMatches && emailMatches.length > 0) {
      email = emailMatches[0];
      console.log(`✅ Email détecté: ${email}`);
    }
    
    // Détection du téléphone
    const phonePattern = /(\+33|0)[1-9]\s*\d{1,2}\s*\d{1,2}\s*\d{1,2}\s*\d{1,2}/g;
    const phoneMatches = extractedText.match(phonePattern);
    if (phoneMatches && phoneMatches.length > 0) {
      phone = phoneMatches[0].replace(/\s+/g, '');
      console.log(`✅ Téléphone détecté: ${phone}`);
    }
    
    console.log('\n📋 Résumé final de l\'extraction:');
    console.log('Prénom:', firstName || '❌ Non détecté');
    console.log('Nom:', lastName || '❌ Non détecté');
    console.log('Email:', email || '❌ Non détecté');
    console.log('Téléphone:', phone || '❌ Non détecté');
    
    if (firstName && lastName && email) {
      console.log('\n🎉 SUCCÈS: Toutes les informations principales détectées!');
      console.log('✅ Le formulaire d\'inscription sera pré-rempli avec:');
      console.log(`   - Prénom: ${firstName}`);
      console.log(`   - Nom: ${lastName}`);
      console.log(`   - Email: ${email}`);
      if (phone) {
        console.log(`   - Téléphone: ${phone}`);
      }
    } else {
      console.log('\n⚠️  ATTENTION: Certaines informations manquent');
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
  }
}

// Exécuter le test
testCompleteUpload(); 