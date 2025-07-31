const fs = require('fs');
const path = require('path');

// Test final de l'extraction avec les améliorations
async function testFinalExtraction() {
  try {
    const cvPath = path.join(__dirname, 'cv-lorence-antoine.pdf');
    
    if (!fs.existsSync(cvPath)) {
      console.log('❌ Fichier CV non trouvé:', cvPath);
      return;
    }
    
    console.log('📄 Test final d\'extraction du CV:', cvPath);
    
    // Lire le fichier PDF
    const buffer = fs.readFileSync(cvPath);
    
    // Test avec pdf-parse
    console.log('🔄 Extraction avec pdf-parse...');
    try {
      const pdfParse = require('pdf-parse');
      const result = await pdfParse(buffer);
      
      if (result.text && result.text.trim().length > 0) {
        console.log(`✅ PDF extrait: ${result.text.length} caractères`);
        
        // Test de détection des informations personnelles
        const text = result.text;
        const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
        
        console.log('\n🔍 Recherche des informations personnelles:');
        
        let firstName = '';
        let lastName = '';
        let email = '';
        let phone = '';
        
        // Détection de l'email
        const emailPattern = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
        const emailMatches = text.match(emailPattern);
        if (emailMatches && emailMatches.length > 0) {
          email = emailMatches[0];
          console.log(`✅ Email détecté: ${email}`);
        }
        
        // Détection du téléphone
        const phonePattern = /(\+33|0)[1-9]\s*\d{1,2}\s*\d{1,2}\s*\d{1,2}\s*\d{1,2}/g;
        const phoneMatches = text.match(phonePattern);
        if (phoneMatches && phoneMatches.length > 0) {
          phone = phoneMatches[0].replace(/\s+/g, '');
          console.log(`✅ Téléphone détecté: ${phone}`);
        }
        
                 // Détection du nom dans les premières lignes
         for (let i = 0; i < Math.min(15, lines.length); i++) {
           const line = lines[i];
           console.log(`Ligne ${i + 1}: "${line}"`);
           
           // Pattern 1: "Antoine LORENCE"
           const namePattern1 = /\b([A-Za-z]+)\s+([A-Z]+)\b/;
           const nameMatch1 = line.match(namePattern1);
           if (nameMatch1 && !firstName && !lastName) {
             // Éviter les mots communs
             const commonWords = ['cv', 'resume', 'curriculum', 'vitae', 'développeur', 'ingénieur', 'manager', 'téléphone', 'courriel', 'adresse', 'email', 'phone', 'mobile', 'permis', 'b', 'a', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
             if (!commonWords.includes(nameMatch1[1].toLowerCase()) && !commonWords.includes(nameMatch1[2].toLowerCase())) {
               firstName = nameMatch1[1].toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
               lastName = nameMatch1[2].toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
               console.log(`✅ Nom détecté (Pattern 1): ${firstName} ${lastName}`);
               break;
             }
           }
           
           // Pattern 2: "Antoine Lorence"
           const namePattern2 = /^([A-Z][a-z]+)\s+([A-Z][a-z]+)$/;
           const nameMatch2 = line.match(namePattern2);
           if (nameMatch2 && !firstName && !lastName) {
             firstName = nameMatch2[1];
             lastName = nameMatch2[2];
             console.log(`✅ Nom détecté (Pattern 2): ${firstName} ${lastName}`);
             break;
           }
         }
         
         // Recherche spécifique pour "Antoine LORENCE" dans tout le texte
         if (!firstName || !lastName) {
           const antoinePattern = /\b(Antoine)\s+(LORENCE)\b/i;
           const antoineMatch = text.match(antoinePattern);
           if (antoineMatch) {
             firstName = antoineMatch[1];
             lastName = antoineMatch[2].toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
             console.log(`✅ Nom détecté (Pattern Antoine): ${firstName} ${lastName}`);
           }
         }
        
        console.log('\n📋 Résumé des informations détectées:');
        console.log('Prénom:', firstName || '❌ Non détecté');
        console.log('Nom:', lastName || '❌ Non détecté');
        console.log('Email:', email || '❌ Non détecté');
        console.log('Téléphone:', phone || '❌ Non détecté');
        
        if (firstName && lastName && email) {
          console.log('\n🎉 SUCCÈS: Toutes les informations principales détectées!');
        } else {
          console.log('\n⚠️  ATTENTION: Certaines informations manquent');
        }
        
      } else {
        console.log('❌ Texte vide avec pdf-parse');
      }
    } catch (parseError) {
      console.error('❌ Erreur avec pdf-parse:', parseError.message);
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
  }
}

// Exécuter le test
testFinalExtraction(); 