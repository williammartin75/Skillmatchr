const fs = require('fs');
const path = require('path');

// Test direct de l'extraction sans passer par l'API
async function testDirectExtraction() {
  try {
    const cvPath = path.join(__dirname, 'cv-lorence-antoine.pdf');
    
    if (!fs.existsSync(cvPath)) {
      console.log('❌ Fichier CV non trouvé:', cvPath);
      return;
    }
    
    console.log('📄 Test direct de l\'extraction:', cvPath);
    
    // Lire le fichier PDF
    const buffer = fs.readFileSync(cvPath);
    
    // Simuler l'extraction comme dans l'API
    console.log('🔄 Extraction du texte...');
    
    const pdfParse = require('pdf-parse');
    const result = await pdfParse(buffer);
    const extractedText = result.text;
    
    console.log(`✅ Texte extrait: ${extractedText.length} caractères`);
    
    // Simuler l'extraction des informations personnelles
    console.log('\n🔍 Extraction des informations personnelles...');
    
    // Nettoyer le nom de fichier
    const fileName = 'cv-lorence-antoine.pdf';
    const cleanFileName = fileName
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
      
      console.log(`📄 Prénom trouvé dans le texte: ${firstNameInText}`);
      console.log(`📄 Nom trouvé dans le texte: ${lastNameInText}`);
      
      if (firstNameInText || lastNameInText) {
        const firstNameLowerPattern = new RegExp(`\\b${potentialFirstName.toLowerCase()}\\b`);
        const lastNameUpperPattern = new RegExp(`\\b${potentialLastName.toUpperCase()}\\b`);
        
        const firstNameLowerInText = firstNameLowerPattern.test(extractedText);
        const lastNameUpperInText = lastNameUpperPattern.test(extractedText);
        
        console.log(`📄 Prénom en minuscules dans le texte: ${firstNameLowerInText}`);
        console.log(`📄 Nom en majuscules dans le texte: ${lastNameUpperInText}`);
        
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
    
    // Afficher un extrait du texte pour debug
    console.log('\n📝 Extrait du texte extrait (premiers 300 caractères):');
    console.log('='.repeat(50));
    console.log(extractedText.substring(0, 300));
    console.log('='.repeat(50));
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
  }
}

// Exécuter le test
testDirectExtraction(); 